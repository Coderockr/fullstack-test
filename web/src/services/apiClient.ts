import { ApiError, type ApiErrorBody } from '@/types/api'

const BASE_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api').replace(/\/$/, '')

interface RequestOptions {
  method?: string
  body?: unknown
  params?: Record<string, string | number | undefined | null>
}

// The token provider and 401 handler are injected by the auth layer, so this
// module stays free of store/router imports (no circular dependencies).
let tokenProvider: () => string | null = () => null
let unauthorizedHandler: (() => void) | null = null

export function setTokenProvider(fn: () => string | null): void {
  tokenProvider = fn
}

export function onUnauthorized(handler: () => void): void {
  unauthorizedHandler = handler
}

function buildQuery(params?: RequestOptions['params']): string {
  if (!params) return ''
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== null)
  if (entries.length === 0) return ''
  return '?' + new URLSearchParams(entries.map(([k, v]) => [k, String(v)])).toString()
}

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, params } = options

  const headers: Record<string, string> = { Accept: 'application/json' }
  const token = tokenProvider()
  if (token) headers.Authorization = `Bearer ${token}`
  if (body !== undefined) headers['Content-Type'] = 'application/json'

  const response = await fetch(BASE_URL + path + buildQuery(params), {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (response.status === 401) {
    unauthorizedHandler?.()
  }

  if (response.status === 204) {
    return undefined as T
  }

  const data = (await response.json().catch(() => ({}))) as unknown

  if (!response.ok) {
    throw new ApiError(response.status, data as ApiErrorBody)
  }

  return data as T
}
