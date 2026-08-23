export type PaymentMethod = 'PIX' | 'DINHEIRO' | 'CARTAO'

export interface Account {
  id: string
  description: string
  categoryId: string
  category?: string
  value: number
  dueDate: string
  paymentDate?: string
  paymentMethod?: PaymentMethod
  paid: boolean
}

export interface PaymentData {
  paymentDate: string
  paymentMethod: PaymentMethod
}


export interface AccountForm {
  description: string
  categoryId: string
  value: number
  dueDate: Date | null
  paymentDate: Date | null
}

export interface Category {
    id: string
    description: string
}

export interface Income {
  id: string
  description: string
  value: number
  receivedDate: string
}

export interface Balance {
  incomes: number
  expenses: number
  balance: number
}

export interface MonthlySummary {
  day: string
  incomes: number
  expenses: number
  pending?: number
}

export interface FamilyTransaction {
  id: string
  userName: string
  description: string
  value: number
  date: string
  type: 'INCOME' | 'PAYMENT' | 'ACCOUNT'
  paymentMethod?: string
}

export interface FamilySummary {
  transactions: FamilyTransaction[]
  incomes: number
  expenses: number
  balance: number
  monthlySummary: MonthlySummary[]
  overdueAccounts: number
  accountsInDay: boolean
}

export interface FinancialStatus {
  isOk: boolean
  reviewMonths: { month: string; pending: number }[]
}
