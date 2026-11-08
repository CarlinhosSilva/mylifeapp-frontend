<script setup lang="ts">
import type { MonthlySummary } from '../types/account'

const props = defineProps<{ data: MonthlySummary[] }>()

function formatCurrency(value: number) {
  const safeValue = Number.isFinite(value) ? value : 0
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(safeValue)
}

function safeValue(value: number | undefined): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0
}

function maxValue() {
  const values = props.data.flatMap(item => [
    safeValue(item.incomes),
    safeValue(item.expenses),
    safeValue(item.pending),
  ])
  return Math.max(...values, 1)
}

function barHeight(value: number | undefined) {
  const normalizedValue = safeValue(value)
  const height = Math.max((normalizedValue / maxValue()) * 100, normalizedValue ? 4 : 0)
  return `${height}%`
}
</script>

<template>
  <div class="chart-card">
    <div class="chart-heading">
      <div>
        <h2>Movimentação do mês</h2>
        <p>Receitas e contas pagas até hoje</p>
      </div>
      <div class="legend">
        <span><i class="income-dot"></i>Entradas</span>
        <span><i class="expense-dot"></i>Contas pagas</span>
        <span><i class="pending-dot"></i>Pendentes</span>
      </div>
    </div>

    <div v-if="props.data.length" class="chart" aria-label="Gráfico de receitas, contas pagas e pendentes">
      <div v-for="item in props.data" :key="item.day" class="chart-day">
        <div class="bars" :title="`${item.day}: ${formatCurrency(safeValue(item.incomes))} em entradas, ${formatCurrency(safeValue(item.expenses))} pagos e ${formatCurrency(safeValue(item.pending))} pendentes`">
          <span class="bar income-bar" :style="{ height: barHeight(item.incomes) }"></span>
          <span class="bar expense-bar" :style="{ height: barHeight(item.expenses) }"></span>
          <span class="bar pending-bar" :style="{ height: barHeight(item.pending) }"></span>
        </div>
        <small>{{ item.day }}</small>
      </div>
    </div>
    <p v-else class="empty-state">Nenhuma movimentação neste mês.</p>
  </div>
</template>

<style scoped>
.chart-card { width: 100%; }
.chart-heading { display: flex; justify-content: space-between; gap: 16px; align-items: flex-start; margin-bottom: 24px; }
.chart-heading h2 { margin: 0 0 4px; color: #1e293b; }
.chart-heading p { margin: 0; color: #64748b; }
.legend { display: flex; flex-wrap: wrap; gap: 12px; color: #64748b; font-size: 12px; }
.legend span { display: inline-flex; align-items: center; gap: 5px; }
.legend i { width: 9px; height: 9px; border-radius: 2px; }
.income-dot, .income-bar { background: #16a34a; }
.expense-dot, .expense-bar { background: #f97316; }
.pending-dot, .pending-bar { background: #ca8a04; }
.chart { display: flex; align-items: flex-end; gap: 8px; height: 220px; overflow-x: auto; padding: 0 4px 2px; border-bottom: 1px solid #cbd5e1; }
.chart-day { display: flex; flex: 1 0 22px; flex-direction: column; align-items: center; gap: 8px; min-width: 22px; height: 100%; justify-content: flex-end; }
.bars { display: flex; align-items: flex-end; justify-content: center; gap: 3px; width: 100%; height: calc(100% - 22px); }
.bar { width: 8px; min-height: 0; border-radius: 3px 3px 0 0; transition: height 180ms ease; }
.chart-day small { color: #64748b; font-size: 10px; }
.empty-state { color: #64748b; }
</style>
