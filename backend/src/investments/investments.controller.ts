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
  TimelineDto,
  WithdrawalResultDto,
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

  @Get(':id/withdrawal-preview')
  @ApiOperation({
    summary: 'Simula um saque sem executá-lo',
    description:
      'Mesmas validações e cálculo do saque real (saldo, alíquota, imposto e ' +
      'líquido), mas nada é gravado. Alimenta a confirmação no frontend.',
  })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ type: WithdrawalResultDto })
  @ApiNotFoundResponse({ description: 'Investimento não encontrado' })
  @ApiBadRequestResponse({
    description: 'Data mal formada, anterior à criação ou no futuro',
  })
  @ApiConflictResponse({ description: 'Investimento já foi sacado' })
  previewWithdrawal(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Query() query: WithdrawInvestmentDto,
  ): Promise<WithdrawalResultDto> {
    return this.investmentsService.previewWithdrawal(id, query);
  }

  @Get(':id/timeline')
  @ApiOperation({
    summary: 'Série mensal de saldo do investimento',
    description:
      'Saldo em cada aniversário mensal (datas em que o ganho é pago). ' +
      'Investimentos ativos incluem 12 meses de projeção futura.',
  })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ type: TimelineDto })
  @ApiNotFoundResponse({ description: 'Investimento não encontrado' })
  timeline(@Param('id', new ParseUUIDPipe()) id: string): Promise<TimelineDto> {
    return this.investmentsService.timeline(id);
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
