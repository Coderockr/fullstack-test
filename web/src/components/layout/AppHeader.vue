<script setup lang="ts">
import { RouterLink, useRouter } from 'vue-router'
import { LogOut, Moon, Sun, TrendingUp } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth.store'
import { useUiStore } from '@/stores/ui.store'

const auth = useAuthStore()
const ui = useUiStore()
const router = useRouter()

async function logout() {
  await auth.logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <header
    class="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80"
  >
    <div class="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
      <RouterLink :to="{ name: 'investments' }" class="flex items-center gap-2 font-semibold">
        <span class="grid h-8 w-8 place-items-center rounded-lg bg-indigo-600 text-white">
          <TrendingUp class="h-5 w-5" />
        </span>
        <span>Investments</span>
      </RouterLink>

      <div class="flex items-center gap-1">
        <button
          class="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          :title="ui.theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'"
          @click="ui.toggleTheme()"
        >
          <Moon v-if="ui.theme === 'light'" class="h-5 w-5" />
          <Sun v-else class="h-5 w-5" />
        </button>

        <span
          v-if="auth.user"
          class="mx-1 hidden text-sm text-slate-500 sm:block dark:text-slate-400"
        >
          {{ auth.user.name }}
        </span>

        <button
          class="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          @click="logout"
        >
          <LogOut class="h-4 w-4" />
          <span class="hidden sm:inline">Logout</span>
        </button>
      </div>
    </div>
  </header>
</template>
