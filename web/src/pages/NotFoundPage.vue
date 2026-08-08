<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <div class="flex min-h-[60vh] flex-col items-center justify-center text-center">
    <p class="text-6xl font-bold text-[#1c64f2]">404</p>
    <p class="mt-2 text-[#6b7280]">This page doesn't exist.</p>
    <RouterLink :to="{ name: 'investments' }" class="btn-primary mt-6"
      >Go to investments</RouterLink
    >
  </div>
</template>
