import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { investmentsApi } from '@/services/investments.api'

export function useWithdrawInvestment(id: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (date: string) => investmentsApi.withdraw(id, date),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investments'] })
      queryClient.invalidateQueries({ queryKey: ['investment'] })
    },
  })
}
