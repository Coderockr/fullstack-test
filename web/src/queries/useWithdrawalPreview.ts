import type { Ref } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { investmentsApi } from '@/services/investments.api'

export function useWithdrawalPreview(id: number, date: Ref<string>, enabled: Ref<boolean>) {
  return useQuery({
    queryKey: ['withdrawal-preview', id, date],
    queryFn: () => investmentsApi.withdrawalPreview(id, date.value),
    enabled,
    staleTime: 0,
  })
}
