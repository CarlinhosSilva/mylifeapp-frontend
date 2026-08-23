<script setup lang="ts">
import { ref, watch } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import DatePicker from 'primevue/datepicker'
import type { Income } from '../types/account'
import { formatDateToApi } from '../composables/date'

const visible = defineModel<boolean>('visible')
const props = defineProps<{ income?: Income | null; error?: string }>()
const emit = defineEmits<{ (event: 'save', income: Omit<Income, 'id'>): void }>()

const description = ref('')
const value = ref<number | null>(null)
const receivedDate = ref<Date | null>(new Date())

function resetForm() {
  description.value = ''
  value.value = null
  receivedDate.value = new Date()
}

function saveIncome() {
  if (!description.value.trim() || value.value == null || !receivedDate.value) return
  emit('save', {
    description: description.value.trim(),
    value: value.value,
    receivedDate: formatDateToApi(receivedDate.value),
  })
}

watch(() => visible.value, opened => {
  if (opened) resetForm()
})
</script>

<template>
  <Dialog v-model:visible="visible" modal header="Nova receita" :style="{ width: '420px' }">
    <div class="form">
      <p v-if="props.error" class="error-message">{{ props.error }}</p>
      <label for="income-description">Descrição</label>
      <InputText id="income-description" v-model="description" placeholder="Ex: Salário" />
      <label for="income-value">Valor</label>
      <InputNumber id="income-value" v-model="value" mode="currency" currency="BRL" locale="pt-BR" />
      <label for="income-date">Data de entrada</label>
      <DatePicker id="income-date" v-model="receivedDate" dateFormat="dd/mm/yy" />
    </div>
    <div class="dialog-actions">
      <Button label="Cancelar" severity="secondary" @click="visible = false" />
      <Button label="Adicionar receita" icon="pi pi-plus" :disabled="!description.trim() || value == null || !receivedDate" @click="saveIncome" />
    </div>
  </Dialog>
</template>

<style scoped>
.form { display: flex; flex-direction: column; gap: 10px; }
.form label { font-weight: 600; margin-top: 8px; }
.dialog-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; }
.error-message { margin: 0; color: #b91c1c; font-weight: 600; }
</style>