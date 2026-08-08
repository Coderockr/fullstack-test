<script setup lang="ts">
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
import type { PaginationMeta } from '@/types/pagination'

const props = defineProps<{ meta: PaginationMeta }>()
const emit = defineEmits<{ change: [page: number] }>()

function go(page: number) {
  if (page >= 1 && page <= props.meta.last_page && page !== props.meta.current_page) {
    emit('change', page)
  }
}
</script>

<template>
  <div class="flex items-center justify-between text-sm">
    <p class="text-[#6b7280]">{{ meta.from ?? 0 }}–{{ meta.to ?? 0 }} of {{ meta.total }}</p>
    <div class="flex items-center gap-2">
      <button
        class="rounded-lg border border-[#e5e7eb] p-2 transition hover:bg-[#f9fafb] disabled:opacity-40"
        :disabled="meta.current_page <= 1"
        aria-label="Previous page"
        @click="go(meta.current_page - 1)"
      >
        <ChevronLeft class="h-4 w-4" />
      </button>
      <span class="tabular-nums text-[#4b5563]">
        {{ meta.current_page }} / {{ meta.last_page }}
      </span>
      <button
        class="rounded-lg border border-[#e5e7eb] p-2 transition hover:bg-[#f9fafb] disabled:opacity-40"
        :disabled="meta.current_page >= meta.last_page"
        aria-label="Next page"
        @click="go(meta.current_page + 1)"
      >
        <ChevronRight class="h-4 w-4" />
      </button>
    </div>
  </div>
</template>
