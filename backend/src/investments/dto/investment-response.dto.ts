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
