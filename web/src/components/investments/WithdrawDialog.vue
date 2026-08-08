<script setup lang="ts">
import { computed, ref } from 'vue'
import { refDebounced, onKeyStroke } from '@vueuse/core'
import { X } from 'lucide-vue-next'
import type { Investment } from '@/types/investment'
import { useWithdrawalPreview } from '@/queries/useWithdrawalPreview'
import { useWithdrawInvestment } from '@/queries/useWithdrawInvestment'
import { useCurrency } from '@/composables/useCurrency'
import { useDate } from '@/composables/useDate'
import { useToast } from '@/composables/useToast'
import { ApiError } from '@/types/api'

const props = defineProps<{ investment: Investment }>()
const emit = defineEmits<{ close: []; withdrawn: [] }>()

const { formatBRL } = useCurrency()
const { today } = useDate()
const toast = useToast()

const date = ref(today())
const debouncedDate = refDebounced(date, 300)
const enabled = computed(() => Boolean(debouncedDate.value))

const {
  data: preview,
  isFetching,
  isError,
} = useWithdrawalPreview(props.investment.id, debouncedDate, enabled)

const { mutateAsync, isPending } = useWithdrawInvestment(props.investment.id)
const taxRatePercent = computed(() =>
  preview.value
    ? `${(Number(preview.value.tax_rate) * 100).toFixed(2).replace(/\.?0+$/, '')}%`
    : '—',
)

onKeyStroke('Escape', () => emit('close'))

async function confirm() {
  try {
    await mutateAsync(date.value)
    toast.success('Investment withdrawn successfully')
    emit('withdrawn')
    emit('close')
  } catch (e) {
    toast.error(e instanceof ApiError ? e.message : 'Withdrawal failed')
  }
}
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div class="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" @click="emit('close')" />

    <div
      class="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900"
      role="dialog"
      aria-modal="true"
      aria-label="Withdraw investment"
    >
      <button
        class="absolute top-4 right-4 rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
        aria-label="Close"
        @click="emit('close')"
      >
        <X class="h-5 w-5" />
      </button>

      <h2 class="text-lg font-semibold">Withdraw investment</h2>
      <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Pick a withdrawal date to preview the taxed net amount.
      </p>

      <div class="mt-4">
        <label for="withdrawal-date" class="field-label">Withdrawal date</label>
        <input
          id="withdrawal-date"
          v-model="date"
          type="date"
          class="field-input"
          :min="investment.invested_at"
          :max="today()"
        />
      </div>

      <div class="mt-4 rounded-xl bg-slate-50 p-4 text-sm dark:bg-slate-800/60">
        <div v-if="isError" class="text-red-600 dark:text-red-400">
          That date isn't valid for this investment.
        </div>
        <div v-else class="space-y-2" :class="{ 'opacity-60': isFetching }">
          <div class="flex justify-between">
            <span class="text-slate-500 dark:text-slate-400">Gross balance</span>
            <span class="tabular-nums">{{ preview ? formatBRL(preview.gross) : '—' }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-500 dark:text-slate-400">Gains</span>
            <span class="tabular-nums text-emerald-600 dark:text-emerald-400">
              {{ preview ? '+' + formatBRL(preview.gains) : '—' }}
            </span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-500 dark:text-slate-400">Tax ({{ taxRatePercent }})</span>
            <span class="tabular-nums text-red-600 dark:text-red-400">
              {{ preview ? '-' + formatBRL(preview.tax) : '—' }}
            </span>
          </div>
          <div
            class="flex justify-between border-t border-slate-200 pt-2 text-base font-semibold dark:border-slate-700"
          >
            <span>Net received</span>
            <span class="tabular-nums">{{ preview ? formatBRL(preview.net) : '—' }}</span>
          </div>
        </div>
      </div>

      <div class="mt-6 flex justify-end gap-2">
        <button class="btn-ghost" @click="emit('close')">Cancel</button>
        <button class="btn-primary" :disabled="isPending || !preview" @click="confirm">
          {{ isPending ? 'Withdrawing…' : 'Confirm withdrawal' }}
        </button>
      </div>
    </div>
  </div>
</template>
