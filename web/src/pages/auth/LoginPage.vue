<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import { useToast } from '@/composables/useToast'
import { ApiError } from '@/types/api'
import logo from '@/assets/figma/coderockr-logo.svg'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()
const toast = useToast()

// Pre-filled with the seeded demo account for quick evaluation.
const email = ref('demo@coderockr.test')
const password = ref('password')
const loading = ref(false)

async function submit() {
  loading.value = true
  try {
    await auth.login({ email: email.value, password: password.value })
    router.push((route.query.redirect as string) || '/investments')
  } catch (e) {
    toast.error(e instanceof ApiError ? e.message : 'Login failed')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center">
    <div class="mb-6 flex flex-col items-center text-center">
      <img :src="logo" alt="Coderockr" class="h-[72px] w-7" />
      <h1 class="mt-4 text-2xl font-semibold">Welcome back</h1>
      <p class="text-sm text-[#6b7280]">Sign in to manage your investments.</p>
    </div>

    <form class="card space-y-4" @submit.prevent="submit">
      <div>
        <label for="email" class="field-label">Email</label>
        <input
          id="email"
          v-model="email"
          type="email"
          class="field-input"
          required
          autocomplete="email"
        />
      </div>
      <div>
        <label for="password" class="field-label">Password</label>
        <input
          id="password"
          v-model="password"
          type="password"
          class="field-input"
          required
          autocomplete="current-password"
        />
      </div>
      <button type="submit" class="btn-primary w-full" :disabled="loading">
        {{ loading ? 'Signing in…' : 'Sign in' }}
      </button>
    </form>

    <p class="mt-4 text-center text-sm text-[#6b7280]">
      No account?
      <RouterLink :to="{ name: 'register' }" class="font-medium text-[#1c64f2] hover:underline">
        Create one
      </RouterLink>
    </p>
  </div>
</template>
