import { defineStore } from 'pinia'

interface User {
  email: string
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    isAuthenticated: false,
  }),
  actions: {
    async login(email: string, password: string) {
      if (!email || !password) {
        throw new Error('Preencha e-mail e senha')
      }

      if (email === 'demo@vue.com' && password === '123456') {
        this.user = { email }
        this.isAuthenticated = true
        return true
      }

      throw new Error('Credenciais inválidas')
    },
    logout() {
      this.user = null
      this.isAuthenticated = false
    },
  },
})
