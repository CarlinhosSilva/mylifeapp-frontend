import type { Category, Account, Balance, FamilySummary, FinancialStatus, Income, MonthlySummary, PaymentData, Purchase, PurchaseReport, PurchaseSummary, PurchaseDraft } from '../types/account'
import type { AuthUser, User, LoginCredentials, SignUpCredentials, UpdateUserPayload } from '../types/auth'

export async function loginWithRealApi(credentials: LoginCredentials): Promise<AuthUser> {
  const response = await fetch('/api/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  })

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new Error(body?.error || 'Falha ao autenticar')
  }

  return response.json() as Promise<AuthUser>
}

export async function signUpWithRealApi(credentials: SignUpCredentials): Promise<AuthUser> {

  const response = await fetch('/api/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  })

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new Error(body?.error || 'Falha ao registrar')
  }

  return response.json() as Promise<AuthUser>
}

export async function updateProfileWithRealApi(payload: UpdateUserPayload): Promise<UpdateUserPayload> {
  const response = await fetch('/api/profile', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${payload.token}`,
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new Error(body?.error || 'Falha ao atualizar perfil')
  }

  return response.json() as Promise<UpdateUserPayload>
}

export async function getUsersWithRealApi(token: string): Promise<User[]> {
  const response = await fetch('/api/users', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  })
  
  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new Error(body?.error || 'Falha ao buscar usuarios')
  }
  
  return response.json() as Promise<User[]>
}

export async function getCategoriesWithRealApi(token: string): Promise<Category[]> {
  const response = await fetch('/api/categories', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  })
  
  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new Error(body?.error || 'Falha ao buscar categorias')
  }
  
  return response.json() as Promise<Category[]>
}

export async function updateAccountsWithRealApi(
  account: Account,
  token: string
): Promise<Account> {

  const response = await fetch(`/api/accounts/${account.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(account)
  })

  if (!response.ok) {
    const body = await response.json().catch(() => null)

    throw new Error(
      body?.error || 'Erro ao atualizar conta'
    )
  }

  return response.json() as Promise<Account>
}


export async function createAccountsWithRealApi(
  account: Account,
  token: string
): Promise<Account> {

  const response = await fetch('/api/accounts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(account)
  })


  if (!response.ok) {

    const body = await response.json()
      .catch(() => null)

    throw new Error(
      body?.error || 'Erro ao criar conta'
    )
  }

  return response.json() as Promise<Account>
}


export async function getAccountsWithRealApi(
  token: string
): Promise<Account[]> {

  const response = await fetch('/api/accounts', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })


  if (!response.ok) {
    throw new Error('Erro ao buscar contas')
  }


  return response.json()
}

export async function getIncomesWithRealApi(token: string): Promise<Income[]> {
  const response = await fetch('/api/incomes', {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!response.ok) throw new Error('Erro ao buscar receitas')
  return response.json() as Promise<Income[]>
}

export async function createIncomeWithRealApi(income: Omit<Income, 'id'>, token: string): Promise<Income> {
  const response = await fetch('/api/incomes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(income),
  })

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new Error(body?.error || 'Erro ao criar receita')
  }

  return response.json() as Promise<Income>
}

export async function getBalanceWithRealApi(token: string): Promise<Balance> {
  const response = await fetch('/api/incomes/balance', {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!response.ok) throw new Error('Erro ao buscar saldo')
  return response.json() as Promise<Balance>
}

export async function getMonthlySummaryWithRealApi(token: string): Promise<MonthlySummary[]> {
  const response = await fetch('/api/incomes/monthly-summary', {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!response.ok) throw new Error('Erro ao buscar resumo mensal')
  return response.json() as Promise<MonthlySummary[]>
}

export async function deleteAccountWithRealApi(id: string, token: string): Promise<void> {
  const response = await fetch(`/api/accounts/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new Error(body?.error || 'Erro ao excluir conta')
  }
}

export async function payAccountWithRealApi(
  id: string,
  payment: PaymentData,
  token: string,
): Promise<Account> {
  const response = await fetch(`/api/accounts/${id}/payment`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payment),
  })

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new Error(body?.error || 'Erro ao registrar pagamento')
  }

  return response.json() as Promise<Account>
}

export async function getFamilySummaryWithRealApi(token: string): Promise<FamilySummary> {
  const response = await fetch('/api/incomes/family-summary', {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!response.ok) throw new Error('Erro ao buscar movimentação familiar')
  return response.json() as Promise<FamilySummary>
}

export async function getPurchasesWithRealApi(token: string): Promise<Purchase[]> {
  const response = await fetch('/api/purchases', {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!response.ok) throw new Error('Erro ao buscar compras')
  return response.json() as Promise<Purchase[]>
}

export async function createPurchaseWithRealApi(purchase: PurchaseDraft, token: string): Promise<Purchase> {
  const formData = new FormData()
  formData.append('supplierName', purchase.supplierName)
  formData.append('totalValue', purchase.totalValue.toFixed(2))
  formData.append('purchaseDate', purchase.purchaseDate)
  if (purchase.noteImage) {
    formData.append('note', purchase.noteImage)
  }

  const response = await fetch('/api/purchases', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  })

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new Error(body?.error || 'Erro ao criar compra')
  }

  return response.json() as Promise<Purchase>
}

export async function getPurchaseNoteImageWithRealApi(id: string, token: string): Promise<Blob> {
  const response = await fetch(`/api/purchases/${id}/note`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new Error(body?.error || 'Não foi possível abrir a imagem da nota')
  }

  return response.blob()
}

export async function deletePurchaseWithRealApi(id: string, token: string): Promise<void> {
  const response = await fetch(`/api/purchases/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new Error(body?.error || 'Erro ao excluir compra')
  }
}

export async function getPurchaseMonthlySummaryWithRealApi(token: string): Promise<PurchaseSummary[]> {
  const response = await fetch('/api/purchases/monthly-summary', {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!response.ok) throw new Error('Erro ao buscar resumo de compras')
  return response.json() as Promise<PurchaseSummary[]>
}

export async function getPurchaseReportWithRealApi(token: string): Promise<PurchaseReport> {
  const response = await fetch('/api/purchases/report', {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!response.ok) throw new Error('Erro ao buscar relatório de compras')
  return response.json() as Promise<PurchaseReport>
}

export async function getFinancialStatusWithRealApi(token: string, family = false): Promise<FinancialStatus> {
  const query = family ? '?scope=family' : ''
  const response = await fetch(`/api/incomes/financial-status${query}`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!response.ok) throw new Error('Erro ao buscar status financeiro')
  return response.json() as Promise<FinancialStatus>
}