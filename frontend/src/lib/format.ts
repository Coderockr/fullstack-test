const brl = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

/** Dinheiro trafega como centavos inteiros; vira "R$ 1.000,00" só na exibição. */
export function formatBRL(cents: number): string {
  return brl.format(cents / 100);
}

const brlCompact = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  notation: 'compact',
  maximumFractionDigits: 1,
});

/** Versão curta para eixos de gráfico: 105000 centavos → "R$ 1,1 mil" */
export function formatBRLCompact(cents: number): string {
  return brlCompact.format(cents / 100);
}

/** Alíquota 0.225 → "22,5%" */
export function formatRate(rate: number): string {
  return `${(rate * 100).toLocaleString('pt-BR')}%`;
}

/** '2024-01-31' → '31/01/2024' sem passar por Date (sem bug de fuso horário) */
export function formatDate(iso: string): string {
  const [year, month, day] = iso.split('-');
  return `${day}/${month}/${year}`;
}

/** Data de hoje em UTC, o mesmo "hoje" que a API usa */
export function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}
