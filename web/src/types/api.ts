export interface ApiErrorBody {
  message: string
  errors?: Record<string, string[]>
}

export class ApiError extends Error {
  readonly status: number
  readonly body: ApiErrorBody

  constructor(status: number, body: ApiErrorBody) {
    super(body?.message ?? 'Request failed')
    this.name = 'ApiError'
    this.status = status
    this.body = body
  }

  get validationErrors(): Record<string, string[]> {
    return this.body?.errors ?? {}
  }
}
