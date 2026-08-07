import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateInvestmentDto {
  @ApiProperty({
    example: 'Maria da Silva',
    description: 'Dono do investimento',
    maxLength: 120,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  owner: string;

  @ApiProperty({
    example: 100000,
    description:
      'Valor inicial em centavos (R$ 1.000,00 = 100000). Não pode ser negativo.',
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  amountCents: number;

  @ApiProperty({
    example: '2024-01-31',
    description:
      'Data de criação no formato YYYY-MM-DD. Hoje ou uma data no passado.',
  })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'creationDate deve estar no formato YYYY-MM-DD',
  })
  creationDate: string;
}
