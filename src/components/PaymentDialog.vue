<script setup lang="ts">
import { ref, watch } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import DatePicker from 'primevue/datepicker'
import Dropdown from 'primevue/dropdown'

import type { Account, PaymentData, PaymentMethod } from '../types/account'
import { formatDateToApi, parseDate } from '../composables/date'

const visible = defineModel<boolean>('visible')

const props = defineProps<{
  account: Account | null
  error?: string
}>()

const emit = defineEmits<{
  (event: 'save', payment: PaymentData): void
}>()

const paymentDate = ref<Date | null>(new Date())
const paymentMethod = ref<PaymentMethod | null>(null)
const paymentMethods = [
  { label: 'PIX', value: 'PIX' as PaymentMethod },
  { label: 'Dinheiro', value: 'DINHEIRO' as PaymentMethod },
  { label: 'Cartao', value: 'CARTAO' as PaymentMethod },
]

function resetForm() {
  paymentDate.value = props.account?.paymentDate
    ? parseDate(props.account.paymentDate)
    : new Date()
  paymentMethod.value = props.account?.paymentMethod ?? null
}

function savePayment() {
  if (!paymentDate.value || !paymentMethod.value) return

  emit('save', {
    paymentDate: formatDateToApi(paymentDate.value),
    paymentMethod: paymentMethod.value,
  })
}

watch(() => visible.value, (opened) => {
  if (opened) resetForm()
})
</script>

<template>
  <Dialog v-model:visible="visible" modal header="Informar pagamento" :style="{ width: '420px' }">
    <div class="form">
      <p v-if="props.error" class="error-message">{{ props.error }}</p>
      <label for="payment-date">Data do pagamento</label>
      <DatePicker
        id="payment-date"
        v-model="paymentDate"
        dateFormat="dd/mm/yy"
      />

      <label for="payment-method">Forma de pagamento</label>
      <Dropdown
        id="payment-method"
        v-model="paymentMethod"
        :options="paymentMethods"
        optionLabel="label"
        optionValue="value"
        placeholder="Selecione uma forma"
      />
    </div>

    <div class="dialog-actions">
      <Button label="Cancelar" severity="secondary" @click="visible = false" />
      <Button
        label="Confirmar pagamento"
        icon="pi pi-check"
        :disabled="!paymentDate || !paymentMethod"
        @click="savePayment"
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

.error-message {
  margin: 0;
  color: #b91c1c;
  font-weight: 600;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}
</style>
