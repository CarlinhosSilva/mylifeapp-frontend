<script setup lang="ts">
import { computed, ref } from 'vue'
import type { FamilySummary, MonthlySummary } from '../types/account'
import MonthlyFinanceChart from './MonthlyFinanceChart.vue'
import { formatDateToBR } from '../composables/date'

const props = defineProps<{
  summary: FamilySummary
  userNames?: string[]
  selectedUser?: string
}>()

const month = ref(new Date().toISOString().slice(0, 7))
const userName = ref(props.selectedUser ?? props.userNames?.[0] ?? '')
const monthOptions = computed(() => {
  const currentYear = new Date().getFullYear()
  return Array.from({ length: 24 }, (_, index) => {
    const date = new Date(currentYear, 11 - index, 1)
    const value = date.toISOString().slice(0, 7)
    const label = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(date)
    return { value, label: label.charAt(0).toUpperCase() + label.slice(1) }
  })
})
const userMode = computed(() => Boolean(props.userNames))

const filteredTransactions = computed(() => props.summary.transactions.filter(transaction => {
  const matchesMonth = transaction.date?.slice(0, 7) === month.value
  const matchesUser = !userMode.value || transaction.userName === userName.value
  return matchesMonth && matchesUser
}))

const filteredSummary = computed(() => {
  const days = new Map<string, MonthlySummary>()
  for (const transaction of filteredTransactions.value) {
    const day = transaction.date.slice(8, 10)
    const current = days.get(day) ?? { day, incomes: 0, expenses: 0, pending: 0 }
    if (transaction.type === 'INCOME') current.incomes += transaction.value
    else if (transaction.type === 'PAYMENT') current.expenses += transaction.value
    else current.pending += transaction.value
    days.set(day, current)
  }

  return [...days.values()].sort((first, second) => first.day.localeCompare(second.day))
})

const filteredTotals = computed(() => filteredTransactions.value.reduce((totals, transaction) => {
  if (transaction.type === 'INCOME') totals.incomes += transaction.value
  else if (transaction.type === 'PAYMENT') totals.expenses += transaction.value
  return totals
}, { incomes: 0, expenses: 0 }))

const pendingTotal = computed(() => filteredTransactions.value
  .filter(transaction => transaction.type === 'ACCOUNT')
  .reduce((total, transaction) => total + transaction.value, 0))

const pendingCount = computed(() => filteredTransactions.value.filter(transaction => transaction.type === 'ACCOUNT').length)

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}
</script>

<template>
  <div class="family-view">
    <div class="family-heading">
      <div>
        <h2>{{ userMode ? 'Finanças do usuário' : 'Finanças da família' }}</h2>
        <p>{{ userMode ? 'Entradas e pagamentos do usuário selecionado' : 'Entradas e pagamentos de todos os usuários' }}</p>
      </div>
      <strong class="status" :class="pendingCount === 0 ? 'ok' : 'attention'">
        <i :class="pendingCount === 0 ? 'pi pi-check-circle' : 'pi pi-exclamation-triangle'"></i>
        {{ pendingCount === 0 ? 'Contas em dia' : `${pendingCount} conta(s) pendente(s)` }}
      </strong>
    </div>

    <div class="filters">
      <label>Mês
        <select v-model="month">
          <option v-for="option in monthOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
        </select>
      </label>
      <label v-if="props.userNames">Usuário
        <select v-model="userName">
          <option v-for="name in props.userNames" :key="name" :value="name">{{ name }}</option>
        </select>
      </label>
    </div>

    <div class="family-summary">
      <div><small>Total de entradas</small><strong class="income">{{ formatCurrency(filteredTotals.incomes) }}</strong></div>
      <div><small>Total pago</small><strong class="expense">{{ formatCurrency(filteredTotals.expenses) }}</strong></div>
      <div><small>Total pendente</small><strong class="pending">{{ formatCurrency(pendingTotal) }}</strong></div>
      <div><small>Saldo do período</small><strong>{{ formatCurrency(filteredTotals.incomes - filteredTotals.expenses) }}</strong></div>
    </div>

    <MonthlyFinanceChart :data="filteredSummary" />

    <section>
      <h3>Movimentações</h3>
      <div v-if="filteredTransactions.length" class="transactions">
        <div v-for="transaction in filteredTransactions" :key="`${transaction.type}-${transaction.id}`" class="transaction-row">
          <div>
            <strong>{{ transaction.description }}</strong>
            <small>{{ transaction.userName }} · {{ formatDateToBR(transaction.date) }}</small>
          </div>
          <span :class="transaction.type === 'INCOME' ? 'income' : transaction.type === 'PAYMENT' ? 'expense' : 'pending'">
            {{ transaction.type === 'INCOME' ? '+' : transaction.type === 'PAYMENT' ? '-' : 'A pagar: ' }} {{ formatCurrency(transaction.value) }}
          </span>
        </div>
      </div>
          <p v-else>Nenhuma movimentação encontrada para o filtro.</p>
    </section>
  </div>
</template>

<style scoped>
.family-view { width: 100%; }
.family-heading { display: flex; justify-content: space-between; gap: 20px; align-items: flex-start; margin-bottom: 24px; }
.family-heading h2 { margin: 0 0 4px; color: #1e293b; }
.family-heading p { margin: 0; color: #64748b; }
.filters { display: flex; flex-wrap: wrap; gap: 16px; margin-bottom: 20px; }
.filters label { display: flex; align-items: center; gap: 8px; color: #475569; font-weight: 600; }
.filters input, .filters select { border: 1px solid #cbd5e1; border-radius: 6px; padding: 8px; color: #334155; background: white; }
.status { display: flex; align-items: center; gap: 8px; white-space: nowrap; }
.status.ok { color: #15803d; }
.status.attention { color: #c2410c; }
.family-summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 28px; }
.family-summary div { padding: 16px; border: 1px solid #dbe4ee; border-radius: 8px; background: rgba(255,255,255,.55); }
.family-summary small, .family-summary strong { display: block; }
.family-summary small { color: #64748b; margin-bottom: 6px; }
.family-summary strong { font-size: 20px; }
.income { color: #15803d; }
.expense { color: #c2410c; }
.pending { color: #ca8a04; }
h3 { margin: 28px 0 12px; color: #1e293b; }
.transactions { display: flex; flex-direction: column; }
.transaction-row { display: flex; justify-content: space-between; gap: 16px; padding: 12px 0; border-bottom: 1px solid #dbe4ee; }
.transaction-row div { display: flex; flex-direction: column; gap: 3px; }
.transaction-row small { color: #64748b; }
.transaction-row span { white-space: nowrap; font-weight: 700; }
@media (max-width: 700px) {
  .family-heading { flex-direction: column; }
  .family-summary { grid-template-columns: 1fr; }
}
</style>