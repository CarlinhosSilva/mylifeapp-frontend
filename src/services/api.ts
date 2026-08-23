const STORAGE_KEY = 'vue-auth-user'

function loadStoredUser() {
  if (typeof window === 'undefined') return null

  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) return null

  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function getAuthToken() {
  const storedUser = loadStoredUser()
  return storedUser?.token ?? null
}

export async function authFetch(input: RequestInfo, init: RequestInit = {}) {
  const token = getAuthToken()
  const headers = new Headers(init.headers)

  headers.set('Content-Type', 'application/json')
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(input, {
    ...init,
    headers,
  })

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new Error(body?.error || 'Falha na requisição')
  }

  return response
}
