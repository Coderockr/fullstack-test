import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { CreateInvestmentDto } from './dto/create-investment.dto';
import {
  InvestmentDetailDto,
  InvestmentResponseDto,
  PaginatedInvestmentsDto,
} from './dto/investment-response.dto';
import { ListInvestmentsQueryDto } from './dto/list-investments-query.dto';
import { WithdrawInvestmentDto } from './dto/withdraw-investment.dto';
import { InvestmentsService } from './investments.service';

@ApiTags('investments')
@Controller('investments')
export class InvestmentsController {
  constructor(private readonly investmentsService: InvestmentsService) {}

  @Post()
  @ApiOperation({ summary: 'Cria um investimento' })
  @ApiCreatedResponse({ type: InvestmentResponseDto })
  @ApiBadRequestResponse({
    description:
      'Valor negativo, data mal formada ou data de criação no futuro',
  })
  create(@Body() dto: CreateInvestmentDto): Promise<InvestmentResponseDto> {
    return this.investmentsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lista investimentos com paginação' })
  @ApiOkResponse({ type: PaginatedInvestmentsDto })
  list(
    @Query() query: ListInvestmentsQueryDto,
  ): Promise<PaginatedInvestmentsDto> {
    return this.investmentsService.list(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Detalha um investimento',
    description:
      'Retorna valor inicial, saldo esperado e ganho acumulado. Se já sacado, ' +
      'o saldo fica congelado na data do saque e os detalhes do saque são incluídos.',
  })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ type: InvestmentDetailDto })
  @ApiNotFoundResponse({ description: 'Investimento não encontrado' })
  findOne(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<InvestmentDetailDto> {
    return this.investmentsService.findOne(id);
  }

  @Post(':id/withdraw')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Saca um investimento (sempre o valor total)',
    description:
      'O imposto incide apenas sobre o ganho, conforme a idade do investimento ' +
      'na data do saque. Saque parcial não é suportado.',
  })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ type: InvestmentDetailDto })
  @ApiNotFoundResponse({ description: 'Investimento não encontrado' })
  @ApiBadRequestResponse({
    description: 'Data mal formada, anterior à criação ou no futuro',
  })
  @ApiConflictResponse({ description: 'Investimento já foi sacado' })
  withdraw(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: WithdrawInvestmentDto,
  ): Promise<InvestmentDetailDto> {
    return this.investmentsService.withdraw(id, dto);
  }
}
