const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export interface Investment {
  id: string;
  owner: string;
  creationDate: string;
  amountCents: number;
  balanceCents: number;
  status: 'ACTIVE' | 'WITHDRAWN';
  withdrawnAt: string | null;
}

export interface WithdrawalResult {
  withdrawalDate: string;
  balanceCents: number;
  gainCents: number;
  taxRate: number;
  taxCents: number;
  netCents: number;
}

export interface InvestmentDetail extends Investment {
  gainCents: number;
  withdrawal: WithdrawalResult | null;
}

export interface Paginated<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface TimelinePoint {
  date: string;
  monthIndex: number;
  balanceCents: number;
  projected: boolean;
}

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string | null,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const FRIENDLY_MESSAGES: Record<string, string> = {
  INVALID_AMOUNT: 'O valor do investimento não pode ser negativo.',
  INVALID_DATE: 'Data inválida.',
  CREATION_IN_FUTURE: 'A data de criação deve ser hoje ou no passado.',
  WITHDRAWAL_BEFORE_CREATION:
    'O saque não pode ser anterior à criação do investimento.',
  WITHDRAWAL_IN_FUTURE: 'A data do saque não pode estar no futuro.',
  ALREADY_WITHDRAWN: 'Este investimento já foi sacado.',
};

interface ApiErrorBody {
  error?: string;
  message?: string | string[];
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as ApiErrorBody;
    const code = typeof body.error === 'string' ? body.error : null;
    const rawMessage = Array.isArray(body.message)
      ? body.message.join('; ')
      : body.message;
    const message =
      (code && FRIENDLY_MESSAGES[code]) ??
      rawMessage ??
      `Erro ${response.status}`;
    throw new ApiError(response.status, code, message);
  }
  return (await response.json()) as T;
}

export const api = {
  list(params: { owner?: string; page?: number; limit?: number } = {}) {
    const query = new URLSearchParams();
    if (params.owner) query.set('owner', params.owner);
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    const suffix = query.size > 0 ? `?${query.toString()}` : '';
    return request<Paginated<Investment>>(`/investments${suffix}`);
  },

  get(id: string) {
    return request<InvestmentDetail>(`/investments/${id}`);
  },

  create(data: { owner: string; amountCents: number; creationDate: string }) {
    return request<Investment>('/investments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  previewWithdrawal(id: string, withdrawalDate: string) {
    return request<WithdrawalResult>(
      `/investments/${id}/withdrawal-preview?withdrawalDate=${withdrawalDate}`,
    );
  },

  withdraw(id: string, withdrawalDate: string) {
    return request<InvestmentDetail>(`/investments/${id}/withdraw`, {
      method: 'POST',
      body: JSON.stringify({ withdrawalDate }),
    });
  },

  timeline(id: string) {
    return request<{ points: TimelinePoint[] }>(`/investments/${id}/timeline`);
  },
};
