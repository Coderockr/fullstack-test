<script setup lang="ts">
import { computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import { Toaster } from 'vue-sonner'
import AppHeader from '@/components/layout/AppHeader.vue'
import { useUiStore } from '@/stores/ui.store'

const route = useRoute()
const ui = useUiStore()

const showHeader = computed(() => route.meta.guestOnly !== true)
</script>

<template>
  <div class="min-h-screen">
    <AppHeader v-if="showHeader" />
    <main class="mx-auto w-full max-w-5xl px-4 py-8">
      <RouterView v-slot="{ Component }">
        <Transition name="fade" mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>
    </main>
    <Toaster :theme="ui.theme" position="top-right" rich-colors />
  </div>
</template>
