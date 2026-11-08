<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import Tesseract from 'tesseract.js'
import type { Purchase, PurchaseDraft } from '../types/account'
import { normalizeCurrencyValue, parsePurchaseNoteText } from '../utils/purchase'
import { getPurchaseNoteImageApi } from '../services/auth'
import { useAuth } from '../composables/useAuth'

const props = defineProps<{
  purchases: Purchase[]
  savePurchase: (purchase: PurchaseDraft) => Promise<void>
}>()
const emit = defineEmits<{
  (e: 'delete', purchase: Purchase): void
}>()
const auth = useAuth()

const supplierName = ref('')
const totalValue = ref(0)
const totalValueText = ref('')
const ocrStatus = ref('')
const purchaseDateText = ref('')
const noteFile = ref<File | null>(null)
const error = ref('')
const isProcessingImage = ref(false)
const isSaving = ref(false)
const imagePreview = ref<string | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)
const noteToViewUrl = ref<string | null>(null)
const noteViewError = ref('')
const isLoadingNote = ref(false)
const selectedMonth = ref('all')
const selectedSupplier = ref('all')
const MAX_PURCHASE_TOTAL = 9999999999.99

const monthOptions = computed(() => {
  const months = new Map<string, string>()
  props.purchases.forEach(purchase => {
    const month = purchase.purchaseDate.slice(0, 7)
    if (month) {
      const label = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(new Date(`${month}-01T00:00:00`))
      months.set(month, label)
    }
  })

  return Array.from(months.entries()).map(([value, label]) => ({ value, label }))
})

const supplierOptions = computed(() => {
  const suppliers = new Set(props.purchases.map(purchase => purchase.supplierName))
  return Array.from(suppliers).sort((a, b) => a.localeCompare(b))
})

const filteredPurchases = computed(() => {
  return props.purchases.filter(purchase => {
    const matchesMonth = selectedMonth.value === 'all' || purchase.purchaseDate.startsWith(selectedMonth.value)
    const matchesSupplier = selectedSupplier.value === 'all' || purchase.supplierName === selectedSupplier.value
    return matchesMonth && matchesSupplier
  })
})

const filteredTotal = computed(() => filteredPurchases.value.reduce((sum, purchase) => sum + purchase.totalValue, 0))

const currentMonthTotal = computed(() => {
  const month = new Date().toISOString().slice(0, 7)
  return props.purchases
    .filter(purchase => purchase.purchaseDate.startsWith(month))
    .reduce((sum, purchase) => sum + purchase.totalValue, 0)
})

const supplierSummary = computed(() => {
  const map = new Map<string, number>()

  props.purchases.forEach(purchase => {
    map.set(purchase.supplierName, (map.get(purchase.supplierName) ?? 0) + purchase.totalValue)
  })

  return Array.from(map.entries()).map(([supplierName, value]) => ({ supplierName, value }))
})

function clearImagePreview() {
  if (imagePreview.value) URL.revokeObjectURL(imagePreview.value)
  imagePreview.value = null
}

function closeSavedNote() {
  if (noteToViewUrl.value) URL.revokeObjectURL(noteToViewUrl.value)
  noteToViewUrl.value = null
  noteViewError.value = ''
}

onBeforeUnmount(() => {
  clearImagePreview()
  closeSavedNote()
})

function handleImageUpload(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    error.value = 'Selecione uma imagem JPG, PNG ou WEBP da nota fiscal.'
    input.value = ''
    return
  }

  if (file.size > 8 * 1024 * 1024) {
    error.value = 'A imagem da nota deve ter no máximo 8 MB.'
    input.value = ''
    return
  }

  clearImagePreview()
  noteFile.value = file
  error.value = ''
  imagePreview.value = URL.createObjectURL(file)
  isProcessingImage.value = true
  void processImageFile(file)
}

async function processImageFile(file: File) {
  ocrStatus.value = 'Lendo imagem da nota...'
  error.value = ''

  try {
    const { data } = await Tesseract.recognize(file, 'por', {
      logger: ({ status, progress }) => {
        if (status && progress > 0) {
          ocrStatus.value = `${status} (${Math.round(progress * 100)}%)`
        }
      },
    })
    const parsed = parsePurchaseNoteText(data.text || '')
    if (parsed.supplierName) supplierName.value = parsed.supplierName
    if (parsed.totalValue > 0) {
      totalValue.value = parsed.totalValue
      totalValueText.value = parsed.totalValue.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    }
    if (parsed.purchaseDate) purchaseDateText.value = formatIsoDateToDisplay(parsed.purchaseDate)
    if (!parsed.supplierName && parsed.totalValue <= 0 && !parsed.purchaseDate) {
      error.value = 'Não foi possível identificar os campos automaticamente. Preencha-os manualmente.'
    }
  } catch (ocrError) {
    error.value = ocrError instanceof Error
      ? `Não foi possível ler a nota: ${ocrError.message}. Você ainda pode preencher os campos manualmente.`
      : 'Não foi possível ler a nota. Você ainda pode preencher os campos manualmente.'
  } finally {
    ocrStatus.value = ''
    isProcessingImage.value = false
  }
}

function formatIsoDateToDisplay(value: string) {
  if (!value) return ''

  const trimmed = value.trim()
  const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (isoMatch) {
    const [, year, month, day] = isoMatch
    return `${day}/${month}/${year}`
  }

  return trimmed
}

function formatDisplayDateToIso(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 8)
  if (digits.length < 8) return ''

  const day = digits.slice(0, 2)
  const month = digits.slice(2, 4)
  const year = digits.slice(4, 8)

  return `${year}-${month}-${day}`
}

function formatDisplayValue(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 8)
  if (!digits) return ''

  const day = digits.slice(0, 2)
  const month = digits.slice(2, 4)
  const year = digits.slice(4, 8)

  const parts: string[] = []
  if (day) parts.push(day)
  if (month) parts.push(month)
  if (year) parts.push(year)

  return parts.join('/').replace(/\/+/g, '/')
}

function handleDateInput(event: Event) {
  const input = event.target as HTMLInputElement
  const formatted = formatDisplayValue(input.value)
  purchaseDateText.value = formatted
}

function formatDateForDisplay(value: string) {
  return formatIsoDateToDisplay(value)
}

function normalizeDateValue(value: string) {
  return formatDisplayDateToIso(value)
}

function handleTotalValueInput(event: Event) {
  const input = event.target as HTMLInputElement
  const value = input.value.replace(/[^\d,.-]/g, '')

  totalValueText.value = value
  totalValue.value = normalizeCurrencyValue(value)
}

async function viewSavedNote(purchase: Purchase) {
  const token = auth.getToken()
  if (!token) {
    noteViewError.value = 'Sua sessão expirou. Entre novamente para visualizar a nota.'
    return
  }

  closeSavedNote()
  isLoadingNote.value = true
  try {
    const image = await getPurchaseNoteImageApi(purchase.id, token)
    noteToViewUrl.value = URL.createObjectURL(image)
  } catch (viewError) {
    noteViewError.value = viewError instanceof Error ? viewError.message : 'Não foi possível visualizar a nota.'
  } finally {
    isLoadingNote.value = false
  }
}

async function savePurchase() {
  const normalizedDate = normalizeDateValue(purchaseDateText.value)
  const parsedDate = new Date(`${normalizedDate}T00:00:00Z`)
  const validDate = /^\d{4}-\d{2}-\d{2}$/.test(normalizedDate)
    && !Number.isNaN(parsedDate.getTime())
    && parsedDate.toISOString().slice(0, 10) === normalizedDate

  const normalizedSupplier = supplierName.value.trim()
  if (!normalizedSupplier) {
    error.value = 'Informe o fornecedor da compra.'
    return
  }
  if (!validDate) {
    error.value = 'Informe uma data de compra válida no formato dd/mm/aaaa.'
    return
  }
  const parsedTotal = normalizeCurrencyValue(totalValueText.value)
  if (!Number.isFinite(parsedTotal) || parsedTotal <= 0 || parsedTotal > MAX_PURCHASE_TOTAL) {
    error.value = 'Informe um valor total válido entre R$ 0,01 e R$ 9.999.999.999,99.'
    return
  }

  const draft: PurchaseDraft = {
    supplierName: normalizedSupplier,
    totalValue: Math.round((parsedTotal + Number.EPSILON) * 100) / 100,
    purchaseDate: normalizedDate,
    ...(noteFile.value ? { noteImage: noteFile.value } : {}),
  }

  isSaving.value = true
  error.value = ''
  try {
    await props.savePurchase(draft)
    resetForm()
  } catch (saveError) {
    error.value = saveError instanceof Error ? saveError.message : 'Não foi possível salvar a compra.'
  } finally {
    isSaving.value = false
  }
}

function deletePurchase(purchase: Purchase) {
  emit('delete', purchase)
}

function resetForm() {
  supplierName.value = ''
  totalValue.value = 0
  totalValueText.value = ''
  purchaseDateText.value = ''
  noteFile.value = null
  clearImagePreview()
  error.value = ''

  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}
</script>

<template>
  <div class="purchase-scanner">
    <div class="scanner-panel">
      <h3>Lançar compra</h3>

      <div class="scan-actions">
        <label class="upload-button secondary">
          <input ref="fileInputRef" type="file" accept="image/jpeg,image/png,image/webp" :disabled="isProcessingImage || isSaving" @change="handleImageUpload" />
          {{ noteFile ? 'Trocar imagem da nota' : 'Carregar imagem da nota (opcional)' }}
        </label>
      </div>

      <p class="help-text">
        Envie uma imagem para sugerir fornecedor, data e valor. Confira os campos e ajuste-os manualmente antes de salvar.
      </p>

      <div v-if="imagePreview" class="image-preview-box">
        <img :src="imagePreview" alt="Pré-visualização da nota" />
      </div>

      <div v-if="ocrStatus" class="status-box">{{ ocrStatus }}</div>
      <div v-if="error" class="error-box">{{ error }}</div>

      <div class="form-grid">
        <label>
          Fornecedor
          <input v-model="supplierName" type="text" />
        </label>

        <label>
          Data da compra
          <input :value="purchaseDateText" @input="handleDateInput" type="text" inputmode="numeric" placeholder="dd/mm/yyyy" />
        </label>

        <label>
          Valor total
          <input :value="totalValueText" @input="handleTotalValueInput" type="text" inputmode="decimal" placeholder="150,49" />
        </label>

        <label class="full-width">
          Nota anexada
          <span>{{ noteFile?.name || 'Nenhuma imagem anexada' }}</span>
        </label>

      </div>

      <button type="button" class="primary save-button" :disabled="isProcessingImage || isSaving" @click="savePurchase">
        {{ isSaving ? 'Salvando...' : isProcessingImage ? 'Lendo nota...' : 'Salvar compra' }}
      </button>
    </div>

    <div class="summary-panel">
      <h3>Resumo mensal</h3>
      <div class="summary-row">
        <span>Gasto total do mês</span>
        <strong>{{ new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(currentMonthTotal) }}</strong>
      </div>

      <div class="supplier-list">
        <h4>Por fornecedor</h4>
        <div v-if="supplierSummary.length" class="supplier-item" v-for="supplier in supplierSummary" :key="supplier.supplierName">
          <span>{{ supplier.supplierName }}</span>
          <strong>{{ new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(supplier.value) }}</strong>
        </div>
        <p v-else>Nenhuma compra registrada ainda.</p>
      </div>
    </div>
  </div>

  <div class="purchase-history">
    <div class="history-header">
      <h3>Histórico de compras</h3>
      <div class="history-summary">
        <strong>{{ filteredPurchases.length }}</strong>
        <span>compras no filtro</span>
      </div>
    </div>

    <div class="filters-grid">
      <label>
        Mês
        <select v-model="selectedMonth">
          <option value="all">Todos</option>
          <option v-for="month in monthOptions" :key="month.value" :value="month.value">{{ month.label }}</option>
        </select>
      </label>

      <label>
        Fornecedor
        <select v-model="selectedSupplier">
          <option value="all">Todos</option>
          <option v-for="supplier in supplierOptions" :key="supplier" :value="supplier">{{ supplier }}</option>
        </select>
      </label>

    </div>

    <div class="history-total">
      <span>Total filtrado</span>
      <strong>{{ new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(filteredTotal) }}</strong>
    </div>

    <div v-if="filteredPurchases.length" class="purchase-table-wrapper">
      <table class="purchase-table">
        <thead>
          <tr>
            <th>Data</th>
            <th>Fornecedor</th>
            <th>Nota</th>
            <th>Valor</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="purchase in filteredPurchases" :key="purchase.id">
            <td>{{ formatDateForDisplay(purchase.purchaseDate) }}</td>
            <td>{{ purchase.supplierName }}</td>
            <td>
              <button v-if="purchase.hasNoteImage" type="button" class="secondary small" :disabled="isLoadingNote" @click="viewSavedNote(purchase)">
                {{ isLoadingNote ? 'Abrindo...' : 'Visualizar nota' }}
              </button>
              <span v-else>Sem imagem salva</span>
            </td>
            <td class="amount-cell">{{ new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(purchase.totalValue) }}</td>
            <td>
              <button type="button" class="danger-button" @click="deletePurchase(purchase)">Excluir</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <p v-else class="empty-history">Nenhuma compra encontrada para os filtros selecionados.</p>
  </div>

  <div v-if="noteToViewUrl || noteViewError" class="note-modal-backdrop" role="presentation" @click.self="closeSavedNote">
    <section class="note-modal" role="dialog" aria-modal="true" aria-label="Nota fiscal salva">
      <div class="note-modal-header">
        <h3>Nota fiscal</h3>
        <button type="button" class="secondary" @click="closeSavedNote">Fechar</button>
      </div>
      <img v-if="noteToViewUrl" :src="noteToViewUrl" alt="Imagem da nota fiscal salva" />
      <p v-else-if="noteViewError" class="error-box">{{ noteViewError }}</p>
    </section>
  </div>
</template>

<style scoped>
.purchase-scanner {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
}

.purchase-history {
  margin-top: 24px;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.history-summary {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  color: #475569;
}

.history-summary strong {
  font-size: 24px;
  color: #111827;
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 16px;
}

.filters-grid label {
  display: flex;
  flex-direction: column;
  font-weight: 600;
  color: #334155;
}

.filters-grid select {
  margin-top: 6px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 10px 12px;
  background: white;
}

.history-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0 16px;
  border-bottom: 1px solid #e2e8f0;
  margin-bottom: 16px;
  font-weight: 600;
  color: #334155;
}

.purchase-table-wrapper {
  overflow-x: auto;
}

.purchase-table {
  width: 100%;
  border-collapse: collapse;
}

.purchase-table th,
.purchase-table td {
  padding: 12px 10px;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
  vertical-align: top;
}

.purchase-table th {
  color: #475569;
  font-size: 12px;
  text-transform: uppercase;
}

.amount-cell {
  font-weight: 700;
  color: #b91c1c;
}

.empty-history {
  color: #64748b;
}

.scanner-panel,
.summary-panel {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
}

input {
  width: 100%;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 10px 12px;
  margin-top: 8px;
  box-sizing: border-box;
}

input:disabled,
button:disabled {
  cursor: not-allowed;
  opacity: 0.65;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  margin-top: 18px;
}

.full-width {
  grid-column: 1 / -1;
}

label {
  display: flex;
  flex-direction: column;
  font-weight: 600;
  font-size: 13px;
}

.primary {
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 14px;
  cursor: pointer;
}

.secondary {
  background: #e2e8f0;
  color: #0f172a;
  border: none;
  border-radius: 8px;
  padding: 10px 14px;
  cursor: pointer;
}

.upload-button {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 40px;
  overflow: hidden;
}

.upload-button input {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
}

.scan-actions {
  display: flex;
  gap: 10px;
  margin-top: 12px;
  flex-wrap: wrap;
}

.image-preview-box {
  margin-top: 16px;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  overflow: hidden;
  background: #f8fafc;
}

.image-preview-box img {
  display: block;
  width: 100%;
  max-height: 260px;
  object-fit: contain;
}

.small {
  white-space: nowrap;
}

.save-button {
  margin-top: 18px;
}

.help-text {
  color: #64748b;
  font-size: 13px;
  line-height: 1.5;
}

.status-box,
.error-box {
  margin-top: 12px;
  background: #fef2f2;
  color: #b91c1c;
  border: 1px solid #fecaca;
  border-radius: 8px;
  padding: 10px 12px;
}

.status-box {
  margin-top: 12px;
  background: #eff6ff;
  color: #1d4ed8;
  border: 1px solid #bfdbfe;
  border-radius: 8px;
  padding: 10px 12px;
}

.summary-row,
.supplier-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  border-bottom: 1px solid #e2e8f0;
}

h3, h4 {
  margin-top: 0;
}

.supplier-list {
  margin-top: 18px;
}

.note-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: grid;
  place-items: center;
  padding: 20px;
  background: rgba(15, 23, 42, 0.72);
}

.note-modal {
  width: min(900px, 100%);
  max-height: 90vh;
  overflow: auto;
  padding: 16px;
  border-radius: 12px;
  background: white;
}

.note-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.note-modal img {
  display: block;
  max-width: 100%;
  max-height: calc(90vh - 90px);
  margin: 12px auto 0;
  object-fit: contain;
}

@media (max-width: 900px) {
  .purchase-scanner {
    grid-template-columns: 1fr;
  }

  .filters-grid {
    grid-template-columns: 1fr;
  }
}
</style>
