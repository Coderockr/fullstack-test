import {
  assertValidCreation,
  assertValidWithdrawal,
  balanceCents,
  completedMonths,
  computeWithdrawal,
  DomainRuleError,
  taxRate,
  TAX_RATES,
} from './investment-math';
// codeOf é uma função que retorna o código de erro de uma função que não retorna nada
// fn é uma função que não retorna nada
const codeOf = (fn: () => void): string => {
  try {
    fn();
  } catch (error) {
    if (error instanceof DomainRuleError) {
      return error.code;
    }
    throw error;
  }
  // Se fn() não lançou nada, o teste falha aqui: era esperado um DomainRuleError
  throw new Error('expected DomainRuleError to be thrown');
};
// describe é uma função que define um grupo de testes
describe('ganho composto (0,52% ao mês)', () => {
  // it é uma função que define um teste
  it('zero meses completos devolve exatamente o valor inicial', () => {
    // Espera que o resultado seja 0
    expect(completedMonths('2024-05-10', '2024-05-10')).toBe(0);
    // Espera que o resultado seja 0
    expect(completedMonths('2024-05-10', '2024-06-09')).toBe(0);
    // Espera que o resultado seja 100000
    expect(balanceCents(100000, '2024-05-10', '2024-06-09')).toBe(100000);
  });
  // it é uma função que define um teste
  it('um mês completo rende 0,52%: 1.000,00 vira 1.005,20', () => {
    // Espera que o resultado seja 1
    expect(completedMonths('2024-05-10', '2024-06-10')).toBe(1);
    // Espera que o resultado seja 100520
    expect(balanceCents(100000, '2024-05-10', '2024-06-10')).toBe(100520);
  });

  // it é uma função que define um teste
  it('doze meses compõem juro sobre juro, não juro simples', () => {
    // Calcula o saldo em centavos
    const afterTwelveMonths = balanceCents(100000, '2023-05-10', '2024-05-10');
    // Espera que o resultado seja 106422
    expect(afterTwelveMonths).toBe(106422);
    // Espera que o resultado não seja 106240
    // juro simples daria 100000 + 12 × 0,52% = 106240
    expect(afterTwelveMonths).not.toBe(106240);
    // Espera que o resultado seja 113256
    expect(balanceCents(100000, '2022-05-10', '2024-05-10')).toBe(113256);
    // Espera que o resultado seja 120528
    expect(balanceCents(100000, '2021-05-10', '2024-05-10')).toBe(120528);
  });

  // it é uma função que define um teste
  it('criado dia 31, o mês completa no último dia de fevereiro', () => {
    // 2024 é bissexto: 31/01 completa um mês em 29/02
    // Espera que o resultado seja 0
    expect(completedMonths('2024-01-31', '2024-02-28')).toBe(0);
    // Espera que o resultado seja 1
    expect(completedMonths('2024-01-31', '2024-02-29')).toBe(1);
    // Espera que o resultado seja 100520
    expect(balanceCents(100000, '2024-01-31', '2024-02-29')).toBe(100520);
    // em março a âncora volta para o dia 31
    expect(completedMonths('2024-01-31', '2024-03-30')).toBe(1);
    // Espera que o resultado seja 2
    expect(completedMonths('2024-01-31', '2024-03-31')).toBe(2);
    // ano não bissexto: completa em 28/02
    // Espera que o resultado seja 1
    expect(completedMonths('2023-01-31', '2023-02-28')).toBe(1);
  });
});

describe('imposto sobre o saque', () => {
  // it é uma função que define um teste
  it('a alíquota incide apenas sobre o ganho, nunca sobre o principal', () => {
    // 6 meses completos → menos de um ano → 22,5%
    const breakdown = computeWithdrawal(100000, '2024-01-10', '2024-07-10');
    // Espera que o resultado seja 103161
    expect(breakdown.balanceCents).toBe(103161);
    // Espera que o resultado seja 3161
    expect(breakdown.gainCents).toBe(3161);
    // Espera que o resultado seja 711
    expect(breakdown.taxCents).toBe(Math.round(3161 * 0.225)); // 711
    // Espera que o resultado não seja 711
    expect(breakdown.taxCents).not.toBe(Math.round(103161 * 0.225));
    // Espera que o resultado seja 103161 - 711
    expect(breakdown.netCents).toBe(103161 - 711);
  });

  // it é uma função que define um teste
  it('a alíquota vira nas fronteiras de 1 e 2 anos (aniversário de calendário)', () => {
    // Espera que o resultado seja 0.225
    expect(taxRate('2020-03-10', '2021-03-09')).toBe(TAX_RATES.underOneYear);
    // Espera que o resultado seja 0.185
    expect(taxRate('2020-03-10', '2021-03-10')).toBe(
      TAX_RATES.betweenOneAndTwoYears,
    );
    // Espera que o resultado seja 0.185
    expect(taxRate('2020-03-10', '2022-03-10')).toBe(
      TAX_RATES.betweenOneAndTwoYears,
    );
    // Espera que o resultado seja 0.15
    expect(taxRate('2020-03-10', '2022-03-11')).toBe(TAX_RATES.overTwoYears);
    // criado em 29/02: aniversário cai no último dia de fevereiro
    // Espera que o resultado seja 0.185
    expect(taxRate('2024-02-29', '2025-02-28')).toBe(
      TAX_RATES.betweenOneAndTwoYears,
    );
  });
});

// describe é uma função que define um grupo de testes
describe('validações de criação e saque', () => {
  const today = '2025-01-15';

  // it é uma função que define um teste
  it('valor negativo na criação é rejeitado', () => {
    expect(codeOf(() => assertValidCreation(-1, '2024-05-10', today))).toBe(
      'INVALID_AMOUNT',
    );
    // Espera que o resultado seja 'CREATION_IN_FUTURE'
    expect(codeOf(() => assertValidCreation(100000, '2025-01-16', today))).toBe(
      'CREATION_IN_FUTURE',
    );
    // Espera que o resultado não seja lançado
    expect(() => assertValidCreation(100000, today, today)).not.toThrow();
  });

  // it é uma função que define um teste
  it('saque com data anterior à criação é rejeitado', () => {
    // Espera que o resultado seja 'WITHDRAWAL_BEFORE_CREATION'
    expect(
      codeOf(() =>
        assertValidWithdrawal({
          creationDate: '2024-05-10',
          withdrawalDate: '2024-05-09',
          today,
        }),
      ),
    ).toBe('WITHDRAWAL_BEFORE_CREATION');
  });

  // it é uma função que define um teste
  it('saque com data futura é rejeitado', () => {
    // Espera que o resultado seja 'WITHDRAWAL_IN_FUTURE'
    expect(
      codeOf(() =>
        assertValidWithdrawal({
          creationDate: '2024-05-10',
          withdrawalDate: '2025-01-16',
          today,
        }),
      ),
    ).toBe('WITHDRAWAL_IN_FUTURE');
    // hoje é permitido
    expect(() =>
      assertValidWithdrawal({
        creationDate: '2024-05-10',
        withdrawalDate: today,
        today,
      }),
    ).not.toThrow();
  });
  // it é uma função que define um teste
  it('investimento já sacado não pode ser sacado de novo', () => {
    // Espera que o resultado seja 'ALREADY_WITHDRAWN'
    expect(
      codeOf(() =>
        assertValidWithdrawal({
          creationDate: '2024-05-10',
          withdrawalDate: '2024-12-01',
          today,
          withdrawnAt: '2024-08-10',
        }),
      ),
    ).toBe('ALREADY_WITHDRAWN');
  });
});
