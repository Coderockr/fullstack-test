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
  <div class="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-5 sm:p-[31px]">
    <div class="absolute inset-0 bg-[#111827]/45 backdrop-blur-[2px]" @click="emit('close')" />

    <section
      class="card relative z-10 my-auto w-full max-w-[1537px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="withdraw-title"
    >
      <div class="flex min-h-[38px] items-start justify-between gap-4">
        <h2 id="withdraw-title" class="section-title">Withdrawn Investment</h2>
        <button
          class="rounded-lg p-1 text-[#6b7280] transition hover:bg-[#f3f4f6]"
          aria-label="Close"
          @click="emit('close')"
        >
          <X class="h-5 w-5" />
        </button>
      </div>
      <div class="figma-divider" />

      <div class="grid gap-4 pt-3 lg:grid-cols-[211px_minmax(260px,1fr)_211px_217px]">
        <div>
          <label for="withdraw-id" class="field-label">ID</label>
          <input id="withdraw-id" :value="investment.id" class="field-input" disabled />
        </div>
        <div>
          <label for="withdraw-owner" class="field-label">Owner</label>
          <input
            id="withdraw-owner"
            :value="investment.owner.name ?? ''"
            class="field-input"
            disabled
          />
        </div>
        <div>
          <label for="withdraw-amount" class="field-label">Amount</label>
          <input
            id="withdraw-amount"
            :value="formatBRL(investment.amount)"
            class="field-input"
            disabled
          />
        </div>
        <div>
          <label for="withdrawal-date" class="field-label">Withdrawn Date</label>
          <input
            id="withdrawal-date"
            v-model="date"
            type="date"
            class="field-input"
            :min="investment.invested_at"
            :max="today()"
          />
        </div>
      </div>

      <div class="mt-4 rounded-xl bg-[#f9fafb] p-4 text-sm">
        <div v-if="isError" class="text-[#c81e1e]">That date isn't valid for this investment.</div>
        <dl
          v-else
          class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
          :class="{ 'opacity-60': isFetching }"
        >
          <div>
            <dt class="text-[#6b7280]">Gross balance</dt>
            <dd class="mt-1 font-medium tabular-nums">
              {{ preview ? formatBRL(preview.gross) : '—' }}
            </dd>
          </div>
          <div>
            <dt class="text-[#6b7280]">Gains</dt>
            <dd class="mt-1 font-medium text-[#057a55] tabular-nums">
              {{ preview ? '+' + formatBRL(preview.gains) : '—' }}
            </dd>
          </div>
          <div>
            <dt class="text-[#6b7280]">Tax ({{ taxRatePercent }})</dt>
            <dd class="mt-1 font-medium text-[#c81e1e] tabular-nums">
              {{ preview ? '-' + formatBRL(preview.tax) : '—' }}
            </dd>
          </div>
          <div>
            <dt class="text-[#6b7280]">Net received</dt>
            <dd class="mt-1 text-lg font-semibold text-[#057a55] tabular-nums">
              {{ preview ? formatBRL(preview.net) : '—' }}
            </dd>
          </div>
        </dl>
      </div>

      <div class="mt-3 flex justify-end gap-2">
        <button class="btn-ghost" @click="emit('close')">Cancel</button>
        <button class="btn-primary" :disabled="isPending || !preview" @click="confirm">
          {{ isPending ? 'Saving…' : 'Save' }}
        </button>
      </div>
    </section>
  </div>
</template>
