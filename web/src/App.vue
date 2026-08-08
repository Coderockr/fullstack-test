<script setup lang="ts">
import { computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import { Toaster } from 'vue-sonner'
import AppHeader from '@/components/layout/AppHeader.vue'

const route = useRoute()

const showHeader = computed(() => route.meta.guestOnly !== true)
</script>

<template>
  <div class="min-h-screen">
    <AppHeader v-if="showHeader" />
    <main class="w-full px-5 py-[31px] sm:px-[31px]">
      <RouterView v-slot="{ Component }">
        <Transition name="fade" mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>
    </main>
    <Toaster theme="light" position="top-right" rich-colors />
  </div>
</template>
