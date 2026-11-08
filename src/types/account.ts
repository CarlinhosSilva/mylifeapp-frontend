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

export interface PurchaseItem {
  id?: string
  description: string
  quantity?: number
  unitPrice?: number
  totalValue?: number
}

export interface Purchase {
  id: string
  supplierName: string
  totalValue: number
  purchaseDate: string
  items: PurchaseItem[]
  hasNoteImage: boolean
  noteText?: string
  rawText?: string
  createdAt?: string
}

export interface PurchaseDraft {
  supplierName: string
  totalValue: number
  purchaseDate: string
  noteImage?: File
}

export interface PurchaseSummary {
  month: string
  purchases: number
  totalValue: number
}

export interface PurchaseReport {
  totalValue: number
  bySupplier: { supplierName: string; totalValue: number }[]
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
