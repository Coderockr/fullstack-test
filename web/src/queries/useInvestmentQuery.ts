import type { Ref } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { investmentsApi } from '@/services/investments.api'

export function useInvestmentQuery(id: Ref<number>) {
  return useQuery({
    queryKey: ['investment', id],
    queryFn: () => investmentsApi.get(id.value),
  })
}
