<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <div class="flex min-h-[60vh] flex-col items-center justify-center text-center">
    <p class="text-6xl font-bold text-indigo-600 dark:text-indigo-400">404</p>
    <p class="mt-2 text-slate-500 dark:text-slate-400">This page doesn't exist.</p>
    <RouterLink :to="{ name: 'investments' }" class="btn-primary mt-6"
      >Go to investments</RouterLink
    >
  </div>
</template>
