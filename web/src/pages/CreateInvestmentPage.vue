<script setup lang="ts">
import { reactive, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { ArrowLeft } from 'lucide-vue-next'
import { useCreateInvestment } from '@/queries/useCreateInvestment'
import { useDate } from '@/composables/useDate'
import { useToast } from '@/composables/useToast'
import { ApiError } from '@/types/api'

const router = useRouter()
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
  <section class="mx-auto max-w-lg">
    <RouterLink
      :to="{ name: 'investments' }"
      class="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
    >
      <ArrowLeft class="h-4 w-4" /> Back to list
    </RouterLink>

    <h1 class="mb-1 text-2xl font-bold">New investment</h1>
    <p class="mb-6 text-sm text-slate-500 dark:text-slate-400">
      It will earn 0.52% compound interest every month.
    </p>

    <form class="card space-y-5" @submit.prevent="submit">
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
          placeholder="1000.00"
        />
        <p v-if="errors.amount" class="field-error">{{ errors.amount[0] }}</p>
      </div>

      <div>
        <label for="invested_at" class="field-label">Creation date</label>
        <input
          id="invested_at"
          v-model="form.invested_at"
          type="date"
          class="field-input"
          :max="today()"
        />
        <p v-if="errors.invested_at" class="field-error">{{ errors.invested_at[0] }}</p>
      </div>

      <div class="flex justify-end gap-2">
        <RouterLink :to="{ name: 'investments' }" class="btn-ghost">Cancel</RouterLink>
        <button type="submit" class="btn-primary" :disabled="isPending">
          {{ isPending ? 'Creating…' : 'Create investment' }}
        </button>
      </div>
    </form>
  </section>
</template>
