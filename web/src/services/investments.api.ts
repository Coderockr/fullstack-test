import type { Investment, NewInvestmentInput, WithdrawalPreview } from '@/types/investment'
import type { Paginated } from '@/types/pagination'
import { apiFetch } from './apiClient'

export const investmentsApi = {
  list: (page = 1, perPage = 10) =>
    apiFetch<Paginated<Investment>>('/investments', { params: { page, per_page: perPage } }),

  get: (id: number) => apiFetch<{ data: Investment }>(`/investments/${id}`).then((r) => r.data),

  create: (payload: NewInvestmentInput) =>
    apiFetch<{ data: Investment }>('/investments', { method: 'POST', body: payload }).then(
      (r) => r.data,
    ),

  withdrawalPreview: (id: number, date: string) =>
    apiFetch<{ data: WithdrawalPreview }>(`/investments/${id}/withdrawal-preview`, {
      params: { date },
    }).then((r) => r.data),

  withdraw: (id: number, date: string) =>
    apiFetch<{ data: Investment }>(`/investments/${id}/withdraw`, {
      method: 'POST',
      body: { withdrawal_date: date },
    }).then((r) => r.data),
}
