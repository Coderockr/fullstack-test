import dayjs from 'dayjs'

export function useDate() {
  function formatDate(value: string | Date, format = 'DD/MM/YYYY'): string {
    return dayjs(value).format(format)
  }

  function today(): string {
    return dayjs().format('YYYY-MM-DD')
  }

  function isFuture(value: string): boolean {
    return dayjs(value).isAfter(dayjs(), 'day')
  }

  function isBefore(value: string, other: string): boolean {
    return dayjs(value).isBefore(dayjs(other), 'day')
  }

  return { formatDate, today, isFuture, isBefore }
}
