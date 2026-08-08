import { describe, expect, it } from 'vitest'
import { useDate } from './useDate'

describe('useDate', () => {
  const { formatDate, isFuture, isBefore } = useDate()

  it('formats an ISO date as DD/MM/YYYY', () => {
    expect(formatDate('2025-01-15')).toBe('15/01/2025')
  })

  it('detects future dates', () => {
    expect(isFuture('2999-01-01')).toBe(true)
    expect(isFuture('2000-01-01')).toBe(false)
  })

  it('compares dates', () => {
    expect(isBefore('2025-01-01', '2025-06-01')).toBe(true)
    expect(isBefore('2025-06-01', '2025-01-01')).toBe(false)
  })
})
