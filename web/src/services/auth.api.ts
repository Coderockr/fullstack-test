import type { AuthResponse, LoginInput, RegisterInput, User } from '@/types/auth'
import { apiFetch } from './apiClient'

export const authApi = {
  register: (payload: RegisterInput) =>
    apiFetch<AuthResponse>('/register', { method: 'POST', body: payload }),

  login: (payload: LoginInput) =>
    apiFetch<AuthResponse>('/login', { method: 'POST', body: payload }),

  logout: () => apiFetch<void>('/logout', { method: 'POST' }),

  me: () => apiFetch<{ data: User }>('/user'),
}
