import { describe, expect, it } from 'vitest'
import { useCurrency } from './useCurrency'

describe('useCurrency', () => {
  const { formatBRL } = useCurrency()

  it('formats a decimal string as BRL currency', () => {
    expect(formatBRL('1031.61')).toContain('1.031,61')
    expect(formatBRL('1031.61')).toContain('R$')
  })

  it('formats a number the same way', () => {
    expect(formatBRL(31.61)).toContain('31,61')
  })
})
