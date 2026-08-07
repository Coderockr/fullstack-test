import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CreateInvestmentDto } from './dto/create-investment.dto';
import {
  InvestmentResponseDto,
  PaginatedInvestmentsDto,
} from './dto/investment-response.dto';
import { ListInvestmentsQueryDto } from './dto/list-investments-query.dto';
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
}
