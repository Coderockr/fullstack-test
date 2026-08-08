<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCreateInvestment } from '@/queries/useCreateInvestment'
import { useDate } from '@/composables/useDate'
import { useToast } from '@/composables/useToast'
import { ApiError } from '@/types/api'
import { useAuthStore } from '@/stores/auth.store'

const router = useRouter()
const auth = useAuthStore()
const toast = useToast()
const { today, isFuture } = useDate()
const { mutateAsync, isPending } = useCreateInvestment()

const form = reactive({ amount: '', invested_at: today() })
const errors = ref<Record<string, string[]>>({})

function validate(): boolean {
  const next: Record<string, string[]> = {}
  const amount = Number(form.amount)
  if (!form.amount || Number.isNaN(amount) || amount <= 0) {
    next.amount = ['Amount must be greater than zero.']
  }
  if (!form.invested_at) {
    next.invested_at = ['A creation date is required.']
  } else if (isFuture(form.invested_at)) {
    next.invested_at = ['The creation date cannot be in the future.']
  }
  errors.value = next
  return Object.keys(next).length === 0
}

async function submit() {
  if (!validate()) return
  try {
    const investment = await mutateAsync({
      amount: Number(form.amount).toFixed(2),
      invested_at: form.invested_at,
    })
    toast.success('Investment created')
    router.push({ name: 'investments.show', params: { id: investment.id } })
  } catch (e) {
    if (e instanceof ApiError) {
      errors.value = e.validationErrors
      toast.error(e.message)
    } else {
      toast.error('Something went wrong')
    }
  }
}
</script>

<template>
  <section>
    <form class="card flex min-h-[229px] flex-col gap-2" @submit.prevent="submit">
      <h1 class="section-title min-h-[38px]">Create Investment</h1>
      <div class="figma-divider" />

      <div class="grid flex-1 items-start gap-4 pt-1 lg:grid-cols-[minmax(260px,1fr)_158px_158px]">
        <div>
          <label for="owner" class="field-label">Owner</label>
          <input
            id="owner"
            :value="auth.user?.name ?? ''"
            type="text"
            class="field-input"
            disabled
          />
        </div>

        <div>
          <label for="invested_at" class="field-label">Date</label>
          <input
            id="invested_at"
            v-model="form.invested_at"
            type="date"
            class="field-input"
            :max="today()"
          />
          <p v-if="errors.invested_at" class="field-error">{{ errors.invested_at[0] }}</p>
        </div>

        <div>
          <label for="amount" class="field-label">Amount (BRL)</label>
          <input
            id="amount"
            v-model="form.amount"
            type="number"
            step="0.01"
            min="0.01"
            inputmode="decimal"
            class="field-input"
            placeholder="0,00"
          />
          <p v-if="errors.amount" class="field-error">{{ errors.amount[0] }}</p>
        </div>
      </div>

      <div class="flex justify-end">
        <button type="submit" class="btn-primary" :disabled="isPending">
          {{ isPending ? 'Saving…' : 'Save' }}
        </button>
      </div>
    </form>
  </section>
</template>
