<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { registerUser } from '../services/auth'
import logo from '../assets/family-logo.svg'

const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const errorMessage = ref('')
const loading = ref(false)

const router = useRouter()

async function handleSignUp() {
  errorMessage.value = ''
  loading.value = true

  try {
    await registerUser({
      name: name.value,
      email: email.value,
      password: password.value,
      confirmPassword: confirmPassword.value,
    })
    await router.push({ name: 'login' })
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Erro inesperado'
  } finally {
    loading.value = false
  }
}

function goToLogin() {
  router.push({ name: 'login' })
}
</script>

<template>
  <div class="signup-page">
    <form class="signup-card" @submit.prevent="handleSignUp">
      <div class="header">
        <img :src="logo" alt="Logo" />
        <h1>Controle Familiar</h1>
      </div>
      <h2>Criar Conta</h2>
      <p>Preencha os dados abaixo para se registrar</p>

      <label for="name">Nome</label>
      <input
        id="name"
        v-model="name"
        type="text"
        placeholder="Seu nome"
        required
      />

      <label for="email">E-mail</label>
      <input 
        id="email" 
        v-model="email" 
        type="email" 
        placeholder="seu@email.com" 
        required
      />

      <label for="password">Senha</label>
      <input 
        id="password" 
        v-model="password" 
        type="password" 
        placeholder="Mínimo 6 caracteres" 
        required
      />

      <label for="confirmPassword">Confirmar Senha</label>
      <input 
        id="confirmPassword" 
        v-model="confirmPassword" 
        type="password" 
        placeholder="Repita sua senha" 
        required
      />

      <button type="submit" :disabled="loading">
        {{ loading ? 'Registrando...' : 'Criar Conta' }}
      </button>

      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

      <p class="footer-text">
        Já tem conta?
        <button type="button" @click="goToLogin" class="link-button">
          Faça login
        </button>
      </p>
    </form>
  </div>
</template>

<style scoped>
.signup-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
}

.signup-card {
  width: min(100%, 420px);
  background: white;
  border-radius: 16px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
}

.header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.header img {
  width: 40px;
  height: 40px;
}

.header h1 {
  margin: 0;
  font-size: 20px;
}

h2 {
  margin: 0;
  font-size: 24px;
  color: #0f172a;
}

p {
  margin: 0;
  color: #64748b;
  font-size: 14px;
}

label {
  font-weight: 500;
  color: #0f172a;
  margin-top: 4px;
}

input {
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  font-size: 14px;
}

input:focus {
  outline: none;
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

button {
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  background: #4f46e5;
  color: white;
  cursor: pointer;
  font-weight: 500;
  margin-top: 8px;
}

button:hover:not(:disabled) {
  background: #4338ca;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error {
  color: #dc2626;
  margin: 0;
  padding: 8px 12px;
  background: #fee2e2;
  border-radius: 8px;
}

.footer-text {
  text-align: center;
  margin-top: 16px;
}

.link-button {
  background: none;
  border: none;
  color: #4f46e5;
  cursor: pointer;
  text-decoration: underline;
  padding: 0;
  font-size: 14px;
  margin: 0;
}

.link-button:hover {
  color: #4338ca;
}
</style>
