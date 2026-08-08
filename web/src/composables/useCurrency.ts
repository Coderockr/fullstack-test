const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

export function useCurrency() {
  function formatBRL(value: string | number): string {
    return brl.format(typeof value === 'string' ? Number(value) : value)
  }

  return { formatBRL }
}
