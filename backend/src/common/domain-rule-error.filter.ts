import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';
import { DomainRuleError } from '../investments/domain/investment-math';

/**
 * Traduz violações de regra de negócio (DomainRuleError) em respostas HTTP.
 * O domínio não conhece HTTP; o mapeamento código → status vive só aqui.
 */
@Catch(DomainRuleError)
export class DomainRuleErrorFilter implements ExceptionFilter {
  catch(error: DomainRuleError, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const status =
      error.code === 'ALREADY_WITHDRAWN'
        ? HttpStatus.CONFLICT
        : HttpStatus.BAD_REQUEST;
    response.status(status).json({
      statusCode: status,
      error: error.code,
      message: error.message,
    });
  }
}
