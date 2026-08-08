<script setup lang="ts">
import type { InvestmentStatus } from '@/types/investment'

defineProps<{ status: InvestmentStatus }>()
</script>

<template>
  <span
    class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium"
    :class="
      status === 'active'
        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300'
        : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
    "
  >
    <span
      class="h-1.5 w-1.5 rounded-full"
      :class="status === 'active' ? 'bg-emerald-500' : 'bg-slate-400'"
    />
    {{ status === 'active' ? 'Active' : 'Withdrawn' }}
  </span>
</template>
