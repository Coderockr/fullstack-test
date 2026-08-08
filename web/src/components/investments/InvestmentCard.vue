<script setup lang="ts">
import { RouterLink } from 'vue-router'
import type { Investment } from '@/types/investment'
import { useCurrency } from '@/composables/useCurrency'
import { useDate } from '@/composables/useDate'
import StatusBadge from '@/components/common/StatusBadge.vue'

defineProps<{ investment: Investment }>()
defineEmits<{ withdraw: [] }>()

const { formatBRL } = useCurrency()
const { formatDate } = useDate()
</script>

<template>
  <article class="rounded-xl border border-[#e5e7eb] bg-white p-4">
    <div class="flex items-start justify-between gap-3">
      <div class="min-w-0">
        <p class="truncate text-sm text-[#6b7280]">{{ investment.owner.name }}</p>
        <p class="mt-0.5 text-xl font-semibold text-[#111827] tabular-nums">
          {{ formatBRL(investment.status === 'active' ? investment.expected_balance : 0) }}
        </p>
      </div>
      <StatusBadge :status="investment.status" />
    </div>

    <dl class="mt-4 grid grid-cols-2 gap-2 text-sm">
      <div>
        <dt class="text-[#9ca3af]">Invested</dt>
        <dd class="font-medium tabular-nums">{{ formatBRL(investment.amount) }}</dd>
      </div>
      <div>
        <dt class="text-[#9ca3af]">Since</dt>
        <dd class="font-medium">{{ formatDate(investment.invested_at) }}</dd>
      </div>
    </dl>

    <div class="mt-4 flex justify-end gap-2">
      <RouterLink
        :to="{ name: 'investments.show', params: { id: investment.id } }"
        class="btn-table"
      >
        View
      </RouterLink>
      <button
        v-if="investment.status === 'active'"
        class="btn-danger hover:bg-[#c81e1e]"
        @click="$emit('withdraw')"
      >
        Withdraw
      </button>
    </div>
  </article>
</template>
