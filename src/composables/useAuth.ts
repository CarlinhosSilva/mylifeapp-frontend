import { computed, ref } from 'vue'
import { loginUser } from '../services/auth'
import type { AuthUser, LoginCredentials } from '../types/auth'

const STORAGE_KEY = 'vue-auth-user'

const user = ref<AuthUser | null>(loadStoredUser())

function loadStoredUser(): AuthUser | null {
  if (typeof window === 'undefined') return null

  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) return null

  try {
    return JSON.parse(raw) as AuthUser
  } catch {
    return null
  }
}

function persistUser(nextUser: AuthUser | null) {
  if (typeof window === 'undefined') return

  if (nextUser) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser))
  } else {
    window.localStorage.removeItem(STORAGE_KEY)
  }
}

export function useAuth() {
  const isAuthenticated = computed(() => !!user.value?.token)

  async function login(credentials: LoginCredentials) {
    const nextUser = await loginUser(credentials)
    user.value = nextUser
    persistUser(nextUser)
    return nextUser
  }

  function logout() {
    user.value = null
    persistUser(null)
  }

  function getToken() {
    return user.value?.token ?? null
  }

  return {
    user,
    isAuthenticated,
    login,
    logout,
    getToken,
  }
}
