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
      class="mb-4 inline-flex items-center gap-1 text-sm text-[#6b7280] hover:text-[#111827]"
    >
      <ArrowLeft class="h-4 w-4" /> Back to list
    </RouterLink>

    <div v-if="isPending" class="card h-64 animate-pulse" />

    <div v-else-if="isError || !investment" class="card text-center text-[#6b7280]">
      Investment not found.
    </div>

    <div v-else class="card">
      <h1 class="section-title min-h-[38px]">Investment</h1>
      <div class="figma-divider mb-4" />
      <div class="flex items-start justify-between gap-4">
        <div>
          <p class="text-sm text-[#6b7280]">{{ investment.owner.name }}</p>
          <p class="mt-1 text-3xl font-semibold text-[#057a55] tabular-nums">
            {{ formatBRL(investment.expected_balance) }}
          </p>
          <p class="mt-1 text-sm text-[#6b7280]">
            {{ investment.status === 'withdrawn' ? 'Settled balance' : 'Current expected balance' }}
          </p>
        </div>
        <StatusBadge :status="investment.status" />
      </div>

      <dl class="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
        <div>
          <dt class="text-sm text-[#9ca3af]">Invested amount</dt>
          <dd class="mt-0.5 font-semibold tabular-nums">{{ formatBRL(investment.amount) }}</dd>
        </div>
        <div>
          <dt class="text-sm text-[#9ca3af]">Gains</dt>
          <dd class="mt-0.5 font-semibold text-[#057a55] tabular-nums">
            +{{ formatBRL(investment.gains) }}
          </dd>
        </div>
        <div>
          <dt class="text-sm text-[#9ca3af]">Elapsed months</dt>
          <dd class="mt-0.5 font-semibold tabular-nums">{{ investment.elapsed_months }}</dd>
        </div>
        <div>
          <dt class="text-sm text-[#9ca3af]">Creation date</dt>
          <dd class="mt-0.5 font-semibold">{{ formatDate(investment.invested_at) }}</dd>
        </div>
        <div>
          <dt class="text-sm text-[#9ca3af]">Reference date</dt>
          <dd class="mt-0.5 font-semibold">{{ formatDate(investment.reference_date) }}</dd>
        </div>
      </dl>

      <!-- Withdrawal summary -->
      <div v-if="investment.withdrawal" class="mt-6 rounded-xl bg-[#f9fafb] p-4">
        <h2 class="text-sm font-semibold text-[#4b5563]">Withdrawal settlement</h2>
        <dl class="mt-3 space-y-2 text-sm">
          <div class="flex justify-between">
            <dt class="text-[#6b7280]">Withdrawal date</dt>
            <dd>{{ formatDate(investment.withdrawal.date) }}</dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-[#6b7280]">Tax ({{ taxRatePercent }})</dt>
            <dd class="text-[#c81e1e] tabular-nums">-{{ formatBRL(investment.withdrawal.tax) }}</dd>
          </div>
          <div class="flex justify-between border-t border-[#e5e7eb] pt-2 text-base font-semibold">
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
