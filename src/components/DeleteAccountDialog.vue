<script setup lang="ts">
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'

import type { Account } from '../types/account'

const visible = defineModel<boolean>('visible')

defineProps<{
  account: Account | null
}>()

const emit = defineEmits<{
  (event: 'confirm'): void
}>()

function confirmDelete() {
  emit('confirm')
  visible.value = false
}
</script>

<template>
  <Dialog v-model:visible="visible" modal header="Excluir conta" :style="{ width: '420px' }">
    <p>Deseja realmente excluir a conta <strong>{{ account?.description }}</strong>?</p>

    <div class="dialog-actions">
      <Button label="Cancelar" severity="secondary" @click="visible = false" />
      <Button label="Excluir" severity="danger" icon="pi pi-trash" @click="confirmDelete" />
    </div>
  </Dialog>
</template>

<style scoped>
.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}
</style>
