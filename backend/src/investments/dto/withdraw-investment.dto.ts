import { ApiProperty } from '@nestjs/swagger';
import { Matches } from 'class-validator';

export class WithdrawInvestmentDto {
  @ApiProperty({
    example: '2026-08-07',
    description:
      'Data do saque (YYYY-MM-DD). Não pode ser anterior à criação do investimento nem no futuro.',
  })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'withdrawalDate deve estar no formato YYYY-MM-DD',
  })
  withdrawalDate: string;
}
