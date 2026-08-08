<script setup lang="ts">
import { reactive, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { TrendingUp } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth.store'
import { useToast } from '@/composables/useToast'
import { ApiError } from '@/types/api'

const auth = useAuthStore()
const router = useRouter()
const toast = useToast()

const form = reactive({ name: '', email: '', password: '', password_confirmation: '' })
const errors = ref<Record<string, string[]>>({})
const loading = ref(false)

async function submit() {
  loading.value = true
  errors.value = {}
  try {
    await auth.register({ ...form })
    router.push('/investments')
  } catch (e) {
    if (e instanceof ApiError) {
      errors.value = e.validationErrors
      toast.error(e.message)
    } else {
      toast.error('Registration failed')
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center">
    <div class="mb-6 flex flex-col items-center text-center">
      <span class="grid h-12 w-12 place-items-center rounded-xl bg-indigo-600 text-white">
        <TrendingUp class="h-7 w-7" />
      </span>
      <h1 class="mt-4 text-2xl font-bold">Create your account</h1>
    </div>

    <form class="card space-y-4" @submit.prevent="submit">
      <div>
        <label for="name" class="field-label">Name</label>
        <input id="name" v-model="form.name" type="text" class="field-input" required />
        <p v-if="errors.name" class="field-error">{{ errors.name[0] }}</p>
      </div>
      <div>
        <label for="email" class="field-label">Email</label>
        <input id="email" v-model="form.email" type="email" class="field-input" required />
        <p v-if="errors.email" class="field-error">{{ errors.email[0] }}</p>
      </div>
      <div>
        <label for="password" class="field-label">Password</label>
        <input id="password" v-model="form.password" type="password" class="field-input" required />
        <p v-if="errors.password" class="field-error">{{ errors.password[0] }}</p>
      </div>
      <div>
        <label for="password_confirmation" class="field-label">Confirm password</label>
        <input
          id="password_confirmation"
          v-model="form.password_confirmation"
          type="password"
          class="field-input"
          required
        />
      </div>
      <button type="submit" class="btn-primary w-full" :disabled="loading">
        {{ loading ? 'Creating…' : 'Create account' }}
      </button>
    </form>

    <p class="mt-4 text-center text-sm text-slate-500 dark:text-slate-400">
      Already registered?
      <RouterLink
        :to="{ name: 'login' }"
        class="font-medium text-indigo-600 hover:underline dark:text-indigo-400"
      >
        Sign in
      </RouterLink>
    </p>
  </div>
</template>
