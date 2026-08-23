<script setup lang="ts">
import { ref, watch } from 'vue'

import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import DatePicker from 'primevue/datepicker'
import Button from 'primevue/button'
import Dropdown from 'primevue/dropdown'

import type { Account, AccountForm, Category } from '../types/account'
import { formatDateToApi, parseDate } from '../composables/date'

const visible = defineModel<boolean>('visible')

const props = defineProps<{
  categories: Category[]
  account?: Account | null
}>()

const emit = defineEmits<{
  (e: 'save', account: Account): void
  (e: 'update', account: Account): void
}>()

function createEmptyAccount(): AccountForm {
  return {
    description: '',
    categoryId: '',
    value: 0,
    dueDate: null,
    paymentDate: null
  }
}

const form = ref<AccountForm>(createEmptyAccount())

function resetForm() {
  form.value = createEmptyAccount()
}

function loadAccount(account: Account) {
  console.log('Loading account:', account)
  form.value = {
    description: account.description,
    categoryId: account.categoryId,
    value: account.value,
    dueDate: parseDate(account.dueDate),
    paymentDate: parseDate(account.paymentDate ?? '')
  }
}

function closeDialog() {
  resetForm()
  visible.value = false
}

function saveAccount() {
  const account: Account = {
    id: props.account?.id ?? crypto.randomUUID(),
    description: form.value.description,
    categoryId: form.value.categoryId,
    value: form.value.value,
    dueDate: formatDateToApi(form.value.dueDate),
    paymentDate: form.value.paymentDate
      ? formatDateToApi(form.value.paymentDate)
      : undefined,
    paid: props.account?.paid ?? false
  }

  if (props.account) {
    emit('update', account)
  } else {
    emit('save', account)
  }

  closeDialog()
}

watch(
  () => visible.value,
  (opened) => {
    if (!opened) return

    if (props.account) {
      loadAccount(props.account)
    } else {
      resetForm()
    }
  }
)
</script>

<template>
  <Dialog
    v-model:visible="visible"
    modal
    :header="props.account ? 'Editar Conta' : 'Nova Conta'"
    :style="{ width: '500px' }"
  >
    <div class="form">

      <label>Descrição</label>

      <InputText
        v-model="form.description"
        placeholder="Ex: Luz"
      />

      <label>Categoria</label>

      <Dropdown
        v-model="form.categoryId"
        :options="props.categories"
        optionLabel="description"
        optionValue="id"
        placeholder="Selecione uma categoria"
        class="w-full"
      />

      <label>Valor</label>

      <InputNumber
        v-model="form.value"
        mode="currency"
        currency="BRL"
        locale="pt-BR"
      />

      <label>Data de vencimento</label>

      <DatePicker
        v-model="form.dueDate"
        dateFormat="dd/mm/yy"
      />

    </div>

    <div class="dialog-actions">

      <Button
        label="Cancelar"
        severity="secondary"
        @click="closeDialog"
      />

      <Button
        :label="props.account ? 'Atualizar' : 'Salvar'"
        icon="pi pi-check"
        @click="saveAccount"
      />

    </div>

  </Dialog>
</template>

<style scoped>
.form {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.form label {
  font-weight: 600;
  margin-top: 8px;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}
</style>