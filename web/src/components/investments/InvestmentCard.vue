<script setup lang="ts">
import { RouterLink } from 'vue-router'
import type { Investment } from '@/types/investment'
import { useCurrency } from '@/composables/useCurrency'
import { useDate } from '@/composables/useDate'
import StatusBadge from '@/components/common/StatusBadge.vue'

defineProps<{ investment: Investment }>()

const { formatBRL } = useCurrency()
const { formatDate } = useDate()
</script>

<template>
  <RouterLink
    :to="{ name: 'investments.show', params: { id: investment.id } }"
    class="block rounded-xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
  >
    <div class="flex items-start justify-between gap-3">
      <div class="min-w-0">
        <p class="truncate text-sm text-slate-500 dark:text-slate-400">
          {{ investment.owner.name }}
        </p>
        <p class="mt-0.5 text-xl font-semibold tabular-nums">
          {{ formatBRL(investment.expected_balance) }}
        </p>
      </div>
      <StatusBadge :status="investment.status" />
    </div>

    <dl class="mt-4 grid grid-cols-3 gap-2 text-sm">
      <div>
        <dt class="text-slate-400">Invested</dt>
        <dd class="font-medium tabular-nums">{{ formatBRL(investment.amount) }}</dd>
      </div>
      <div>
        <dt class="text-slate-400">Gains</dt>
        <dd class="font-medium tabular-nums text-emerald-600 dark:text-emerald-400">
          +{{ formatBRL(investment.gains) }}
        </dd>
      </div>
      <div>
        <dt class="text-slate-400">Since</dt>
        <dd class="font-medium">{{ formatDate(investment.invested_at) }}</dd>
      </div>
    </dl>
  </RouterLink>
</template>
