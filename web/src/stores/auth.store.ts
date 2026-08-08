import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { LoginInput, RegisterInput, User } from '@/types/auth'
import { authApi } from '@/services/auth.api'
import { setTokenProvider } from '@/services/apiClient'

const TOKEN_KEY = 'investments.token'
const USER_KEY = 'investments.user'

function readUser(): User | null {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) ?? 'null') as User | null
  } catch {
    return null
  }
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem(TOKEN_KEY))
  const user = ref<User | null>(readUser())
  const isAuthenticated = computed(() => token.value !== null)

  // The API client reads the current token through this provider.
  setTokenProvider(() => token.value)

  function setSession(newToken: string, newUser: User): void {
    token.value = newToken
    user.value = newUser
    localStorage.setItem(TOKEN_KEY, newToken)
    localStorage.setItem(USER_KEY, JSON.stringify(newUser))
  }

  function clear(): void {
    token.value = null
    user.value = null
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  }

  async function login(payload: LoginInput): Promise<void> {
    const { token: t, user: u } = await authApi.login(payload)
    setSession(t, u)
  }

  async function register(payload: RegisterInput): Promise<void> {
    const { token: t, user: u } = await authApi.register(payload)
    setSession(t, u)
  }

  async function logout(): Promise<void> {
    try {
      await authApi.logout()
    } catch {
      // Ignore network/401 errors — clear the local session regardless.
    }
    clear()
  }

  return { token, user, isAuthenticated, setSession, clear, login, register, logout }
})
