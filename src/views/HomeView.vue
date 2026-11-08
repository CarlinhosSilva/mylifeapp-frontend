<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import Button from 'primevue/button'
import { updateUserProfile, getUsers, getCategories, updateAccountApi, getAccountsApi, createAccountsApi, deleteAccountApi, payAccountApi, getIncomesApi, createIncomeApi, getBalanceApi, getMonthlySummaryApi, getPurchasesApi, createPurchaseApi, deletePurchaseApi, getPurchaseReportApi } from '../services/auth'
import { getFamilySummaryApi, getFinancialStatusApi } from '../services/auth'
import logo from '../assets/family-logo.svg'
import UserSettingsModal from '../components/UserSettingsModal.vue'
import AccountDialog from '../components/AccountDialog.vue'
import AccountList from '../components/AccountList.vue'
import type { User } from '../types/auth'
import type { Account, Balance, Category, Income, MonthlySummary, Purchase, PurchaseDraft, PurchaseReport } from '../types/account.ts'
import type { FamilySummary, FinancialStatus } from '../types/account.ts'
import type { PaymentData } from '../types/account.ts'
import DeleteAccountDialog from '../components/DeleteAccountDialog.vue'
import PaymentDialog from '../components/PaymentDialog.vue'
import IncomeDialog from '../components/IncomeDialog.vue'
import IncomeList from '../components/IncomeList.vue'
import MonthlyFinanceChart from '../components/MonthlyFinanceChart.vue'
import FamilyFinanceView from '../components/FamilyFinanceView.vue'
import PurchaseScanner from '../components/PurchaseScanner.vue'
import { formatDateToBR } from '../composables/date'

const router = useRouter()
const auth = useAuth()
const showMenu = ref(false)
const showSettings = ref(false)


const users = ref<User[]>([])
const categories = ref<Category[]>([])

const showAccountDialog = ref(false)
const selectedAccount = ref<Account | null>(null)
const accounts = ref<Account[]>([])
const accountToDelete = ref<Account | null>(null)
const accountToPay = ref<Account | null>(null)
const showDeleteDialog = ref(false)
const showPaymentDialog = ref(false)
const showIncomeDialog = ref(false)
const incomes = ref<Income[]>([])
const purchases = ref<Purchase[]>([])
const purchaseReport = ref<PurchaseReport>({ totalValue: 0, bySupplier: [] })
const purchaseRefreshWarning = ref('')
const balance = ref<Balance>({ incomes: 0, expenses: 0, balance: 0 })
const activeView = ref<'overview' | 'accounts' | 'incomes' | 'purchases' | 'users' | 'family'>('overview')
const monthlySummary = ref<MonthlySummary[]>([])
const familySummary = ref<FamilySummary | null>(null)
const incomeError = ref('')
const paymentError = ref('')
const userFinancialStatus = ref<FinancialStatus>({ isOk: true, reviewMonths: [] })
const familyFinancialStatus = ref<FinancialStatus>({ isOk: true, reviewMonths: [] })

const monthFormatter = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' })
function formatReviewMonths(status: FinancialStatus) {
  return status.reviewMonths.map(item => {
    const [year, month] = item.month.split('-').map(Number)
    return monthFormatter.format(new Date(year, month - 1, 1))
  }).join(', ')
}

async function refreshFinancialStatuses(token: string) {
  userFinancialStatus.value = await getFinancialStatusApi(token)
  familyFinancialStatus.value = await getFinancialStatusApi(token, true)
}

const pendingCurrentMonth = computed(() => monthlySummary.value.reduce((total, item) => total + (item.pending ?? 0), 0))

const dueAccounts = computed(() => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const firstDay = new Date(today)
  firstDay.setDate(today.getDate() - 7)
  const lastDay = new Date(today)
  lastDay.setDate(today.getDate() + 7)
  const firstDate = firstDay.toISOString().slice(0, 10)
  const lastDate = lastDay.toISOString().slice(0, 10)

  return accounts.value.filter(account => {
    const dueDate = account.dueDate.slice(0, 10)
    return !account.paid && dueDate >= firstDate && dueDate <= lastDate
  })
})

onMounted(async () => {
  const token = auth.getToken()
  if (!token) return

  users.value = await getUsers(token)
  categories.value = await getCategories(token)
  accounts.value = await getAccountsApi(token)
  incomes.value = await getIncomesApi(token)
  purchases.value = await getPurchasesApi(token)
  purchaseReport.value = await getPurchaseReportApi(token)
  balance.value = await getBalanceApi(token)
  monthlySummary.value = await getMonthlySummaryApi(token)
  familySummary.value = await getFamilySummaryApi(token)
  await refreshFinancialStatuses(token)
})

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

function logout() {
  auth.logout()
  router.push({ name: 'login' })
}

function toggleMenu() {
  showMenu.value = !showMenu.value
}

function openSettings() {
  showMenu.value = false
  showSettings.value = true
}

async function saveAccount(account: Account) {
  try {
    const created = await createAccountsApi(account, auth.user.value!.token!)
    accounts.value.push(created)
  } catch (error) {
    console.error(error)
  }
}

function closeSettings() {
  showSettings.value = false
}

function handleSettingsSaved(user: { email: string; password: string; name: string; token?: string }) {
  user.token = auth.user.value?.token
  updateUserProfile(user)
  closeSettings()
}

function getInitials() {
  const email = auth.user.value?.email || 'U'
  return email.charAt(0).toUpperCase()
}

function editAccount(account: Account) {
  selectedAccount.value = account
  showAccountDialog.value = true
}

function deleteAccount(account: Account) {
  accountToDelete.value = account
  showDeleteDialog.value = true
}

function payAccount(account: Account) {
  accountToPay.value = account
  paymentError.value = ''
  showPaymentDialog.value = true
}

async function confirmDelete() {
  const token = auth.getToken()
  const account = accountToDelete.value
  if (!token || !account) return

  try {
    await deleteAccountApi(account.id, token)
    accounts.value = accounts.value.filter(item => item.id !== account.id)
    balance.value = await getBalanceApi(token)
    monthlySummary.value = await getMonthlySummaryApi(token)
    familySummary.value = await getFamilySummaryApi(token)
    await refreshFinancialStatuses(token)
  } catch (error) {
    console.error(error)
  } finally {
    accountToDelete.value = null
  }
}

async function savePayment(payment: PaymentData) {
  const token = auth.getToken()
  const account = accountToPay.value
  if (!token || !account) return

  try {
    const updated = await payAccountApi(account.id, payment, token)
    accounts.value = accounts.value.map(item => item.id === updated.id ? updated : item)
    balance.value = await getBalanceApi(token)
    monthlySummary.value = await getMonthlySummaryApi(token)
    familySummary.value = await getFamilySummaryApi(token)
    await refreshFinancialStatuses(token)
    paymentError.value = ''
    showPaymentDialog.value = false
    accountToPay.value = null
  } catch (error) {
    paymentError.value = error instanceof Error ? error.message : 'Não foi possível registrar o pagamento'
    console.error(error)
  }
}

async function saveIncome(income: Omit<Income, 'id'>) {
  const token = auth.getToken()
  if (!token) return

  try {
    await createIncomeApi(income, token)
    incomes.value = await getIncomesApi(token)
    balance.value = await getBalanceApi(token)
    monthlySummary.value = await getMonthlySummaryApi(token)
    familySummary.value = await getFamilySummaryApi(token)
    await refreshFinancialStatuses(token)
    incomeError.value = ''
    activeView.value = 'incomes'
    showIncomeDialog.value = false
  } catch (error) {
    incomeError.value = error instanceof Error ? error.message : 'Não foi possível registrar a receita'
    console.error(error)
  }
}

async function savePurchase(purchase: PurchaseDraft) {
  const token = auth.getToken()
  if (!token) throw new Error('Sua sessão expirou. Entre novamente para salvar a compra.')

  const createdPurchase = await createPurchaseApi(purchase, token)
  purchases.value = [createdPurchase, ...purchases.value.filter(item => item.id !== createdPurchase.id)]
  purchaseRefreshWarning.value = ''
  activeView.value = 'purchases'

  try {
    purchaseReport.value = await getPurchaseReportApi(token)
    balance.value = await getBalanceApi(token)
    monthlySummary.value = await getMonthlySummaryApi(token)
    familySummary.value = await getFamilySummaryApi(token)
    await refreshFinancialStatuses(token)
  } catch (error) {
    console.error(error)
    purchaseRefreshWarning.value = 'A compra e a nota foram salvas, mas não foi possível atualizar todos os resumos. Atualize a página para sincronizar.'
  }
}

async function removePurchase(purchase: Purchase) {
  const token = auth.getToken()
  if (!token) return

  const confirmed = window.confirm(`Deseja excluir a compra de ${purchase.supplierName} no valor de ${formatCurrency(purchase.totalValue)}?`)
  if (!confirmed) return

  try {
    await deletePurchaseApi(purchase.id, token)
    purchases.value = purchases.value.filter(item => item.id !== purchase.id)
    purchaseReport.value = await getPurchaseReportApi(token)
    balance.value = await getBalanceApi(token)
    monthlySummary.value = await getMonthlySummaryApi(token)
    familySummary.value = await getFamilySummaryApi(token)
    await refreshFinancialStatuses(token)
  } catch (error) {
    console.error(error)
  }
}

function newAccount() {
  selectedAccount.value = null
  showAccountDialog.value = true
}



async function updateAccount(updatedAccount: Account) {

  try {
    const token = auth.getToken()
    if (!token) return

    const updated = await updateAccountApi(
      updatedAccount,
      token
    )


    accounts.value = accounts.value.map(account =>
      account.id === updated.id
        ? updated
        : account
    )

    if (updated.paid) {
      balance.value = await getBalanceApi(token)
      monthlySummary.value = await getMonthlySummaryApi(token)
        familySummary.value = await getFamilySummaryApi(token)
        await refreshFinancialStatuses(token)
    }


    selectedAccount.value = null


  } catch(error) {

    console.error(error)

  }

}

</script>

<template>
  <div class="home-page">
    <header class="topbar">
      <div class="header">
        <img :src="logo" alt="Logo" />
        <div>
          <h1>Bem-vindo(a), {{ auth.user.value?.name || auth.user.value?.email }}!</h1>
          <p class="header-subtitle">Suas Funcionalidades estão disponíveis no painel abaixo.</p>
        </div>
      </div>
      <div class="user-menu">
        <div class="balance-summary" :class="balance.balance >= 0 ? 'positive' : 'negative'">
          <small>Saldo</small>
          <strong>{{ formatCurrency(balance.balance) }}</strong>
        </div>
        <button class="status-badge" :class="userFinancialStatus.isOk ? 'status-ok' : 'status-warning'" :title="userFinancialStatus.isOk ? 'Todos os meses estão em dia' : `Revisar: ${formatReviewMonths(userFinancialStatus)}`" @click="activeView = 'users'">
          <i :class="userFinancialStatus.isOk ? 'pi pi-check-circle' : 'pi pi-exclamation-triangle'"></i>
          Usuário: {{ userFinancialStatus.isOk ? 'Em dia' : 'Revisar' }}
          <small v-if="!userFinancialStatus.isOk">{{ formatReviewMonths(userFinancialStatus) }}</small>
        </button>
        <button class="status-badge" :class="familyFinancialStatus.isOk ? 'status-ok' : 'status-warning'" :title="familyFinancialStatus.isOk ? 'Todos os meses estão em dia' : `Revisar: ${formatReviewMonths(familyFinancialStatus)}`" @click="activeView = 'family'">
          <i :class="familyFinancialStatus.isOk ? 'pi pi-check-circle' : 'pi pi-exclamation-triangle'"></i>
          Família: {{ familyFinancialStatus.isOk ? 'Em dia' : 'Revisar' }}
          <small v-if="!familyFinancialStatus.isOk">{{ formatReviewMonths(familyFinancialStatus) }}</small>
        </button>
        <button class="avatar" @click="toggleMenu">
          {{ getInitials() }}
        </button>
        <div v-if="showMenu" class="dropdown-menu">
          <div class="user-email">{{ auth.user.value?.email }}</div>
          <button @click="logout" class="menu-item">Sair</button>
          <button @click="openSettings" class="menu-item">Configurações</button>
        </div>
      </div>
    </header>

    <main class="content">
      <aside class="sidebar">
        <p class="sidebar-label">Menu</p>
        <button class="nav-item" :class="{ active: activeView === 'overview' }" @click="activeView = 'overview'">
          <i class="pi pi-home"></i>
          Visão geral
        </button>
        <button class="nav-item" :class="{ active: activeView === 'accounts' }" @click="activeView = 'accounts'">
          <i class="pi pi-wallet"></i>
          Contas a pagar
        </button>
        <button class="nav-item" :class="{ active: activeView === 'incomes' }" @click="activeView = 'incomes'">
          <i class="pi pi-arrow-down-left"></i>
          Receitas
        </button>
        <button class="nav-item" :class="{ active: activeView === 'purchases' }" @click="activeView = 'purchases'">
          <i class="pi pi-camera"></i>
          Compras
        </button>
        <button class="nav-item" :class="{ active: activeView === 'users' }" @click="activeView = 'users'">
          <i class="pi pi-users"></i>
          Usuários
        </button>
        <button class="nav-item" :class="{ active: activeView === 'family' }" @click="activeView = 'family'">
          <i class="pi pi-chart-line"></i>
          Família
        </button>
      </aside>

      <section class="dashboard-area">
        <div v-if="activeView === 'overview'" class="overview-grid">
          <div class="placeholder-card">
            <h2>Resumo financeiro</h2>
            <div class="summary-row">
              <span>Receitas</span>
              <strong class="income-value">{{ formatCurrency(balance.incomes) }}</strong>
            </div>
            <div class="summary-row">
              <span>Contas pagas</span>
              <strong class="expense-value">{{ formatCurrency(balance.expenses) }}</strong>
            </div>
            <div class="summary-row">
              <span>Contas pendentes</span>
              <strong class="pending-value">{{ formatCurrency(pendingCurrentMonth) }}</strong>
            </div>
            <div class="summary-row total-row">
              <span>Saldo atual</span>
              <strong>{{ formatCurrency(balance.balance) }}</strong>
            </div>
          </div>
          <div class="placeholder-card chart-panel">
            <MonthlyFinanceChart :data="monthlySummary" />
          </div>
          <div class="placeholder-card">
            <h2>Próximos vencimentos</h2>
            <p class="period-label">Período de 7 dias anteriores e próximos</p>
            <div v-if="dueAccounts.length" class="simple-list">
              <div v-for="account in dueAccounts" :key="account.id" class="simple-list-row">
                <span>{{ account.description }}</span>
                <small>{{ formatDateToBR(account.dueDate) }}</small>
                <strong class="expense-value">{{ formatCurrency(account.value) }}</strong>
              </div>
            </div>
            <p v-else>Nenhuma conta vencendo ou vencida nesse período.</p>
          </div>
        </div>

        <div v-else-if="activeView === 'incomes'" class="placeholder-card feature-card">
          <div class="account-header">
            <h2>Receitas</h2>
            <Button label="Nova Receita" icon="pi pi-plus" @click="incomeError = ''; showIncomeDialog = true" />
          </div>
          <IncomeList :list="incomes" />
        </div>
        <div v-else-if="activeView === 'accounts'" class="placeholder-card feature-card">

          <div class="account-header">
          
            <h2>Contas a Pagar</h2>

            <Button
              label="Nova Conta"
              icon="pi pi-plus"
              @click="newAccount"
            />
          
          </div>
        
          <AccountList
            :list="accounts"
            :categories="categories"
            @edit="editAccount"
            @delete="deleteAccount"
            @pay="payAccount"
          />
        
        </div>

        <div v-else-if="activeView === 'purchases'" class="placeholder-card feature-card">
          <div class="account-header">
            <h2>Compras do mês</h2>
          </div>

          <PurchaseScanner :purchases="purchases" :save-purchase="savePurchase" @delete="removePurchase" />
          <p v-if="purchaseRefreshWarning" class="purchase-refresh-warning" role="status">{{ purchaseRefreshWarning }}</p>

          <div v-if="purchaseReport.bySupplier.length" class="purchase-report">
            <div class="report-box">
              <h3>Resumo financeiro</h3>
              <p>Total gasto: <strong>{{ formatCurrency(purchaseReport.totalValue) }}</strong></p>
            </div>

            <div class="report-box">
              <h3>Por fornecedor</h3>
              <ul>
                <li v-for="entry in purchaseReport.bySupplier" :key="entry.supplierName">
                  {{ entry.supplierName }} — {{ formatCurrency(entry.totalValue) }}
                </li>
              </ul>
            </div>

          </div>
        </div>

        <div v-else-if="activeView === 'users'" class="placeholder-card feature-card">
          <FamilyFinanceView
            v-if="familySummary"
            :summary="familySummary"
            :user-names="users.map(user => user.name)"
            :selected-user="auth.user.value?.name"
          />
          <p v-else>Carregando finanças do usuário...</p>
        </div>
        <div v-else class="placeholder-card feature-card">
          <FamilyFinanceView v-if="familySummary" :summary="familySummary" />
          <p v-else>Carregando finanças da família...</p>
        </div>
      </section>
    </main>

    <UserSettingsModal :show="showSettings" @close="closeSettings" @saved="handleSettingsSaved" />
    <AccountDialog
      v-model:visible="showAccountDialog"
      :categories="categories"
      :account="selectedAccount"
      @save="saveAccount"
      @update="updateAccount"
    />
    <DeleteAccountDialog
      v-model:visible="showDeleteDialog"
      :account="accountToDelete"
      @confirm="confirmDelete"
    />
    <PaymentDialog
      v-model:visible="showPaymentDialog"
      :account="accountToPay"
      :error="paymentError"
      @save="savePayment"
    />
    <IncomeDialog v-model:visible="showIncomeDialog" :error="incomeError" @save="saveIncome" />
  </div>
</template>

<style scoped>
.home-page {
  min-height: 100vh;
  padding: 24px;
}

.topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  background: rgba(255, 255, 255, 0.95);
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

button {
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  cursor: pointer;
}

.purchase-report {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
  margin-top: 24px;
}

.purchase-refresh-warning {
  margin: 12px 0 0;
  color: #92400e;
  font-size: 14px;
}

.report-box {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 16px;
}

.report-box ul {
  margin: 0;
  padding-left: 16px;
  display: grid;
  gap: 8px;
}

.user-menu {
  position: relative;
  display: flex;
  align-items: center;
  gap: 16px;
}

.balance-summary {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  line-height: 1.2;
}

.balance-summary small {
  color: #64748b;
  font-size: 12px;
}

.balance-summary strong {
  font-size: 16px;
}

.balance-summary.positive strong {
  color: #15803d;
}

.balance-summary.negative strong {
  color: #b91c1c;
}

.status-badge {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  min-width: 108px;
  padding: 7px 10px;
  border: 1px solid currentColor;
  border-radius: 8px;
  background: #fff;
  font-size: 11px;
  font-weight: 700;
}

.status-badge i {
  font-size: 14px;
}

.status-badge small {
  max-width: 150px;
  overflow: hidden;
  color: currentColor;
  font-size: 10px;
  font-weight: 400;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.status-badge.status-ok {
  color: #15803d;
}

.status-badge.status-warning {
  color: #c2410c;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #4f46e5;
  color: white;
  border: none;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  font-size: 16px;
}

.avatar:hover {
  background: #4338ca;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 200px;
  margin-top: 8px;
  z-index: 10;
}

.user-email {
  padding: 12px 16px;
  border-bottom: 1px solid #e2e8f0;
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
}

.menu-item {
  display: block;
  width: 100%;
  padding: 12px 16px;
  border: none;
  background: none;
  text-align: left;
  cursor: pointer;
  color: #0f172a;
  font-size: 14px;
}

.menu-item:hover {
  background: #f1f5f9;
}

.content {
  display: flex;
  gap: 16px;
  width: 100%;
}

.sidebar {
  width: 220px;
  flex: 0 0 220px;
  padding: 20px 12px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid #dbe4ee;
  border-radius: 16px;
}

.sidebar-label {
  margin: 0 12px 12px;
  color: #64748b;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  margin-bottom: 6px;
  border: 0;
  background: transparent;
  color: #475569;
  text-align: left;
}

.nav-item i {
  width: 18px;
}

.nav-item:hover,
.nav-item.active {
  background: #e0e7ff;
  color: #3730a3;
}

.dashboard-area {
  min-height: calc(100vh - 220px);
  min-width: 0;
  flex: 1;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);

  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  gap: 24px;
}

.overview-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24px;
  width: 100%;
}

.placeholder-card {
  background: linear-gradient(135deg, #eef2ff 0%, #f8fafc 100%);
  border: 1px dashed #94a3b8;
  border-radius: 16px;
  padding: 24px;

  width: 100%;
  min-width: 0;
  max-width: none;

  overflow-x: auto;
}

.placeholder-card h2 {
  margin: 0 0 8px;
  font-size: 22px;
  color: #1e293b;
}

.placeholder-card p {
  margin: 0;
  color: #64748b;
}

.header {
  display: flex;
  align-items: center;
  gap: 12px;
  white-space: nowrap;
}

.header img {
  width: 40px;
  height: 40px;
  object-fit: contain;
  flex-shrink: 0;
}

.header h1 {
  margin: 0;
  white-space: nowrap;
  font-size: 22px;
}

.header-subtitle {
  margin: 4px 0 0;
  color: #64748b;
  font-size: 14px;
}

.account-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 0;
  border-bottom: 1px solid #dbe4ee;
}

.summary-row strong {
  color: #15803d;
}

.summary-row .expense-value {
  color: #b91c1c;
}

.summary-row .pending-value {
  color: #ca8a04;
}

.summary-row.total-row {
  border-bottom: 0;
  font-size: 18px;
}

.summary-row.total-row strong {
  color: #3730a3;
}

.period-label {
  margin: -2px 0 14px;
  font-size: 13px;
}

.simple-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.simple-list-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 110px 120px;
  align-items: center;
  gap: 16px;
  padding: 10px 0;
  border-bottom: 1px solid #dbe4ee;
}

.simple-list-row small {
  color: #64748b;
  white-space: nowrap;
}

.simple-list-row strong {
  min-width: 120px;
  text-align: right;
  white-space: nowrap;
}

@media (max-width: 800px) {
  .home-page {
    padding: 12px;
  }

  .header h1 {
    white-space: normal;
    font-size: 18px;
  }

  .header-subtitle {
    display: none;
  }

  .user-menu {
    gap: 6px;
  }

  .status-badge {
    min-width: 0;
    padding: 6px;
  }

  .status-badge small {
    display: none;
  }

  .content {
    flex-direction: column;
  }

  .sidebar {
    display: flex;
    align-items: center;
    width: 100%;
    flex-basis: auto;
    padding: 8px;
  }

  .sidebar-label {
    display: none;
  }

  .nav-item {
    justify-content: center;
    margin: 0;
    padding: 10px 6px;
    font-size: 12px;
  }

  .dashboard-area {
    padding: 16px;
  }

  .overview-grid {
    grid-template-columns: 1fr;
  }

  .account-header {
    align-items: flex-start;
    flex-direction: column;
    gap: 12px;
  }
}


</style>
