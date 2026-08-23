<script setup lang="ts">
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'

defineProps<{ list: { name: string; email: string; totalPaid: number; totalIncome: number }[] }>()

function formatCurrency(value: number) {
  const safeValue = Number.isFinite(value) ? value : 0
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(safeValue)
}
</script>
<template>
  <DataTable :value="list">
    <Column field="name" header="Nome" style="min-width: 220px" />
    <Column field="email" header="E-mail" style="min-width: 320px" />
    <Column header="Total de entradas">
      <template #body="{ data }">{{ formatCurrency(data.totalIncome) }}</template>
    </Column>
    <Column header="Total pago">
      <template #body="{ data }">{{ formatCurrency(data.totalPaid) }}</template>
    </Column>
  </DataTable>
</template>