<script setup>
defineProps({
  show: Boolean,
})
const emit = defineEmits(['close', 'saved'])

function closeModal() {
  emit('close')
}

function saveConfig() {
  let user = {
    email: document.getElementById('email').value,
    password: document.getElementById('password').value,
    name: document.getElementById('name').value,
  }
  emit('saved', user)
}
</Script>

<template>
  <Teleport to="body">
    <div v-if="show" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <h2>Alterar Cadastro</h2>

        <form class="settings-form">
          <div class="form-group">
            <label for="name">Nome</label>
            <input
              id="name"
              type="text"
              placeholder="Seu nome"
              required
            />
          </div>

          <div class="form-group">
            <label for="email">E-mail</label>
            <input
              id="email"
              type="email"
              placeholder="Seu e-mail"
              required
            />
          </div>

          <div class="form-group">
            <label for="password">Senha</label>
            <input
              id="password"
              type="password"
              placeholder="Sua senha"
              required
            />
          </div>

          <button type="button" @click="saveConfig">
            Salvar
          </button>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);

  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  width: 400px;
  background: white;
  padding: 24px;
  border-radius: 8px;
}

.settings-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-weight: 600;
}

.form-group input {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 14px;
}

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
</style>