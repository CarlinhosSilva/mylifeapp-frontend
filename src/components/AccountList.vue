<script setup lang="ts">
import { computed, ref } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import DatePicker from 'primevue/datepicker'

import type { PropType } from 'vue'
import type { Account } from '../types/account.ts'
import { formatDateToApi, formatDateToBR } from '../composables/date'


const emit = defineEmits([
  'edit',
  'delete',
  'pay'
])

const props = defineProps({
  list: {
    type: Array as PropType<Account[]>,
    required: true
  },
  categories: {
    type: Array as PropType<{ id: string; description: string }[]>,
    required: true
  }
})

const dueDateFrom = ref<Date | null>(null)
const dueDateTo = ref<Date | null>(null)
const statusFilter = ref<'all' | 'pending' | 'paid'>('all')

const filteredList = computed(() => props.list.filter(account => {
  const dueDate = account.dueDate.slice(0, 10)
  const matchesFrom = !dueDateFrom.value || dueDate >= formatDateToApi(dueDateFrom.value)
  const matchesTo = !dueDateTo.value || dueDate <= formatDateToApi(dueDateTo.value)
  const matchesStatus = statusFilter.value === 'all'
    || (statusFilter.value === 'paid' && account.paid)
    || (statusFilter.value === 'pending' && !account.paid)

  return matchesFrom && matchesTo && matchesStatus
}))

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}

</script>

<template>
  <div class="filters">
    <label>
      Vencimento de
      <DatePicker v-model="dueDateFrom" dateFormat="dd/mm/yy" placeholder="dd/mm/aaaa" />
    </label>
    <label>
      Vencimento até
      <DatePicker v-model="dueDateTo" dateFormat="dd/mm/yy" placeholder="dd/mm/aaaa" />
    </label>
    <label>
      Status
      <select v-model="statusFilter">
        <option value="all">Todas</option>
        <option value="pending">Pendentes</option>
        <option value="paid">Pagas</option>
      </select>
    </label>
    <Button label="Limpar filtros" icon="pi pi-filter-slash" severity="secondary" text @click="dueDateFrom = null; dueDateTo = null; statusFilter = 'all'" />
  </div>

  <DataTable :value="filteredList">
    <Column field="description" header="Descrição" />
    <Column header="Categoria">
      <template #body="{ data }">
        {{ data.category ?? props.categories.find(category => category.id === data.categoryId)?.description }}
      </template>
    </Column>
    <Column header="Valor">
      <template #body="{ data }">
        {{ formatCurrency(data.value) }}
      </template>
    </Column>
    <Column header="Vencimento">
      <template #body="{ data }">
        {{ formatDateToBR(data.dueDate) }}
      </template>
    </Column>
    <Column header="Status">
      <template #body="{ data }">
        <div class="status">
          <span 
            class="status-dot"
            :class="data.paid ? 'paid' : 'pending'"
          ></span>

          {{ data.paid ? 'Pago' : 'Pendente' }}
        </div>
      </template>
    </Column>
    <Column header="Ações">
      <template #body="{ data }">
        <div class="actions">
            <Button
              v-if="!data.paid"
              icon="pi pi-money-bill"
              text
              rounded
              severity="success"
              @click="emit('pay', data)"
            />

            <Button
              icon="pi pi-pencil"
              text
              rounded
              @click="emit('edit', data)"
            />
            
            <Button
              icon="pi pi-trash"
              text
              rounded
              severity="danger"
              @click="emit('delete', data)"
            />
        </div>
      </template>
    </Column>
    
  </DataTable>
</template>

<style>
.status {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.status-dot.paid {
  background-color: #22c55e;
}

.status-dot.pending {
  background-color: #f59e0b;
}

.actions {
  display: flex;
  gap: 8px;
}

.filters {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 12px;
  margin-bottom: 18px;
}

.filters label {
  display: flex;
  flex-direction: column;
  gap: 5px;
  color: #475569;
  font-size: 13px;
  font-weight: 600;
}

.filters input,
.filters select {
  min-height: 36px;
  padding: 7px 9px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  color: #334155;
  background: #fff;
}
</style>