import { ApiProperty } from '@nestjs/swagger';

export class InvestmentResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ example: 'Maria da Silva' })
  owner: string;

  @ApiProperty({
    example: '2024-01-31',
    description: 'Data de criação (YYYY-MM-DD)',
  })
  creationDate: string;

  @ApiProperty({ example: 100000, description: 'Valor inicial em centavos' })
  amountCents: number;

  @ApiProperty({
    example: 100520,
    description:
      'Saldo esperado em centavos: valor inicial + ganhos compostos. ' +
      'Se o investimento já foi sacado, reflete o saldo na data do saque.',
  })
  balanceCents: number;

  @ApiProperty({ enum: ['ACTIVE', 'WITHDRAWN'] })
  status: 'ACTIVE' | 'WITHDRAWN';

  @ApiProperty({
    example: null,
    nullable: true,
    description: 'Data do saque (YYYY-MM-DD) ou null se ainda ativo',
  })
  withdrawnAt: string | null;
}

export class WithdrawalResultDto {
  @ApiProperty({
    example: '2026-08-07',
    description: 'Data do saque (YYYY-MM-DD)',
  })
  withdrawalDate: string;

  @ApiProperty({
    example: 120528,
    description: 'Saldo bruto na data do saque, em centavos',
  })
  balanceCents: number;

  @ApiProperty({
    example: 20528,
    description: 'Ganho na data do saque, em centavos',
  })
  gainCents: number;

  @ApiProperty({
    example: 0.15,
    description:
      'Alíquota aplicada sobre o ganho, conforme a idade do investimento: ' +
      '< 1 ano → 0.225; entre 1 e 2 anos → 0.185; > 2 anos → 0.15',
  })
  taxRate: number;

  @ApiProperty({
    example: 3079,
    description: 'Imposto em centavos (incide só sobre o ganho)',
  })
  taxCents: number;

  @ApiProperty({
    example: 117449,
    description: 'Valor líquido recebido, em centavos',
  })
  netCents: number;
}

export class InvestmentDetailDto extends InvestmentResponseDto {
  @ApiProperty({
    example: 520,
    description: 'Ganho acumulado em centavos (saldo − valor inicial)',
  })
  gainCents: number;

  @ApiProperty({
    type: WithdrawalResultDto,
    nullable: true,
    description:
      'Detalhes do saque, ou null se o investimento ainda está ativo',
  })
  withdrawal: WithdrawalResultDto | null;
}

export class TimelinePointDto {
  @ApiProperty({ example: '2024-02-29', description: 'Data do aniversário mensal (YYYY-MM-DD)' })
  date: string;

  @ApiProperty({ example: 1, description: 'Quantidade de meses completos nesse ponto' })
  monthIndex: number;

  @ApiProperty({ example: 100520, description: 'Saldo em centavos nesse ponto' })
  balanceCents: number;

  @ApiProperty({
    example: false,
    description: 'true = projeção futura; false = ganho já realizado',
  })
  projected: boolean;
}

export class TimelineDto {
  @ApiProperty({ type: [TimelinePointDto] })
  points: TimelinePointDto[];
}

export class PaginatedInvestmentsDto {
  @ApiProperty({ type: [InvestmentResponseDto] })
  data: InvestmentResponseDto[];

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 42, description: 'Total de registros no filtro' })
  total: number;

  @ApiProperty({ example: 5 })
  totalPages: number;
}
