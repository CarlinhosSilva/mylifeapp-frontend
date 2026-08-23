export interface AuthUser {
  email: string
  name?: string
  token?: string
}

export interface User {
  email: string
  name: string
  totalPaid: number
  totalIncome: number
}


export interface LoginCredentials {
  email: string
  password: string
}

export interface SignUpCredentials {
  name: string
  email: string
  password: string
  confirmPassword: string
}

export interface UpdateUserPayload {
  email?: string
  password?: string
  name?: string
  token?: string
}
