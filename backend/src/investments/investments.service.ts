import { Injectable } from '@nestjs/common';
import type { Investment } from '../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  assertValidCreation,
  balanceCents,
  type IsoDate,
} from './domain/investment-math';
import { CreateInvestmentDto } from './dto/create-investment.dto';
import {
  InvestmentResponseDto,
  PaginatedInvestmentsDto,
} from './dto/investment-response.dto';
import { ListInvestmentsQueryDto } from './dto/list-investments-query.dto';

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
