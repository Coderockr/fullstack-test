/**
 * Pure domain math for investments. No framework, no I/O, no clock:
 * "today" is always an explicit parameter.
 *
 * Conventions (documented in the README/PR):
 * - Money is integer cents (R$ 1.000,00 = 100000). Rounding: Math.round,
 *   applied once per derived value (balance, tax), never accumulated.
 * - Dates are ISO strings (YYYY-MM-DD); lexicographic comparison equals
 *   chronological comparison, so no Date/timezone handling is needed.
 * - Gain is compound: 0.52% for each *completed* month, counted on the
 *   same day-of-month of the creation date. When that day does not exist
 *   in a month (e.g. Jan 31 → Feb), the month completes on the last day
 *   of that month. Anniversaries for the tax brackets follow the same rule.
 */

// Constante de ganho mensal 0.52%
export const MONTHLY_GAIN_RATE = 0.0052;

// Aliquotas de tributação constantes também.
export const TAX_RATES = {
  underOneYear: 0.225,
  betweenOneAndTwoYears: 0.185,
  overTwoYears: 0.15,
} as const;

// ISO date é uma string no formato YYYY-MM-DD
export type IsoDate = string;
// DomainRuleCode é um tipo que representa um código de erro de regra de domínio
export type DomainRuleCode =
  | 'INVALID_AMOUNT'
  | 'INVALID_DATE'
  | 'CREATION_IN_FUTURE'
  | 'WITHDRAWAL_BEFORE_CREATION'
  | 'WITHDRAWAL_IN_FUTURE'
  | 'ALREADY_WITHDRAWN';

// DomainRuleError é uma classe que representa um erro de regra de domínio
export class DomainRuleError extends Error {
  constructor(
    // Código do erro de regra de domínio
    readonly code: DomainRuleCode,
    // Mensagem de erro
    message: string,
  ) {
    // Chama o construtor da classe Error
    super(message);
    // Nome da classe
    this.name = 'DomainRuleError';
  }
}

// CalendarDate é uma interface que representa uma data no calendário
interface CalendarDate {
  // Ano
  year: number;
  // Mês
  month: number;
  // Dia
  day: number;
}

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
// daysInMonth é uma função que retorna o número de dias em um mês
function daysInMonth(year: number, month: number): number {
  // Retorna o número de dias em um mês
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

// parse é uma função que converte uma string ISO em um objeto CalendarDate
function parse(date: IsoDate): CalendarDate {
  // Verifica se a string ISO é válida
  if (!ISO_DATE_PATTERN.test(date)) {
    throw new DomainRuleError('INVALID_DATE', `Invalid date format: ${date}`);
  }
  // Converte a string ISO em um array de números
  const [year, month, day] = date.split('-').map(Number);
  if (month < 1 || month > 12 || day < 1 || day > daysInMonth(year, month)) {
    throw new DomainRuleError('INVALID_DATE', `Invalid calendar date: ${date}`);
  }
  // Retorna o objeto CalendarDate
  return { year, month, day };
}

// toIso é uma função que converte um objeto CalendarDate em uma string ISO
function toIso({ year, month, day }: CalendarDate): IsoDate {
  // Converte o mês em uma string de 2 dígitos
  const mm = String(month).padStart(2, '0');
  // Converte o dia em uma string de 2 dígitos
  const dd = String(day).padStart(2, '0');
  // Retorna a string ISO
  return `${year}-${mm}-${dd}`;
}

// addMonthsClamped é uma função que adiciona um número de meses a uma string ISO e retorna uma string ISO
function addMonthsClamped(date: IsoDate, months: number): IsoDate {
  // Converte a string ISO em um objeto CalendarDate
  const { year, month, day } = parse(date);
  // Calcula o total de meses
  const total = year * 12 + (month - 1) + months;
  // Calcula o ano alvo
  const targetYear = Math.floor(total / 12);
  // Calcula o mês alvo
  const targetMonth = (total % 12) + 1;
  // Converte o objeto CalendarDate em uma string ISO
  return toIso({
    year: targetYear,
    month: targetMonth,
    // O dia é o mínimo entre o dia atual e o número de dias no mês alvo
    day: Math.min(day, daysInMonth(targetYear, targetMonth)),
  });
}

/**
 * Number of monthly gain payments between creation and reference date:
 * how many times the (clamped) anniversary day has passed, inclusive.
 */
// completedMonths é uma função que retorna o número de meses completos entre uma data de criação e uma data de referência
    export function completedMonths(
  // Data de criação
  creationDate: IsoDate,
  // Data de referência
  referenceDate: IsoDate,
): number {
  // Converte a string ISO em um objeto CalendarDate
  const creation = parse(creationDate);
  // Converte a string ISO em um objeto CalendarDate
  const reference = parse(referenceDate);
  // Calcula o total de meses
  let months =
    (reference.year - creation.year) * 12 + (reference.month - creation.month);
  // Se a data de criação mais o total de meses é maior que a data de referência, subtrai 1 mês
  if (addMonthsClamped(creationDate, months) > referenceDate) {
    months -= 1;
  }
  // Retorna o número de meses completos
  return Math.max(0, months);
}

// balanceCents é uma função que calcula o saldo em centavos entre uma data de criação e uma data de referência
export function balanceCents(
  // Saldo inicial em centavos
  initialCents: number,
  // Data de criação
  creationDate: IsoDate,
  // Data de referência
  referenceDate: IsoDate,
): number {
  // Calcula o número de meses completos
  const months = completedMonths(creationDate, referenceDate);
  // Retorna o saldo em centavos
  return Math.round(initialCents * (1 + MONTHLY_GAIN_RATE) ** months);
}

// gainCents é uma função que calcula o ganho em centavos entre uma data de criação e uma data de referência
export function gainCents(
  // Saldo inicial em centavos
  initialCents: number,
  // Data de criação
  creationDate: IsoDate,
  // Data de referência
  referenceDate: IsoDate,
): number {
  // Retorna o ganho em centavos
  return balanceCents(initialCents, creationDate, referenceDate) - initialCents;
}

/**
 * Bracket boundaries use calendar anniversaries (same clamp rule as the
 * monthly gain): exactly 1 year old pays 18.5%; exactly 2 years old pays
 * 18.5%; 15% only after the second anniversary has passed.
 */
// taxRate é uma função que calcula a alíquota de tributação entre uma data de criação e uma data de retirada
export function taxRate(
  // Data de criação
  creationDate: IsoDate,
  // Data de retirada
  withdrawalDate: IsoDate,
): number {
  // Calcula a data do primeiro aniversário
  const firstAnniversary = addMonthsClamped(creationDate, 12);
  // Calcula a data do segundo aniversário
  const secondAnniversary = addMonthsClamped(creationDate, 24);
  // Se a data de retirada é antes do primeiro aniversário, retorna a alíquota de tributação para menos de 1 ano
  if (withdrawalDate < firstAnniversary) return TAX_RATES.underOneYear;
  // Se a data de retirada é antes ou no segundo aniversário, retorna a alíquota de tributação para entre 1 e 2 anos
  if (withdrawalDate <= secondAnniversary)
    return TAX_RATES.betweenOneAndTwoYears;
  // Se a data de retirada é depois do segundo aniversário, retorna a alíquota de tributação para mais de 2 anos
  return TAX_RATES.overTwoYears;
}

// WithdrawalBreakdown é uma interface que representa o resultado de uma retirada 
export interface WithdrawalBreakdown {
  // Saldo em centavos
  balanceCents: number;
  // Ganho em centavos
  gainCents: number;
  // Alíquota de tributação
  taxRate: number;
  // Imposto em centavos
  taxCents: number;
  // Saldo líquido em centavos
  netCents: number;
}

// computeWithdrawal é uma função que calcula o resultado de uma retirada
export function computeWithdrawal(
  // Saldo inicial em centavos
  initialCents: number,
  // Data de criação
  creationDate: IsoDate,
  // Data de retirada
  withdrawalDate: IsoDate,
): WithdrawalBreakdown {
  // Calcula o saldo em centavos
  const balance = balanceCents(initialCents, creationDate, withdrawalDate);
  // Calcula o ganho em centavos
  const gain = balance - initialCents;
  // Calcula a alíquota de tributação
  const rate = taxRate(creationDate, withdrawalDate);
  // Calcula o imposto em centavos
  const tax = Math.round(gain * rate);
  // Retorna o resultado de uma retirada
  return {
    balanceCents: balance,
    gainCents: gain,
    // Alíquota de tributação
    taxRate: rate,
    // Imposto em centavos
    taxCents: tax,
    // Saldo líquido em centavos
    netCents: balance - tax,
  };
}

// assertValidCreation é uma função que verifica se a criação de um investimento é válida
export function assertValidCreation(
  // Saldo inicial em centavos
  amountCents: number,
  // Data de criação
  creationDate: IsoDate,
  // Data de hoje
  today: IsoDate,
): void {
  // Converte a string ISO em um objeto CalendarDate
  parse(creationDate);
  // Converte a string ISO em um objeto CalendarDate
  parse(today);
  // Verifica se o saldo inicial é um número inteiro seguro e não negativo
  if (!Number.isSafeInteger(amountCents) || amountCents < 0) {
    // Lança um erro de regra de domínio
    throw new DomainRuleError(
      'INVALID_AMOUNT',
      'Investment amount must be a non-negative integer amount of cents',
    );
  }
  // Verifica se a data de criação é maior que a data de hoje
  if (creationDate > today) {
    // Lança um erro de regra de domínio
    throw new DomainRuleError(
      'CREATION_IN_FUTURE',
      'Creation date must be today or in the past',
    );
  }
}

// assertValidWithdrawal é uma função que verifica se uma retirada é válida
export function assertValidWithdrawal(params: {
  // Data de criação
  creationDate: IsoDate;
  // Data de retirada
  withdrawalDate: IsoDate;
  // Data de hoje
  today: IsoDate;
  // Data de retirada já realizada
  withdrawnAt?: IsoDate | null;
}): void {
  const { creationDate, withdrawalDate, today, withdrawnAt } = params;
  // Converte a string ISO em um objeto CalendarDate
  parse(creationDate);
  // Converte a string ISO em um objeto CalendarDate
  parse(withdrawalDate);
  // Converte a string ISO em um objeto CalendarDate
  parse(today);
  if (withdrawnAt) {
    // Lança um erro de regra de domínio
    throw new DomainRuleError(
      'ALREADY_WITHDRAWN',
      'Investment has already been withdrawn; partial or repeated withdrawals are not supported',
    );
  }
  if (withdrawalDate < creationDate) {
    // Lança um erro de regra de domínio
    throw new DomainRuleError(
      'WITHDRAWAL_BEFORE_CREATION',
      'Withdrawal date cannot be before the investment creation date',
    );
  }
  if (withdrawalDate > today) {
    // Lança um erro de regra de domínio
    throw new DomainRuleError(
      'WITHDRAWAL_IN_FUTURE',
      'Withdrawal date cannot be in the future',
    );
  }
}
