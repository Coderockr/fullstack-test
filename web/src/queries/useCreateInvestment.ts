import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { investmentsApi } from '@/services/investments.api'
import type { NewInvestmentInput } from '@/types/investment'

export function useCreateInvestment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: NewInvestmentInput) => investmentsApi.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['investments'] }),
  })
}
