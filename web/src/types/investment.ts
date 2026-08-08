export type InvestmentStatus = 'active' | 'withdrawn'

export interface InvestmentOwner {
  id: number
  name: string | null
}

export interface Withdrawal {
  date: string
  tax_rate: string
  tax: string
  net_amount: string
}

export interface Investment {
  id: number
  owner: InvestmentOwner
  amount: string
  currency: string
  status: InvestmentStatus
  invested_at: string
  reference_date: string
  elapsed_months: number
  expected_balance: string
  gains: string
  withdrawal: Withdrawal | null
}

export interface WithdrawalPreview {
  date: string
  gross: string
  gains: string
  tax_rate: string
  tax: string
  net: string
}

export interface NewInvestmentInput {
  amount: string
  invested_at: string
}
