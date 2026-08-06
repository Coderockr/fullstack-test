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

export const MONTHLY_GAIN_RATE = 0.0052;

export const TAX_RATES = {
  underOneYear: 0.225,
  betweenOneAndTwoYears: 0.185,
  overTwoYears: 0.15,
} as const;

export type IsoDate = string;

export type DomainRuleCode =
  | 'INVALID_AMOUNT'
  | 'INVALID_DATE'
  | 'CREATION_IN_FUTURE'
  | 'WITHDRAWAL_BEFORE_CREATION'
  | 'WITHDRAWAL_IN_FUTURE'
  | 'ALREADY_WITHDRAWN';

export class DomainRuleError extends Error {
  constructor(
    readonly code: DomainRuleCode,
    message: string,
  ) {
    super(message);
    this.name = 'DomainRuleError';
  }
}

interface CalendarDate {
  year: number;
  month: number;
  day: number;
}

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function parse(date: IsoDate): CalendarDate {
  if (!ISO_DATE_PATTERN.test(date)) {
    throw new DomainRuleError('INVALID_DATE', `Invalid date format: ${date}`);
  }
  const [year, month, day] = date.split('-').map(Number);
  if (month < 1 || month > 12 || day < 1 || day > daysInMonth(year, month)) {
    throw new DomainRuleError('INVALID_DATE', `Invalid calendar date: ${date}`);
  }
  return { year, month, day };
}

function toIso({ year, month, day }: CalendarDate): IsoDate {
  const mm = String(month).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  return `${year}-${mm}-${dd}`;
}

function addMonthsClamped(date: IsoDate, months: number): IsoDate {
  const { year, month, day } = parse(date);
  const total = year * 12 + (month - 1) + months;
  const targetYear = Math.floor(total / 12);
  const targetMonth = (total % 12) + 1;
  return toIso({
    year: targetYear,
    month: targetMonth,
    day: Math.min(day, daysInMonth(targetYear, targetMonth)),
  });
}

/**
 * Number of monthly gain payments between creation and reference date:
 * how many times the (clamped) anniversary day has passed, inclusive.
 */
export function completedMonths(
  creationDate: IsoDate,
  referenceDate: IsoDate,
): number {
  const creation = parse(creationDate);
  const reference = parse(referenceDate);
  let months =
    (reference.year - creation.year) * 12 + (reference.month - creation.month);
  if (addMonthsClamped(creationDate, months) > referenceDate) {
    months -= 1;
  }
  return Math.max(0, months);
}

export function balanceCents(
  initialCents: number,
  creationDate: IsoDate,
  referenceDate: IsoDate,
): number {
  const months = completedMonths(creationDate, referenceDate);
  return Math.round(initialCents * (1 + MONTHLY_GAIN_RATE) ** months);
}

export function gainCents(
  initialCents: number,
  creationDate: IsoDate,
  referenceDate: IsoDate,
): number {
  return balanceCents(initialCents, creationDate, referenceDate) - initialCents;
}

/**
 * Bracket boundaries use calendar anniversaries (same clamp rule as the
 * monthly gain): exactly 1 year old pays 18.5%; exactly 2 years old pays
 * 18.5%; 15% only after the second anniversary has passed.
 */
export function taxRate(
  creationDate: IsoDate,
  withdrawalDate: IsoDate,
): number {
  const firstAnniversary = addMonthsClamped(creationDate, 12);
  const secondAnniversary = addMonthsClamped(creationDate, 24);
  if (withdrawalDate < firstAnniversary) return TAX_RATES.underOneYear;
  if (withdrawalDate <= secondAnniversary)
    return TAX_RATES.betweenOneAndTwoYears;
  return TAX_RATES.overTwoYears;
}

export interface WithdrawalBreakdown {
  balanceCents: number;
  gainCents: number;
  taxRate: number;
  taxCents: number;
  netCents: number;
}

export function computeWithdrawal(
  initialCents: number,
  creationDate: IsoDate,
  withdrawalDate: IsoDate,
): WithdrawalBreakdown {
  const balance = balanceCents(initialCents, creationDate, withdrawalDate);
  const gain = balance - initialCents;
  const rate = taxRate(creationDate, withdrawalDate);
  const tax = Math.round(gain * rate);
  return {
    balanceCents: balance,
    gainCents: gain,
    taxRate: rate,
    taxCents: tax,
    netCents: balance - tax,
  };
}

export function assertValidCreation(
  amountCents: number,
  creationDate: IsoDate,
  today: IsoDate,
): void {
  parse(creationDate);
  parse(today);
  if (!Number.isSafeInteger(amountCents) || amountCents < 0) {
    throw new DomainRuleError(
      'INVALID_AMOUNT',
      'Investment amount must be a non-negative integer amount of cents',
    );
  }
  if (creationDate > today) {
    throw new DomainRuleError(
      'CREATION_IN_FUTURE',
      'Creation date must be today or in the past',
    );
  }
}

export function assertValidWithdrawal(params: {
  creationDate: IsoDate;
  withdrawalDate: IsoDate;
  today: IsoDate;
  withdrawnAt?: IsoDate | null;
}): void {
  const { creationDate, withdrawalDate, today, withdrawnAt } = params;
  parse(creationDate);
  parse(withdrawalDate);
  parse(today);
  if (withdrawnAt) {
    throw new DomainRuleError(
      'ALREADY_WITHDRAWN',
      'Investment has already been withdrawn; partial or repeated withdrawals are not supported',
    );
  }
  if (withdrawalDate < creationDate) {
    throw new DomainRuleError(
      'WITHDRAWAL_BEFORE_CREATION',
      'Withdrawal date cannot be before the investment creation date',
    );
  }
  if (withdrawalDate > today) {
    throw new DomainRuleError(
      'WITHDRAWAL_IN_FUTURE',
      'Withdrawal date cannot be in the future',
    );
  }
}
