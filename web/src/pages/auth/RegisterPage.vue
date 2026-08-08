<script setup lang="ts">
import { reactive, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import { useToast } from '@/composables/useToast'
import { ApiError } from '@/types/api'
import logo from '@/assets/figma/coderockr-logo.svg'
import PasswordInput from '@/components/common/PasswordInput.vue'

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
      <img :src="logo" alt="Coderockr" class="h-[72px] w-7" />
      <h1 class="mt-4 text-2xl font-semibold">Create your account</h1>
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
        <PasswordInput
          id="password"
          v-model="form.password"
          required
          autocomplete="new-password"
        />
        <p v-if="errors.password" class="field-error">{{ errors.password[0] }}</p>
      </div>
      <div>
        <label for="password_confirmation" class="field-label">Confirm password</label>
        <PasswordInput
          id="password_confirmation"
          v-model="form.password_confirmation"
          required
          autocomplete="new-password"
        />
      </div>
      <button type="submit" class="btn-primary w-full" :disabled="loading">
        {{ loading ? 'Creating…' : 'Create account' }}
      </button>
    </form>

    <p class="mt-4 text-center text-sm text-[#6b7280]">
      Already registered?
      <RouterLink :to="{ name: 'login' }" class="font-medium text-[#1c64f2] hover:underline">
        Sign in
      </RouterLink>
    </p>
  </div>
</template>
