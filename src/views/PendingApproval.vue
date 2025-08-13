<template>
  <div class="approval-page" :class="{ 'dark-theme': isDarkMode }" :dir="isArabic ? 'rtl' : 'ltr'">
    <!-- top bar: title / search -->
    <div class="toolbar">
      <h1 class="page-title">{{ pageTitle }}</h1>

      <div class="toolbar-right">
        <div class="search-container">
          <SearchIcon class="search-icon" />
          <input
            v-model="searchQuery"
            type="search"
            :placeholder="isArabic ? 'بحث...' : 'Search...'"
            class="input-search"
            @input="handleSearchInput"
          />
          <button v-if="searchQuery" @click="clearSearch" class="clear-search">×</button>
        </div>
      </div>
    </div>

    <!-- selection summary and actions -->
    <div class="selection-bar" v-if="selectedRows.length > 0">
      <span class="selection-info">
        {{
          isArabic
            ? `تم اختيار ${selectedRows.length} عنصر`
            : `${selectedRows.length} items selected`
        }}
      </span>
      <div class="action-buttons">
        <button @click="rejectSelected" class="btn-reject" :disabled="selectedRows.length === 0">
          {{ isArabic ? 'رفض' : 'Reject' }}
        </button>
        <button @click="approveSelected" class="btn-approve" :disabled="selectedRows.length === 0">
          {{ isArabic ? 'موافقة' : 'Approve' }}
        </button>
      </div>
    </div>

    <!-- loading indicator -->
    <div v-if="isLoading" class="loading-container">
      <div class="loader"></div>
      <p>{{ isArabic ? 'جاري التحميل...' : 'Loading...' }}</p>
    </div>

    <!-- table -->
    <div v-else class="table-container">
      <transition-group name="table-fade" tag="table" class="main-table">
        <thead key="head">
          <tr>
            <th class="checkbox-column">
              <label class="checkbox-container">
                <input type="checkbox" @change="toggleAllRows" :checked="allRowsSelected" />
                <span class="checkmark"></span>
              </label>
            </th>
            <th style="text-align: center">{{ tableHeaders.stateLevel }}</th>
            <th style="text-align: center">{{ tableHeaders.code }}</th>
            <th style="text-align: center">{{ tableHeaders.requestDate }}</th>
            <th style="text-align: center">{{ tableHeaders.requestedBy }}</th>
            <th style="text-align: center">{{ tableHeaders.transactionDate }}</th>
            <th style="text-align: center">{{ isArabic ? 'إجراءات' : 'Actions' }}</th>
          </tr>
        </thead>
        <tbody key="body">
          <tr
            v-for="row in paginatedRows"
            :key="row.transaction_id"
            :class="[rowBg(row.status), { 'row-selected': isRowSelected(row) }]"
            class="table-row"
          >
            <td class="checkbox-column">
              <label class="checkbox-container">
                <input
                  type="checkbox"
                  @change="toggleRowSelection(row)"
                  :checked="isRowSelected(row)"
                />
                <span class="checkmark"></span>
              </label>
            </td>
            <td>
              <span class="status-badge" :class="'status-' + row.status.toLowerCase()">
                {{ translateStatus(row.status) }}
              </span>
            </td>
            <td class="code-cell">
              <router-link :to="getDetailRoute(row)" class="code-link">
                {{ row.code }}
              </router-link>
            </td>
            <td>{{ formatDate(row.request_date) }}</td>
            <td>{{ row.requested_by }}</td>
            <td>{{ row.transaction_date }}</td>
            <td>
              <div class="action-buttons-cell">
                <button @click="viewDetails(row)" class="icon-btn view-btn" title="View Details">
                  <EyeIcon :size="16" />
                </button>
                <button @click="approveRow(row)" class="icon-btn approve-btn" title="Approve">
                  <CheckIcon :size="16" />
                </button>
                <button @click="rejectRow(row)" class="icon-btn reject-btn" title="Reject">
                  <XIcon :size="16" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </transition-group>

      <!-- No results message -->
      <div v-if="!isLoading && paginatedRows.length === 0" class="no-results">
        {{ isArabic ? 'لا توجد نتائج' : 'No results found' }}
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="!isLoading && totalItems > 0" class="pagination">
      <button @click="prevPage" :disabled="currentPage === 1" class="page-btn">
        {{ isArabic ? 'السابق' : 'Previous' }}
      </button>
      <span class="page-info">
        {{
          isArabic
            ? `الصفحة ${currentPage} من ${totalPages}`
            : `Page ${currentPage} of ${totalPages}`
        }}
      </span>
      <button @click="nextPage" :disabled="currentPage >= totalPages" class="page-btn">
        {{ isArabic ? 'التالي' : 'Next' }}
      </button>
    </div>

    <!-- Confirmation Modal -->
    <div v-if="showConfirmModal" class="modal-overlay" @click="closeConfirmModal">
      <div class="modal-container" :class="{ 'dark-theme': isDarkMode }" @click.stop>
        <div class="modal-header">
          <h2>{{ confirmModalTitle }}</h2>
          <button class="close-modal" @click="closeConfirmModal">×</button>
        </div>
        <div class="modal-body">
          <p>{{ confirmModalMessage }}</p>

          <!-- Rejection reason textarea -->
          <div v-if="confirmModalType === 'reject'" class="reason-container">
            <label for="rejection-reason" class="reason-label">
              {{ isArabic ? 'سبب الرفض:' : 'Rejection Reason:' }}
            </label>
            <textarea
              id="rejection-reason"
              v-model="rejectionReason"
              :placeholder="
                isArabic ? 'يرجى ذكر سبب الرفض...' : 'Please provide a reason for rejection...'
              "
              class="reason-textarea"
              rows="3"
            ></textarea>
            <p v-if="showReasonError" class="reason-error">
              {{ isArabic ? 'سبب الرفض مطلوب' : 'Rejection reason is required' }}
            </p>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="closeConfirmModal">
            {{ isArabic ? 'إلغاء' : 'Cancel' }}
          </button>
          <button
            :class="confirmModalType === 'approve' ? 'btn-approve' : 'btn-reject'"
            @click="confirmAction"
            :disabled="isProcessingAction"
          >
            {{
              isProcessingAction
                ? isArabic
                  ? 'جاري المعالجة...'
                  : 'Processing...'
                : confirmModalType === 'approve'
                  ? isArabic
                    ? 'موافقة'
                    : 'Approve'
                  : isArabic
                    ? 'رفض'
                    : 'Reject'
            }}
          </button>
        </div>
      </div>
    </div>

    <!-- Error Modal -->
    <div v-if="showErrorModal" class="modal-overlay" @click="closeErrorModal">
      <div class="modal-container error-modal" :class="{ 'dark-theme': isDarkMode }" @click.stop>
        <div class="modal-header">
          <h2>{{ isArabic ? 'خطأ' : 'Error' }}</h2>
          <button class="close-modal" @click="closeErrorModal">×</button>
        </div>
        <div class="modal-body">
          <p>{{ errorMessage }}</p>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="closeErrorModal">
            {{ isArabic ? 'إغلاق' : 'Close' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { SearchIcon, EyeIcon, CheckIcon, XIcon } from 'lucide-vue-next'
import { useThemeStore } from '@/stores/themeStore'
import TransfersFlowService from '@/services/TransfersFlowService'

// Define component name explicitly
defineOptions({
  name: 'PendingApprovalPage',
})

// ───────────────────────────────────────────────────────────── Route Configuration
const route = useRoute()
const router = useRouter()
const themeStore = useThemeStore()

// Route-based configuration
const routeConfig = computed(() => {
  const routeName = route.name as string

  switch (routeName) {
    case 'transfers-pending-approval':
      return {
        code: 'FAR',
        title: 'Transfers Pending Approval',
        titleAr: 'المناقلات قيد الاعتماد',
        detailRoute: '/cost-center-transfer',
      }
    case 'contracts-pending-approval':
      return {
        code: 'FAD',
        title: 'Contracts Pending Approval',
        titleAr: 'العقود قيد الاعتماد',
        detailRoute: '/contract-detail',
      }
    case 'settlements-pending-approval':
      return {
        code: 'AFS',
        title: 'Settlements Pending Approval',
        titleAr: 'التسويات قيد الاعتماد',
        detailRoute: '/settlement-detail',
      }
    default:
      return {
        code: 'FAR',
        title: 'Pending Approval',
        titleAr: 'قيد الاعتماد',
        detailRoute: '/cost-center-transfer',
      }
  }
})

// ───────────────────────────────────────────────────────────── Type Declarations
interface RowData {
  transaction_id: number
  status: string
  code: string
  request_date: string
  requested_by: string
  transaction_date: string
}

// ───────────────────────────────────────────────────────────── Theme & Lang
const isArabic = computed(() => themeStore.language === 'ar')
const isDarkMode = computed(() => themeStore.darkMode)

// ───────────────────────────────────────────────────────────── Computed Properties
const pageTitle = computed(() =>
  isArabic.value ? routeConfig.value.titleAr : routeConfig.value.title,
)

// ───────────────────────────────────────────────────────────── Table Headers
const englishHeaders = {
  stateLevel: 'State Level',
  code: 'Code',
  requestDate: 'Request Date',
  requestedBy: 'Requested By',
  transactionDate: 'Transaction Date',
}

const arabicHeaders = {
  stateLevel: 'حالة الموافقة',
  code: 'الكود',
  requestDate: 'تاريخ طلب المناقلة',
  requestedBy: 'اسم طالب المناقلة',
  transactionDate: 'شهر المناقلة',
}

const tableHeaders = computed(() => (isArabic.value ? arabicHeaders : englishHeaders))

// ───────────────────────────────────────────────────────────── API Data
const rows = ref<RowData[]>([])
const totalItems = ref(0)
const isLoading = ref(false)
const isProcessingAction = ref(false)
const errorMessage = ref('')
const showErrorModal = ref(false)

// ───────────────────────────────────────────────────────────── Helper Functions
function translateStatus(status: string) {
  const statusMap: Record<string, string> = {
    pending: isArabic.value ? 'قيد الانتظار' : 'Pending',
    approved: isArabic.value ? 'موافق عليه' : 'Approved',
    rejected: isArabic.value ? 'مرفوض' : 'Rejected',
    'under-review': isArabic.value ? 'قيد المراجعة' : 'Under Review',
  }
  return statusMap[status.toLowerCase()] || status
}

function formatDate(dateString: string) {
  try {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat(isArabic.value ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(date)
  } catch {
    return dateString
  }
}

function getDetailRoute(row: RowData) {
  return `${routeConfig.value.detailRoute}/${row.transaction_id}?viewOnly=true`
}

// ───────────────────────────────────────────────────────────── Row Selection
const selectedRows = ref<RowData[]>([])

const allRowsSelected = computed(() => {
  return paginatedRows.value.length > 0 && selectedRows.value.length === paginatedRows.value.length
})

function isRowSelected(row: RowData) {
  return selectedRows.value.some((selectedRow) => selectedRow.transaction_id === row.transaction_id)
}

function toggleRowSelection(row: RowData) {
  if (isRowSelected(row)) {
    selectedRows.value = selectedRows.value.filter(
      (selectedRow) => selectedRow.transaction_id !== row.transaction_id,
    )
  } else {
    selectedRows.value.push(row)
  }
}

function toggleAllRows(event: Event) {
  const checkbox = event.target as HTMLInputElement
  if (checkbox.checked) {
    selectedRows.value = [...paginatedRows.value]
  } else {
    selectedRows.value = []
  }
}

// ───────────────────────────────────────────────────────────── Row Styling
function rowBg(status: string) {
  const statusLower = status.toLowerCase()
  if (statusLower === 'approved') return 'row-approved'
  if (statusLower === 'rejected') return 'row-rejected'
  if (statusLower === 'under-review') return 'row-review'
  return 'row-pending'
}

// ───────────────────────────────────────────────────────────── Search & Pagination
const searchQuery = ref('')
const currentPage = ref(1)
const itemsPerPage = 10
const searchTimer = ref<number | null>(null)

function handleSearchInput() {
  if (searchTimer.value) {
    clearTimeout(searchTimer.value)
  }
  searchTimer.value = window.setTimeout(() => {
    loadTransfers()
  }, 500) as unknown as number
}

function clearSearch() {
  searchQuery.value = ''
  currentPage.value = 1
  loadTransfers()
}

async function loadTransfers() {
  try {
    isLoading.value = true
    selectedRows.value = []

    const response = await TransfersFlowService.fetchPendingTransfers(
      currentPage.value,
      itemsPerPage,
      searchQuery.value,
      routeConfig.value.code,
    )

    rows.value = (response.results || []) as unknown as RowData[]
    totalItems.value = response.count || 0
  } catch (error) {
    console.error('Error loading transfers:', error)
    errorMessage.value = isArabic.value
      ? 'حدث خطأ أثناء تحميل البيانات'
      : 'An error occurred while loading data'
    showErrorModal.value = true
    rows.value = []
    totalItems.value = 0
  } finally {
    isLoading.value = false
  }
}

function nextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    loadTransfers()
  }
}

function prevPage() {
  if (currentPage.value > 1) {
    currentPage.value--
    loadTransfers()
  }
}

const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage))
const paginatedRows = computed(() => rows.value)

// ───────────────────────────────────────────────────────────── Row Actions
function viewDetails(row: RowData) {
  router.push(getDetailRoute(row))
}

function approveRow(row: RowData) {
  showConfirmationModal('approve', [row])
}

function rejectRow(row: RowData) {
  showConfirmationModal('reject', [row])
}

// ───────────────────────────────────────────────────────────── Bulk Actions
function approveSelected() {
  showConfirmationModal('approve', selectedRows.value)
}

function rejectSelected() {
  showConfirmationModal('reject', selectedRows.value)
}

// ───────────────────────────────────────────────────────────── Confirmation Modal
const showConfirmModal = ref(false)
const confirmModalType = ref<'approve' | 'reject'>('approve')
const confirmModalTitle = ref('')
const confirmModalMessage = ref('')
const rowsToProcess = ref<RowData[]>([])
const rejectionReason = ref('')
const showReasonError = ref(false)

function showConfirmationModal(type: 'approve' | 'reject', rowsToAction: RowData[]) {
  confirmModalType.value = type
  rowsToProcess.value = rowsToAction
  // Reset rejection reason and error state when opening modal
  rejectionReason.value = ''
  showReasonError.value = false

  const count = rowsToAction.length
  if (type === 'approve') {
    confirmModalTitle.value = isArabic.value ? 'تأكيد الموافقة' : 'Confirm Approval'
    confirmModalMessage.value = isArabic.value
      ? `هل أنت متأكد من الموافقة على ${count} عنصر؟`
      : `Are you sure you want to approve ${count} item(s)?`
  } else {
    confirmModalTitle.value = isArabic.value ? 'تأكيد الرفض' : 'Confirm Rejection'
    confirmModalMessage.value = isArabic.value
      ? `هل أنت متأكد من رفض ${count} عنصر؟`
      : `Are you sure you want to reject ${count} item(s)?`
  }

  showConfirmModal.value = true
}

async function confirmAction() {
  // For rejection, validate that a reason was provided
  if (confirmModalType.value === 'reject' && !rejectionReason.value.trim()) {
    showReasonError.value = true
    return
  }

  try {
    isProcessingAction.value = true
    const transactionIds = rowsToProcess.value.map((row) => row.transaction_id)

    if (confirmModalType.value === 'approve') {
      await TransfersFlowService.approveRejectTransfers(transactionIds, 2)
    } else {
      const reasons = transactionIds.map(() => rejectionReason.value.trim())
      await TransfersFlowService.approveRejectTransfers(transactionIds, 3, reasons)
    }

    // Refresh the data
    await loadTransfers()
    closeConfirmModal()

    // Show success message
    const action = confirmModalType.value === 'approve' ? 'approved' : 'rejected'
    const actionAr = confirmModalType.value === 'approve' ? 'موافقة' : 'رفض'
    errorMessage.value = isArabic.value
      ? `تم ${actionAr} العناصر بنجاح`
      : `Items ${action} successfully`
    showErrorModal.value = true
  } catch (error) {
    console.error('Error processing action:', error)
    errorMessage.value = isArabic.value
      ? 'حدث خطأ أثناء معالجة الطلب'
      : 'An error occurred while processing the request'
    showErrorModal.value = true
  } finally {
    isProcessingAction.value = false
  }
}

function closeConfirmModal() {
  showConfirmModal.value = false
}

function closeErrorModal() {
  showErrorModal.value = false
}

// ───────────────────────────────────────────────────────────── Lifecycle
onMounted(() => {
  loadTransfers()
})

// Watch for route changes
watch(
  () => route.name,
  () => {
    currentPage.value = 1
    searchQuery.value = ''
    loadTransfers()
  },
)
</script>

<style scoped>
/* Base page styles with RTL and dark-theme support */
.approval-page {
  padding: 1.5rem;
  max-width: auto;
  margin: 0 auto;
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  color: #374151;
  transition: all 0.3s ease;
  direction: inherit;
}

/* RTL adjustments */
[dir='rtl'] .approval-page {
  background: linear-gradient(225deg, #f8fafc 0%, #e2e8f0 100%);
}

/* Dark theme styles */
.approval-page.dark-theme {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  color: #d1d5db;
}

[dir='rtl'] .approval-page.dark-theme {
  background: linear-gradient(225deg, #0f172a 0%, #1e293b 100%);
}

/* Top bar and title */
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #2d3748;
  margin: 0;
}

.dark-theme .page-title {
  color: #f8e9f0;
  text-shadow: 0 0 10px rgba(248, 233, 240, 0.3);
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

/* RTL toolbar adjustments */
[dir='rtl'] .toolbar-right {
  margin-left: 0;
  margin-right: auto;
}

/* Search input */
.search-container {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 10px;
  color: #6d7280;
  width: 16px;
  height: 16px;
}

/* RTL search adjustments */
[dir='rtl'] .search-icon {
  left: auto;
  right: 10px;
}

.input-search {
  width: 250px;
  padding: 0.6rem 0.6rem 0.6rem 2.2rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  transition: all 0.3s ease;
  font-size: 0.9rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

[dir='rtl'] .input-search {
  padding: 0.6rem 2.2rem 0.6rem 0.6rem;
}

.input-search:focus {
  border-color: #6d1a36;
  box-shadow: 0 0 0 3px rgba(109, 26, 54, 0.2);
  outline: none;
}

.clear-search {
  position: absolute;
  right: 10px;
  background: transparent;
  border: none;
  font-size: 1.2rem;
  color: #6d7280;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

[dir='rtl'] .clear-search {
  right: auto;
  left: 10px;
}

/* Dark mode search */
.dark-theme .input-search {
  background-color: #2d3748;
  color: #e2e2e2;
  border-color: #4a5568;
}

.dark-theme .input-search::placeholder {
  color: #8f8fa8;
}

.dark-theme .search-icon,
.dark-theme .clear-search {
  color: #8f8fa8;
}

/* Selection bar */
.selection-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 8px;
  padding: 0.75rem 1rem;
  margin-bottom: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  animation: slideIn 0.3s ease-out;
}

/* RTL selection bar */
[dir='rtl'] .selection-bar {
  direction: rtl;
}

.dark-theme .selection-bar {
  background-color: rgba(30, 41, 59, 0.9);
}

.selection-info {
  font-weight: 500;
  color: #4b5563;
}

.dark-theme .selection-info {
  color: #e2e2e2;
}

.action-buttons {
  display: flex;
  gap: 0.75rem;
}

/* Table container */
.table-container {
  overflow-x: auto;
  background-color: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  margin-bottom: 1rem;
}

.dark-theme .table-container {
  background-color: rgba(30, 41, 59, 0.9);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
}

.main-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  text-align: center;
  font-size: 0.875rem;
}

.main-table th,
.main-table td {
  padding: 0.8rem;
  border-bottom: 1px solid #e2e8f0;
}

.main-table th {
  background: #f8fafc;
  color: #64748b;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.05em;
  position: sticky;
  top: 0;
}

.main-table th:first-child {
  border-top-left-radius: 8px;
}

.main-table th:last-child {
  border-top-right-radius: 8px;
}

/* RTL table adjustments */
[dir='rtl'] .main-table th,
[dir='rtl'] .main-table td {
  text-align: right;
}

[dir='rtl'] .main-table th:first-child {
  border-top-left-radius: 0;
  border-top-right-radius: 8px;
}

[dir='rtl'] .main-table th:last-child {
  border-top-right-radius: 0;
  border-top-left-radius: 8px;
}

.dark-theme .main-table th {
  background: #1e293b;
  color: #a0a0b8;
}

.dark-theme .main-table td {
  border-bottom-color: #374151;
}

.table-row {
  transition: all 0.2s ease;
}

.table-row:hover {
  background-color: rgba(109, 26, 54, 0.05);
}

.dark-theme .table-row:hover {
  background-color: rgba(125, 42, 70, 0.15);
}

.row-selected {
  background-color: rgba(109, 26, 54, 0.1) !important;
}

.dark-theme .row-selected {
  background-color: rgba(125, 42, 70, 0.2) !important;
}

.no-results {
  text-align: center;
  padding: 2rem !important;
  color: #64748b;
  font-style: italic;
}

.dark-theme .no-results {
  color: #a0a0b8;
}

/* Checkbox style */
.checkbox-column {
  width: 40px;
}

.checkbox-container {
  display: block;
  position: relative;
  cursor: pointer;
  user-select: none;
  height: 20px;
  width: 20px;
  margin: 0 auto;
}

.checkbox-container input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

.checkmark {
  position: absolute;
  top: 0;
  left: 0;
  height: 20px;
  width: 20px;
  background-color: #f8fafc;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.checkbox-container:hover input ~ .checkmark {
  background-color: #f1f5f9;
  border-color: #94a3b8;
}

.checkbox-container input:checked ~ .checkmark {
  background-color: #6d1a36;
  border-color: #6d1a36;
}

.checkmark:after {
  content: '';
  position: absolute;
  display: none;
}

.checkbox-container input:checked ~ .checkmark:after {
  display: block;
}

.checkbox-container .checkmark:after {
  left: 7px;
  top: 3px;
  width: 5px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

/* Dark mode checkbox */
.dark-theme .checkmark {
  background-color: #2d3748;
  border-color: #4a5568;
}

.dark-theme .checkbox-container:hover input ~ .checkmark {
  background-color: #374151;
  border-color: #6b7280;
}

.dark-theme .checkbox-container input:checked ~ .checkmark {
  background-color: #7d2a46;
  border-color: #7d2a46;
}

/* Status badges */
.status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.status-approved {
  background-color: rgba(52, 211, 153, 0.2);
  color: #047857;
}

.status-pending {
  background-color: rgba(248, 113, 113, 0.2);
  color: #b91c1c;
}

.status-under {
  background-color: rgba(245, 158, 11, 0.2);
  color: #b45309;
}

.status-rejected {
  background-color: rgba(239, 68, 68, 0.2);
  color: #b91c1c;
}

/* Dark mode status badges */
.dark-theme .status-approved {
  background-color: rgba(52, 211, 153, 0.15);
  color: #4ade80;
}

.dark-theme .status-pending {
  background-color: rgba(248, 113, 113, 0.15);
  color: #fb7185;
}

.dark-theme .status-under {
  background-color: rgba(245, 158, 11, 0.15);
  color: #fbbf24;
}

.dark-theme .status-rejected {
  background-color: rgba(239, 68, 68, 0.15);
  color: #fb7185;
}

/* Row background colors with RTL support */
.row-pending {
  background: rgba(248, 113, 113, 0.1);
  border-left: 4px solid #f59e0b;
}

.row-approved {
  background: rgba(52, 211, 153, 0.1);
  border-left: 4px solid #10b981;
}

.row-rejected {
  background: rgba(239, 68, 68, 0.1);
  border-left: 4px solid #ef4444;
}

.row-review {
  background: rgba(245, 158, 11, 0.1);
  border-left: 4px solid #f59e0b;
}

/* RTL row adjustments */
[dir='rtl'] .row-pending {
  border-left: none;
  border-right: 4px solid #f59e0b;
}

[dir='rtl'] .row-approved {
  border-left: none;
  border-right: 4px solid #10b981;
}

[dir='rtl'] .row-rejected {
  border-left: none;
  border-right: 4px solid #ef4444;
}

[dir='rtl'] .row-review {
  border-left: none;
  border-right: 4px solid #f59e0b;
}

/* Dark mode row colors */
.dark-theme .row-pending {
  background: rgba(248, 113, 113, 0.08);
}

.dark-theme .row-approved {
  background: rgba(52, 211, 153, 0.08);
}

.dark-theme .row-rejected {
  background: rgba(239, 68, 68, 0.08);
}

.dark-theme .row-review {
  background: rgba(245, 158, 11, 0.08);
}

/* Action buttons in cells */
.action-buttons-cell {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
}

.icon-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  color: #6d1a36;
  padding: 0.4rem;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.icon-btn:hover {
  background-color: rgba(109, 26, 54, 0.1);
  transform: scale(1.1);
}

.view-btn {
  color: #3b82f6;
}

.approve-btn {
  color: #10b981;
}

.reject-btn {
  color: #ef4444;
}

.view-btn:hover {
  background-color: rgba(59, 130, 246, 0.1);
}

.approve-btn:hover {
  background-color: rgba(16, 185, 129, 0.1);
}

.reject-btn:hover {
  background-color: rgba(239, 68, 68, 0.1);
}

/* Dark mode icon buttons */
.dark-theme .icon-btn {
  color: #ff9ea0;
}

.dark-theme .view-btn {
  color: #60a5fa;
}

.dark-theme .approve-btn {
  color: #4ade80;
}

.dark-theme .reject-btn {
  color: #fb7185;
}

.dark-theme .icon-btn:hover {
  background-color: rgba(125, 42, 70, 0.2);
}

.dark-theme .view-btn:hover {
  background-color: rgba(96, 165, 250, 0.2);
}

.dark-theme .approve-btn:hover {
  background-color: rgba(74, 222, 128, 0.2);
}

.dark-theme .reject-btn:hover {
  background-color: rgba(251, 113, 133, 0.2);
}

.code-cell {
  color: #6d1a36;
  font-weight: 600;
}

.code-link {
  color: inherit;
  text-decoration: none;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.code-link:hover {
  background: #6d1a36;
  color: white;
  text-decoration: none;
}

.dark-theme .code-cell {
  color: #ff9ea0;
}

/* Pagination styles */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 1.5rem;
}

/* RTL pagination */
[dir='rtl'] .pagination {
  direction: rtl;
}

.page-btn {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
}

.page-btn:hover:not(.disabled) {
  background: #f1f5f9;
  border-color: #cbd5e1;
}

.page-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  color: #64748b;
  font-size: 0.875rem;
}

/* Dark mode pagination */
.dark-theme .page-btn {
  background: #374151;
  border-color: #4a5568;
  color: #e2e2e2;
}

.dark-theme .page-btn:hover:not(.disabled) {
  background: #4b5563;
  border-color: #6b7280;
}

.dark-theme .page-info {
  color: #a0a0b8;
}

/* Action buttons at top */
.btn-approve,
.btn-reject {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.btn-approve {
  background-color: #10b981;
  color: white;
}

.btn-reject {
  background-color: #ef4444;
  color: white;
}

.btn-approve:hover {
  background-color: #059669;
}

.btn-reject:hover {
  background-color: #dc2626;
}

.btn-approve:disabled,
.btn-reject:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
  animation: fadeIn 0.3s ease;
}

.modal-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow: hidden;
}

.dark-theme .modal-container {
  background: #1e293b;
  color: #e2e2e2;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

/* RTL modal adjustments */
[dir='rtl'] .modal-header {
  direction: rtl;
}

.dark-theme .modal-header {
  border-bottom-color: #374151;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.close-modal {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.close-modal:hover {
  background-color: rgba(0, 0, 0, 0.1);
}

.dark-theme .close-modal:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.modal-body {
  padding: 1.5rem;
  max-height: 60vh;
  overflow-y: auto;
}

/* RTL modal body */
[dir='rtl'] .modal-body {
  direction: rtl;
  text-align: right;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

/* RTL modal footer */
[dir='rtl'] .modal-footer {
  direction: rtl;
  justify-content: flex-start;
}

.dark-theme .modal-footer {
  border-top-color: #374151;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background: #e5e7eb;
  border-color: #9ca3af;
}

.dark-theme .btn-secondary {
  background: #374151;
  color: #e2e2e2;
  border-color: #4b5563;
}

.dark-theme .btn-secondary:hover {
  background: #4b5563;
  border-color: #6b7280;
}

/* Loading styles */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
}

.loader {
  border: 4px solid #f3f4f6;
  border-top: 4px solid #6d1a36;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

.dark-theme .loader {
  border-color: #374151;
  border-top-color: #7d2a46;
}

/* Rejection reason styles */
.reason-container {
  margin-top: 1rem;
}

.reason-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #374151;
}

.dark-theme .reason-label {
  color: #e2e2e2;
}

.reason-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  resize: vertical;
  min-height: 80px;
}

.reason-textarea:focus {
  outline: none;
  border-color: #6d1a36;
  box-shadow: 0 0 0 3px rgba(109, 26, 54, 0.1);
}

.dark-theme .reason-textarea {
  background: #374151;
  border-color: #4b5563;
  color: #e2e2e2;
}

.dark-theme .reason-textarea::placeholder {
  color: #9ca3af;
}

.reason-error {
  color: #ef4444;
  font-size: 0.75rem;
  margin-top: 0.25rem;
  animation: shake 0.3s ease-in-out;
}

/* Animations */
.table-fade-enter-active,
.table-fade-leave-active {
  transition: all 0.3s ease;
}

.table-fade-enter-from,
.table-fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-5px);
  }
  75% {
    transform: translateX(5px);
  }
}

/* Responsive design */
@media (max-width: 768px) {
  .toolbar {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .search-container {
    width: 100%;
  }

  .input-search {
    width: 100%;
  }

  .pagination {
    flex-direction: column;
    gap: 0.5rem;
  }

  .main-table {
    font-size: 0.75rem;
  }

  .main-table th,
  .main-table td {
    padding: 0.5rem 0.25rem;
  }

  .action-buttons-cell {
    flex-direction: column;
    gap: 0.25rem;
  }
}
</style>
