<script setup lang="ts">
import type { PropType } from 'vue'
import type { Income } from '../types/account'
import { formatDateToBR } from '../composables/date'

const props = defineProps({
  list: { type: Array as PropType<Income[]>, required: true },
})

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}
</script>

<template>
  <div v-if="props.list.length" class="income-list">
    <div v-for="income in props.list" :key="income.id" class="income-row">
      <span>{{ income.description }}</span>
      <span>{{ formatCurrency(income.value) }}</span>
      <small>{{ formatDateToBR(income.receivedDate) }}</small>
    </div>
  </div>
  <p v-else class="empty-state">Nenhuma receita registrada.</p>
</template>

<style scoped>
.income-list { display: flex; flex-direction: column; gap: 10px; }
.income-row { display: grid; grid-template-columns: 1fr auto auto; gap: 16px; align-items: center; padding: 10px 0; border-bottom: 1px solid #dbe4ee; }
.income-row span:nth-child(2) { color: #15803d; font-weight: 700; }
.income-row small { color: #64748b; }
.empty-state { color: #64748b; }
</style>
