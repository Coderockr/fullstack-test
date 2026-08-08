import type { Ref } from 'vue'
import { keepPreviousData, useQuery } from '@tanstack/vue-query'
import { investmentsApi } from '@/services/investments.api'

export function useInvestmentsQuery(page: Ref<number>, perPage = 10) {
  return useQuery({
    queryKey: ['investments', page],
    queryFn: () => investmentsApi.list(page.value, perPage),
    placeholderData: keepPreviousData,
  })
}
