<script setup lang="ts">
import { ref } from 'vue'
import { Eye, EyeOff } from 'lucide-vue-next'

withDefaults(
  defineProps<{
    id: string
    autocomplete?: string
    required?: boolean
  }>(),
  {
    autocomplete: undefined,
    required: false,
  },
)

const model = defineModel<string>({ required: true })
const isVisible = ref(false)
</script>

<template>
  <div class="relative">
    <input
      :id="id"
      v-model="model"
      :type="isVisible ? 'text' : 'password'"
      class="field-input pr-12"
      :required="required"
      :autocomplete="autocomplete"
    />
    <button
      type="button"
      class="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-r-2xl text-[#6b7280] transition hover:text-[#111827] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#1c64f2] focus-visible:outline-none"
      :aria-label="isVisible ? 'Hide password' : 'Show password'"
      :aria-controls="id"
      :aria-pressed="isVisible"
      :title="isVisible ? 'Hide password' : 'Show password'"
      @click="isVisible = !isVisible"
    >
      <EyeOff v-if="isVisible" :size="20" aria-hidden="true" />
      <Eye v-else :size="20" aria-hidden="true" />
    </button>
  </div>
</template>
