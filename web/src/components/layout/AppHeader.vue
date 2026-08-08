<script setup lang="ts">
import { RouterLink, useRouter } from 'vue-router'
import { LogOut } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth.store'
import logo from '@/assets/figma/coderockr-logo.svg'

const auth = useAuthStore()
const router = useRouter()

async function logout() {
  await auth.logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <header class="sticky top-0 z-30 h-[65px] border-b border-[#e5e7eb] bg-white">
    <div class="relative flex h-16 items-center justify-center px-5 sm:px-[31px]">
      <RouterLink :to="{ name: 'investments' }" aria-label="Investments home">
        <img :src="logo" alt="Coderockr" class="h-[52px] w-5" />
      </RouterLink>

      <div class="absolute right-5 flex items-center gap-1 sm:right-[31px]">
        <span v-if="auth.user" class="mx-1 hidden text-sm text-[#6b7280] sm:block">
          {{ auth.user.name }}
        </span>

        <button
          class="flex items-center gap-1.5 rounded-lg px-2 py-2 text-sm text-[#6b7280] transition hover:bg-[#f3f4f6]"
          title="Logout"
          @click="logout"
        >
          <LogOut class="h-4 w-4" />
          <span class="hidden lg:inline">Logout</span>
        </button>
      </div>
    </div>
  </header>
</template>
