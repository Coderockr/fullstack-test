<script setup lang="ts">
import type { InvestmentStatus } from '@/types/investment'

defineProps<{ status: InvestmentStatus }>()
</script>

<template>
  <span
    class="inline-flex items-center justify-center rounded-[10px] px-2.5 py-0.5 text-xs font-normal"
    :class="status === 'active' ? 'bg-[#def7ec] text-[#03543f]' : 'bg-[#fbd5d5] text-[#9b1c1c]'"
  >
    {{ status === 'active' ? 'Invested' : 'Withdrawn' }}
  </span>
</template>
