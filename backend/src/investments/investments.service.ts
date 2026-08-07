import { Injectable, NotFoundException } from '@nestjs/common';
import type { Investment } from '../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  addMonthsClamped,
  assertValidCreation,
  assertValidWithdrawal,
  balanceCents,
  completedMonths,
  computeWithdrawal,
  DomainRuleError,
  type IsoDate,
} from './domain/investment-math';
import { CreateInvestmentDto } from './dto/create-investment.dto';
import {
  InvestmentDetailDto,
  InvestmentResponseDto,
  PaginatedInvestmentsDto,
  TimelineDto,
  WithdrawalResultDto,
} from './dto/investment-response.dto';
import { ListInvestmentsQueryDto } from './dto/list-investments-query.dto';
import { WithdrawInvestmentDto } from './dto/withdraw-investment.dto';

@Injectable()
export class InvestmentsService {
  constructor(private readonly prisma: PrismaService) {}

  // "Hoje" em UTC; único ponto onde o relógio entra — o domínio permanece puro
  private todayIso(): IsoDate {
    return new Date().toISOString().slice(0, 10);
  }

  // Colunas DATE viajam como Date em meia-noite UTC; conversão explícita nas bordas
  private toDbDate(iso: IsoDate): Date {
    return new Date(`${iso}T00:00:00.000Z`);
  }

  private fromDbDate(date: Date): IsoDate {
    return date.toISOString().slice(0, 10);
  }

  private toResponse(
    investment: Investment,
    today: IsoDate,
  ): InvestmentResponseDto {
    const creationDate = this.fromDbDate(investment.creationDate);
    const withdrawnAt = investment.withdrawnAt
      ? this.fromDbDate(investment.withdrawnAt)
      : null;
    const amountCents = Number(investment.amountCents);
    return {
      id: investment.id,
      owner: investment.owner,
      creationDate,
      amountCents,
      // sacado: saldo congelado na data do saque; ativo: saldo até hoje
      balanceCents: balanceCents(
        amountCents,
        creationDate,
        withdrawnAt ?? today,
      ),
      status: withdrawnAt ? 'WITHDRAWN' : 'ACTIVE',
      withdrawnAt,
    };
  }

  private toDetail(
    investment: Investment,
    today: IsoDate,
  ): InvestmentDetailDto {
    const base = this.toResponse(investment, today);
    const withdrawnAt = base.withdrawnAt;
    return {
      ...base,
      gainCents: base.balanceCents - base.amountCents,
      withdrawal: withdrawnAt
        ? {
            withdrawalDate: withdrawnAt,
            ...computeWithdrawal(
              base.amountCents,
              base.creationDate,
              withdrawnAt,
            ),
          }
        : null,
    };
  }

  async findOne(id: string): Promise<InvestmentDetailDto> {
    const investment = await this.prisma.investment.findUnique({
      where: { id },
    });
    if (!investment) {
      throw new NotFoundException(`Investment ${id} not found`);
    }
    return this.toDetail(investment, this.todayIso());
  }

  async withdraw(
    id: string,
    dto: WithdrawInvestmentDto,
  ): Promise<InvestmentDetailDto> {
    const today = this.todayIso();
    const investment = await this.prisma.investment.findUnique({
      where: { id },
    });
    if (!investment) {
      throw new NotFoundException(`Investment ${id} not found`);
    }
    assertValidWithdrawal({
      creationDate: this.fromDbDate(investment.creationDate),
      withdrawalDate: dto.withdrawalDate,
      today,
      withdrawnAt: investment.withdrawnAt
        ? this.fromDbDate(investment.withdrawnAt)
        : null,
    });
    // `withdrawnAt: null` no where torna o update atômico: se duas requisições
    // concorrerem, só uma grava; a outra cai no count 0
    const updated = await this.prisma.investment.updateMany({
      where: { id, withdrawnAt: null },
      data: { withdrawnAt: this.toDbDate(dto.withdrawalDate) },
    });
    if (updated.count === 0) {
      throw new DomainRuleError(
        'ALREADY_WITHDRAWN',
        'Investment has already been withdrawn; partial or repeated withdrawals are not supported',
      );
    }
    return this.findOne(id);
  }

  // Mesmas validações e conta do saque real, sem gravar nada:
  // é o que alimenta a tela de "simular antes de confirmar"
  async previewWithdrawal(
    id: string,
    dto: WithdrawInvestmentDto,
  ): Promise<WithdrawalResultDto> {
    const today = this.todayIso();
    const investment = await this.prisma.investment.findUnique({
      where: { id },
    });
    if (!investment) {
      throw new NotFoundException(`Investment ${id} not found`);
    }
    assertValidWithdrawal({
      creationDate: this.fromDbDate(investment.creationDate),
      withdrawalDate: dto.withdrawalDate,
      today,
      withdrawnAt: investment.withdrawnAt
        ? this.fromDbDate(investment.withdrawnAt)
        : null,
    });
    return {
      withdrawalDate: dto.withdrawalDate,
      ...computeWithdrawal(
        Number(investment.amountCents),
        this.fromDbDate(investment.creationDate),
        dto.withdrawalDate,
      ),
    };
  }

  // Série mensal de saldo nas datas de aniversário (as datas em que o ganho
  // é pago). Para investimentos ativos, projeta 12 meses à frente.
  async timeline(id: string): Promise<TimelineDto> {
    const today = this.todayIso();
    const investment = await this.prisma.investment.findUnique({
      where: { id },
    });
    if (!investment) {
      throw new NotFoundException(`Investment ${id} not found`);
    }
    const creationDate = this.fromDbDate(investment.creationDate);
    const withdrawnAt = investment.withdrawnAt
      ? this.fromDbDate(investment.withdrawnAt)
      : null;
    const amountCents = Number(investment.amountCents);
    const endDate = withdrawnAt ?? today;
    const realizedMonths = completedMonths(creationDate, endDate);
    const projectedMonths = withdrawnAt ? 0 : 12;
    const points = Array.from(
      { length: realizedMonths + projectedMonths + 1 },
      (_, monthIndex) => {
        const date = addMonthsClamped(creationDate, monthIndex);
        return {
          date,
          monthIndex,
          balanceCents: balanceCents(amountCents, creationDate, date),
          projected: monthIndex > realizedMonths,
        };
      },
    );
    return { points };
  }

  async create(dto: CreateInvestmentDto): Promise<InvestmentResponseDto> {
    const today = this.todayIso();
    assertValidCreation(dto.amountCents, dto.creationDate, today);
    const created = await this.prisma.investment.create({
      data: {
        owner: dto.owner.trim(),
        amountCents: BigInt(dto.amountCents),
        creationDate: this.toDbDate(dto.creationDate),
      },
    });
    return this.toResponse(created, today);
  }

  async list(query: ListInvestmentsQueryDto): Promise<PaginatedInvestmentsDto> {
    const today = this.todayIso();
    const where = query.owner ? { owner: query.owner } : {};
    const [total, rows] = await this.prisma.$transaction([
      this.prisma.investment.count({ where }),
      this.prisma.investment.findMany({
        where,
        orderBy: [{ creationDate: 'desc' }, { id: 'desc' }],
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
    ]);
    return {
      data: rows.map((row) => this.toResponse(row, today)),
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit),
    };
  }
}
