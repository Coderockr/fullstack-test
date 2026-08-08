<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { ArrowLeft } from 'lucide-vue-next'
import { useInvestmentQuery } from '@/queries/useInvestmentQuery'
import { useCurrency } from '@/composables/useCurrency'
import { useDate } from '@/composables/useDate'
import StatusBadge from '@/components/common/StatusBadge.vue'
import WithdrawDialog from '@/components/investments/WithdrawDialog.vue'

const props = defineProps<{ id: string }>()
const id = computed(() => Number(props.id))

const { data: investment, isPending, isError } = useInvestmentQuery(id)
const { formatBRL } = useCurrency()
const { formatDate } = useDate()

const showWithdraw = ref(false)

const taxRatePercent = computed(() => {
  const rate = investment.value?.withdrawal?.tax_rate
  return rate ? `${(Number(rate) * 100).toFixed(2).replace(/\.?0+$/, '')}%` : ''
})
</script>

<template>
  <section>
    <RouterLink
      :to="{ name: 'investments' }"
      class="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
    >
      <ArrowLeft class="h-4 w-4" /> Back to list
    </RouterLink>

    <div v-if="isPending" class="card h-64 animate-pulse" />

    <div v-else-if="isError || !investment" class="card text-center text-slate-500">
      Investment not found.
    </div>

    <div v-else class="card">
      <div class="flex items-start justify-between gap-4">
        <div>
          <p class="text-sm text-slate-500 dark:text-slate-400">{{ investment.owner.name }}</p>
          <h1 class="mt-1 text-3xl font-bold tabular-nums">
            {{ formatBRL(investment.expected_balance) }}
          </h1>
          <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {{ investment.status === 'withdrawn' ? 'Settled balance' : 'Current expected balance' }}
          </p>
        </div>
        <StatusBadge :status="investment.status" />
      </div>

      <dl class="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
        <div>
          <dt class="text-sm text-slate-400">Invested amount</dt>
          <dd class="mt-0.5 font-semibold tabular-nums">{{ formatBRL(investment.amount) }}</dd>
        </div>
        <div>
          <dt class="text-sm text-slate-400">Gains</dt>
          <dd class="mt-0.5 font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
            +{{ formatBRL(investment.gains) }}
          </dd>
        </div>
        <div>
          <dt class="text-sm text-slate-400">Elapsed months</dt>
          <dd class="mt-0.5 font-semibold tabular-nums">{{ investment.elapsed_months }}</dd>
        </div>
        <div>
          <dt class="text-sm text-slate-400">Creation date</dt>
          <dd class="mt-0.5 font-semibold">{{ formatDate(investment.invested_at) }}</dd>
        </div>
        <div>
          <dt class="text-sm text-slate-400">Reference date</dt>
          <dd class="mt-0.5 font-semibold">{{ formatDate(investment.reference_date) }}</dd>
        </div>
      </dl>

      <!-- Withdrawal summary -->
      <div
        v-if="investment.withdrawal"
        class="mt-6 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60"
      >
        <h2 class="text-sm font-semibold text-slate-600 dark:text-slate-300">
          Withdrawal settlement
        </h2>
        <dl class="mt-3 space-y-2 text-sm">
          <div class="flex justify-between">
            <dt class="text-slate-500 dark:text-slate-400">Withdrawal date</dt>
            <dd>{{ formatDate(investment.withdrawal.date) }}</dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-slate-500 dark:text-slate-400">Tax ({{ taxRatePercent }})</dt>
            <dd class="tabular-nums text-red-600 dark:text-red-400">
              -{{ formatBRL(investment.withdrawal.tax) }}
            </dd>
          </div>
          <div
            class="flex justify-between border-t border-slate-200 pt-2 text-base font-semibold dark:border-slate-700"
          >
            <dt>Net received</dt>
            <dd class="tabular-nums">{{ formatBRL(investment.withdrawal.net_amount) }}</dd>
          </div>
        </dl>
      </div>

      <!-- Withdraw action -->
      <div v-else class="mt-6">
        <button class="btn-primary" @click="showWithdraw = true">Withdraw investment</button>
      </div>
    </div>

    <WithdrawDialog
      v-if="showWithdraw && investment"
      :investment="investment"
      @close="showWithdraw = false"
      @withdrawn="showWithdraw = false"
    />
  </section>
</template>
