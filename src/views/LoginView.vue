<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import logo from '../assets/family-logo.svg'

const email = ref('')
const password = ref('')
const errorMessage = ref('')
const loading = ref(false)

const router = useRouter()
const auth = useAuth()

async function handleLogin() {
  errorMessage.value = ''
  loading.value = true

  try {
    await auth.login({ email: email.value, password: password.value })
    await router.push({ name: 'home' })
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Erro inesperado'
  } finally {
    loading.value = false
  }
}

function goToSignUp() {
  router.push({ name: 'signup' })
}
</script>

<template>
  <div class="login-page">
    <form class="login-card" @submit.prevent="handleLogin">
      <div class="header">
        <img :src="logo" alt="Logo" />
        <h1>Controle Familiar</h1>
      </div>

      <label for="email">E-mail</label>
      <input id="email" v-model="email" type="email" placeholder="seu@email.com" />

      <label for="password">Senha</label>
      <input id="password" v-model="password" type="password" placeholder="********" />

      <button type="submit" :disabled="loading">
        {{ loading ? 'Entrando...' : 'Entrar' }}
      </button>

      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

      <p class="footer-text">
        Não tem conta?
        <button type="button" @click="goToSignUp" class="link-button">
          Criar nova conta
        </button>
      </p>
    </form>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
}

.login-card {
  width: min(100%, 420px);
  background: white;
  border-radius: 16px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
}

input,
button {
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
}

button {
  background: #4f46e5;
  color: white;
  cursor: pointer;
}

.error {
  color: #dc2626;
  margin: 0;
}

.header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 8px;
}

.footer-text {
  text-align: center;
  margin-top: 16px;
  font-size: 14px;
  color: #64748b;
}

.link-button {
  background: none;
  border: none;
  color: #4f46e5;
  cursor: pointer;
  text-decoration: underline;
  padding: 0;
  font-size: 14px;
}

.link-button:hover {
  color: #4338ca;
}

.header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 8px;
}

.header h1 {
  margin: 0;
  font-size: 24px;
  color: #0f172a;
}

img {
  width: 60px;
  height: 60px;
  object-fit: contain;
}
</style>
