import type { Category, Account, Balance, FamilySummary, FinancialStatus, Income, MonthlySummary, PaymentData, Purchase, PurchaseDraft, PurchaseReport, PurchaseSummary } from '../types/account'
import type { AuthUser, LoginCredentials, SignUpCredentials, UpdateUserPayload, User } from '../types/auth'
import { loginWithRealApi, signUpWithRealApi, updateProfileWithRealApi, getUsersWithRealApi, getCategoriesWithRealApi, updateAccountsWithRealApi, getAccountsWithRealApi, createAccountsWithRealApi, deleteAccountWithRealApi, payAccountWithRealApi, getIncomesWithRealApi, createIncomeWithRealApi, getBalanceWithRealApi, getMonthlySummaryWithRealApi, getFamilySummaryWithRealApi, getFinancialStatusWithRealApi, getPurchasesWithRealApi, createPurchaseWithRealApi, deletePurchaseWithRealApi, getPurchaseMonthlySummaryWithRealApi, getPurchaseReportWithRealApi, getPurchaseNoteImageWithRealApi } from './auth.real'

export async function loginUser(credentials: LoginCredentials): Promise<AuthUser> {
  return loginWithRealApi(credentials)
}

export async function registerUser(credentials: SignUpCredentials): Promise<AuthUser> {
  return signUpWithRealApi(credentials)
}

export async function updateUserProfile(payload: UpdateUserPayload): Promise<UpdateUserPayload> {
  return updateProfileWithRealApi(payload)
}

export async function getUsers(token: string): Promise<User[]> {
  return getUsersWithRealApi(token)
}

export async function getCategories(token: string): Promise<Category[]> {
  return getCategoriesWithRealApi(token)
}

export async function updateAccountApi(account: Account, token: string): Promise<Account> {
  return updateAccountsWithRealApi(account, token)
}

export async function getAccountsApi(token: string): Promise<Account[]> {
  return getAccountsWithRealApi(token)
}

export async function createAccountsApi(account: Account,token: string): Promise<Account> {
  return createAccountsWithRealApi(account, token)
}

export async function deleteAccountApi(id: string, token: string): Promise<void> {
  return deleteAccountWithRealApi(id, token)
}

export async function payAccountApi(id: string, payment: PaymentData, token: string): Promise<Account> {
  return payAccountWithRealApi(id, payment, token)
}

export async function getIncomesApi(token: string): Promise<Income[]> {
  return getIncomesWithRealApi(token)
}

export async function createIncomeApi(income: Omit<Income, 'id'>, token: string): Promise<Income> {
  return createIncomeWithRealApi(income, token)
}

export async function getBalanceApi(token: string): Promise<Balance> {
  return getBalanceWithRealApi(token)
}

export async function getMonthlySummaryApi(token: string): Promise<MonthlySummary[]> {
  return getMonthlySummaryWithRealApi(token)
}

export async function getFamilySummaryApi(token: string): Promise<FamilySummary> {
  return getFamilySummaryWithRealApi(token)
}

export async function getPurchasesApi(token: string): Promise<Purchase[]> {
  return getPurchasesWithRealApi(token)
}

export async function createPurchaseApi(purchase: PurchaseDraft, token: string): Promise<Purchase> {
  return createPurchaseWithRealApi(purchase, token)
}

export async function getPurchaseNoteImageApi(id: string, token: string): Promise<Blob> {
  return getPurchaseNoteImageWithRealApi(id, token)
}

export async function deletePurchaseApi(id: string, token: string): Promise<void> {
  return deletePurchaseWithRealApi(id, token)
}

export async function getPurchaseMonthlySummaryApi(token: string): Promise<PurchaseSummary[]> {
  return getPurchaseMonthlySummaryWithRealApi(token)
}

export async function getPurchaseReportApi(token: string): Promise<PurchaseReport> {
  return getPurchaseReportWithRealApi(token)
}

export async function getFinancialStatusApi(token: string, family = false): Promise<FinancialStatus> {
  return getFinancialStatusWithRealApi(token, family)
}
