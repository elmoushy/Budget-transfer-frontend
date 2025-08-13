<template>
  <div class="approval-page" :class="{ 'dark-mode': isDarkMode }">
    <!-- top bar: title / search -->
    <div class="toolbar">
      <h1 class="page-title">
        {{ pageTitle }}
      </h1>

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
    <div v-else class="table-container glass-panel">
      <div class="modern-table-wrapper">
        <table class="modern-table">
          <thead>
            <tr class="table-header">
              <th class="checkbox-column">
                <label class="checkbox-container">
                  <input type="checkbox" @change="toggleAllRows" :checked="allRowsSelected" />
                  <span class="checkmark"></span>
                </label>
              </th>
              <th class="th-status">{{ tableHeaders.stateLevel }}</th>
              <th class="th-code">{{ tableHeaders.code }}</th>
              <th class="th-request-date">{{ tableHeaders.requestDate }}</th>
              <th class="th-requested-by">{{ tableHeaders.requestedBy }}</th>
              <th class="th-transaction-date">{{ tableHeaders.transactionDate }}</th>
              <th class="th-actions">{{ isArabic ? 'إجراءات' : 'Actions' }}</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in paginatedRows"
              :key="row.transaction_id"
              :class="[rowBg(row.status), { 'row-selected': isRowSelected(row) }, 'table-row']"
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
              <td class="td-status">
                <span class="status-badge" :class="'status-' + row.status.toLowerCase()">
                  {{ translateStatus(row.status) }}
                </span>
              </td>
              <td class="td-code">
                <router-link
                  :to="{ path: getDetailRoute(row), query: { viewOnly: 'true' } }"
                  class="code-link"
                >
                  {{ row.code }}
                </router-link>
              </td>
              <td class="td-request-date">{{ formatDate(row.request_date) }}</td>
              <td class="td-requested-by">{{ row.requested_by }}</td>
              <td class="td-transaction-date">{{ row.transaction_date }}</td>
              <td class="td-actions">
                <div class="action-buttons-group">
                  <button class="action-btn view-btn" @click="viewDetails(row)" title="View">
                    <EyeIcon />
                  </button>
                  <button class="action-btn approve-btn" @click="approveRow(row)" title="Approve">
                    <CheckIcon />
                  </button>
                  <button class="action-btn reject-btn" @click="rejectRow(row)" title="Reject">
                    <XIcon />
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="paginatedRows.length === 0" key="no-results">
              <td colspan="7" class="no-results">
                {{ isArabic ? 'لا توجد نتائج' : 'No results found' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Enhanced Pagination -->
    <div v-if="!isLoading && paginatedRows.length > 0" class="pagination-wrapper glass-panel">
      <div class="pagination-info">
        <span class="pagination-text">
          {{
            isArabic
              ? `عرض ${(currentPage - 1) * itemsPerPage + 1} إلى ${Math.min(currentPage * itemsPerPage, totalItems)} من ${totalItems} عنصر`
              : `Showing ${(currentPage - 1) * itemsPerPage + 1} to ${Math.min(currentPage * itemsPerPage, totalItems)} of ${totalItems} items`
          }}
        </span>
      </div>
      <div class="pagination-controls">
        <button
          class="pagination-btn pagination-btn-first"
          @click="goToFirstPage"
          :disabled="currentPage === 1"
          title="First Page"
        >
          ⟪
        </button>
        <button
          class="pagination-btn pagination-btn-prev"
          @click="prevPage"
          :disabled="currentPage === 1"
          title="Previous Page"
        >
          ⟨
        </button>

        <div class="page-numbers">
          <button
            v-for="page in visiblePages"
            :key="page"
            class="pagination-btn page-number"
            :class="{ active: page === currentPage, ellipsis: page === -1 }"
            @click="goToPage(page)"
            :disabled="page === -1"
          >
            {{ page === -1 ? '...' : page }}
          </button>
        </div>

        <button
          class="pagination-btn pagination-btn-next"
          @click="nextPage"
          :disabled="currentPage >= totalPages"
          title="Next Page"
        >
          ⟩
        </button>
        <button
          class="pagination-btn pagination-btn-last"
          @click="goToLastPage"
          :disabled="currentPage >= totalPages"
          title="Last Page"
        >
          ⟫
        </button>
      </div>
    </div>

    <!-- Confirmation Modal -->
    <div v-if="showConfirmModal" class="modal-overlay" @click="closeConfirmModal">
      <div class="modal-container" :class="{ 'dark-mode': isDarkMode }" @click.stop>
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
      <div class="modal-container error-modal" :class="{ 'dark-mode': isDarkMode }" @click.stop>
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

// ───────────────────────────────────────────────────────────── Type Declarations
interface RowData {
  transaction_id: number
  status: string
  code: string
  request_date: string
  requested_by: string
  transaction_date: string
}

interface RouteConfig {
  title: {
    ar: string
    en: string
  }
  apiCode: string
  detailRoute: string
  showViewButton: boolean
  headers: {
    ar: {
      stateLevel: string
      code: string
      requestDate: string
      requestedBy: string
      transactionDate: string
    }
    en: {
      stateLevel: string
      code: string
      requestDate: string
      requestedBy: string
      transactionDate: string
    }
  }
}

// ───────────────────────────────────────────────────────────── Route Configuration
const route = useRoute()
const router = useRouter()
const themeStore = useThemeStore()

// Route-based configuration
const routeConfigs: Record<string, RouteConfig> = {
  EnhancementsPendingApproval: {
    title: {
      ar: 'المناقلات قيد الاعتماد',
      en: 'Transfers Pending Approval',
    },
    apiCode: 'FAR',
    detailRoute: '/cost-center-transfer/:id',
    showViewButton: false,
    headers: {
      ar: {
        stateLevel: 'حالة الموافقة',
        code: 'الكود',
        requestDate: 'تاريخ طلب المناقلة',
        requestedBy: 'اسم طالب المناقلة',
        transactionDate: 'شهر المناقلة',
      },
      en: {
        stateLevel: 'State Level',
        code: 'Code',
        requestDate: 'Request Date',
        requestedBy: 'Requested By',
        transactionDate: 'Transaction Date',
      },
    },
  },
  ContractsPendingApproval: {
    title: {
      ar: 'العقود قيد الاعتماد',
      en: 'Contracts Pending Approval',
    },
    apiCode: 'FAD',
    detailRoute: '/contracts/:id',
    showViewButton: true,
    headers: {
      ar: {
        stateLevel: 'حالة الموافقة',
        code: 'الكود',
        requestDate: 'تاريخ طلب المناقلة',
        requestedBy: 'اسم طالب المناقلة',
        transactionDate: 'شهر المناقلة',
      },
      en: {
        stateLevel: 'State Level',
        code: 'Code',
        requestDate: 'Request Date',
        requestedBy: 'Requested By',
        transactionDate: 'Transaction Date',
      },
    },
  },
  SettlementsPendingApproval: {
    title: {
      ar: 'التسويات قيد الاعتماد',
      en: 'Settlements Pending Approval',
    },
    apiCode: 'AFR',
    detailRoute: '/settlements/:id',
    showViewButton: false,
    headers: {
      ar: {
        stateLevel: 'حالة الموافقة',
        code: 'الكود',
        requestDate: 'تاريخ طلب المناقلة',
        requestedBy: 'اسم طالب المناقلة',
        transactionDate: 'شهر المناقلة',
      },
      en: {
        stateLevel: 'State Level',
        code: 'Code',
        requestDate: 'Request Date',
        requestedBy: 'Requested By',
        transactionDate: 'Transaction Date',
      },
    },
  },
}

const routeConfig = computed(() => {
  return routeConfigs[route.name as string] || routeConfigs['EnhancementsPendingApproval']
})

// ───────────────────────────────────────────────────────────── Theme & Lang
const isArabic = computed(() => themeStore.language === 'ar')
const isDarkMode = computed(() => themeStore.darkMode)

// ───────────────────────────────────────────────────────────── Computed Properties
const pageTitle = computed(() => {
  return isArabic.value ? routeConfig.value.title.ar : routeConfig.value.title.en
})

const tableHeaders = computed(() => {
  return isArabic.value ? routeConfig.value.headers.ar : routeConfig.value.headers.en
})

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
    'under-review': isArabic.value ? 'قيد المراجعة' : 'Under Review',
    approved: isArabic.value ? 'تمت الموافقة' : 'Approved',
    rejected: isArabic.value ? 'تم الرفض' : 'Rejected',
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

function getDetailRoute(row: RowData): string {
  return routeConfig.value.detailRoute.replace(':id', row.transaction_id.toString())
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
    currentPage.value = 1
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
    console.log(
      `[UnifiedPendingApproval] Loading data for route: ${String(route.name)}, API code: ${routeConfig.value.apiCode}`,
    )

    const response = await TransfersFlowService.fetchPendingTransfers(
      currentPage.value,
      itemsPerPage,
      searchQuery.value,
      routeConfig.value.apiCode,
    )

    console.log(`[UnifiedPendingApproval] API Response:`, response)

    // Map data based on route type with different field mappings
    if (route.name === 'ContractsPendingApproval') {
      // Contracts use different field mapping
      console.log(`[UnifiedPendingApproval] Using Contracts field mapping`)
      rows.value = (response.results || []).map((item: Record<string, unknown>) => ({
        transaction_id: Number(item.id || item.transaction_id) || 0,
        status: String(item.status || ''),
        code: String(item.code || ''),
        request_date: String(item.request_date || ''),
        requested_by: String(item.requested_by || ''),
        transaction_date: String(item.transaction_date || ''),
      }))
    } else {
      // Transfers and Settlements use similar field mapping
      console.log(`[UnifiedPendingApproval] Using Transfers/Settlements field mapping`)
      rows.value = (response.results || []).map((item: Record<string, unknown>) => ({
        transaction_id: Number(item.id || item.transaction_id) || 0,
        status: String(item.status || ''),
        code: String(item.transfer_id || item.code || ''),
        request_date: String(item.created_at || item.request_date || ''),
        requested_by: String(item.user_name || item.requested_by || ''),
        transaction_date: String(item.updated_at || item.transaction_date || ''),
      }))
    }

    console.log(`[UnifiedPendingApproval] Mapped rows:`, rows.value)

    totalItems.value = response.count || 0
    // Clear selection when data changes
    selectedRows.value = []
  } catch (error) {
    console.error('Failed to load transfers:', error)
    errorMessage.value = isArabic.value
      ? 'حدث خطأ أثناء تحميل البيانات. يرجى المحاولة مرة أخرى.'
      : 'An error occurred while loading data. Please try again.'
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

function goToFirstPage() {
  currentPage.value = 1
  loadTransfers()
}

function goToLastPage() {
  currentPage.value = totalPages.value
  loadTransfers()
}

function goToPage(page: number) {
  if (page >= 1 && page <= totalPages.value && page !== -1) {
    currentPage.value = page
    loadTransfers()
  }
}

const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage))

const visiblePages = computed(() => {
  const pages: number[] = []
  const total = totalPages.value
  const current = currentPage.value

  if (total <= 7) {
    // Show all pages if total is 7 or less
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    // Always show first page
    pages.push(1)

    if (current <= 4) {
      // Near beginning
      for (let i = 2; i <= 5; i++) {
        pages.push(i)
      }
      pages.push(-1) // ellipsis
      pages.push(total)
    } else if (current >= total - 3) {
      // Near end
      pages.push(-1) // ellipsis
      for (let i = total - 4; i <= total; i++) {
        pages.push(i)
      }
    } else {
      // Middle
      pages.push(-1) // ellipsis
      for (let i = current - 1; i <= current + 1; i++) {
        pages.push(i)
      }
      pages.push(-1) // ellipsis
      pages.push(total)
    }
  }

  return pages
})

const paginatedRows = computed(() => rows.value)

// ───────────────────────────────────────────────────────────── Row Actions
function viewDetails(row: RowData) {
  const routePath = getDetailRoute(row)
  router.push({
    path: routePath,
    query: { viewOnly: 'true' },
  })
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
      ? `هل أنت متأكد من موافقتك على ${count} من المناقلات؟`
      : `Are you sure you want to approve ${count} transfer request${count === 1 ? '' : 's'}?`
  } else {
    confirmModalTitle.value = isArabic.value ? 'تأكيد الرفض' : 'Confirm Rejection'
    confirmModalMessage.value = isArabic.value
      ? `هل أنت متأكد من رفضك لـ ${count} من المناقلات؟`
      : `Are you sure you want to reject ${count} transfer request${count === 1 ? '' : 's'}?`
  }

  showConfirmModal.value = true
}

function closeConfirmModal() {
  showConfirmModal.value = false
}

function closeErrorModal() {
  showErrorModal.value = false
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
    const decision = confirmModalType.value === 'approve' ? 2 : 3
    const reasons =
      confirmModalType.value === 'reject'
        ? transactionIds.map(() => rejectionReason.value.trim())
        : []

    await TransfersFlowService.approveRejectTransfers(transactionIds, decision, reasons)

    // Success - refresh the data
    await loadTransfers()
    closeConfirmModal()

    // Show success message (you can implement a toast notification here)
    const actionText =
      confirmModalType.value === 'approve'
        ? isArabic.value
          ? 'الموافقة'
          : 'approval'
        : isArabic.value
          ? 'الرفض'
          : 'rejection'

    const successMessage = isArabic.value
      ? `تم ${actionText} بنجاح`
      : `${actionText.charAt(0).toUpperCase() + actionText.slice(1)} successful`

    console.log(successMessage) // Replace with toast notification if available
  } catch (error) {
    console.error('Error processing action:', error)
    errorMessage.value = isArabic.value
      ? 'حدث خطأ أثناء معالجة الطلب. يرجى المحاولة مرة أخرى.'
      : 'An error occurred while processing the request. Please try again.'
    showErrorModal.value = true
  } finally {
    isProcessingAction.value = false
  }
}

// ───────────────────────────────────────────────────────────── Lifecycle
onMounted(() => {
  loadTransfers()
})

// Watch for route changes to reload data with new config
watch(
  () => route.name,
  () => {
    currentPage.value = 1
    searchQuery.value = ''
    selectedRows.value = []
    loadTransfers()
  },
)

// Watch theme changes
watch(
  () => themeStore.language,
  () => {
    // Reload transfers to update status translations
    loadTransfers()
  },
)
</script>

<style scoped>
/* Import shared styles and override specific elements */
.approval-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8f6f8 0%, #fff6fa 35%, #f0e8f2 70%, #e8d5e8 100%);
  padding: 24px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

/* Dark mode styles */
.dark-mode {
  background: linear-gradient(135deg, #1a1623 0%, #241726 35%, #2d1b32 70%, #362040 100%);
  color: #f8e9f0;
}

/* Use the modern glass panel from shared styles */
.glass-panel {
  background: rgba(255, 246, 250, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(228, 201, 214, 0.4);
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(138, 42, 68, 0.1);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.glass-panel:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 24px rgba(138, 42, 68, 0.15);
  border-color: rgba(225, 75, 106, 0.3);
}

.dark-mode .glass-panel {
  background: rgba(36, 23, 38, 0.9);
  border-color: rgba(81, 32, 60, 0.4);
  box-shadow: 0 4px 16px rgba(167, 56, 92, 0.15);
}

.dark-mode .glass-panel:hover {
  box-shadow: 0 6px 24px rgba(167, 56, 92, 0.2);
  border-color: rgba(225, 75, 106, 0.4);
}

/* Top bar and title - keep existing styles */
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 0 8px;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: #6d1a36;
  margin: 0;
  text-shadow: 0 2px 4px rgba(109, 26, 54, 0.1);
}

.dark-mode .page-title {
  color: #f8e9f0;
  text-shadow: 0 2px 4px rgba(248, 233, 240, 0.1);
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

/* Search input - keep existing styles */
.search-container {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 12px;
  width: 20px;
  height: 20px;
  color: #8a2a44;
  z-index: 1;
}

.input-search {
  padding: 12px 16px 12px 44px;
  border: 2px solid #e4c9d6;
  border-radius: 12px;
  font-size: 14px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  width: 300px;
}

.input-search:focus {
  outline: none;
  border-color: #8a2a44;
  box-shadow: 0 0 0 3px rgba(138, 42, 68, 0.1);
}

.clear-search {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  font-size: 18px;
  color: #8a2a44;
  cursor: pointer;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Dark mode search */
.dark-mode .input-search {
  background: rgba(36, 23, 38, 0.9);
  border-color: #51203c;
  color: #f8e9f0;
}

.dark-mode .input-search::placeholder {
  color: #a87394;
}

.dark-mode .search-icon,
.dark-mode .clear-search {
  color: #e14b6a;
}

/* Selection bar - keep existing styles */
.selection-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(225, 75, 106, 0.1);
  border: 1px solid rgba(225, 75, 106, 0.2);
  border-radius: 12px;
  padding: 16px 20px;
  margin-bottom: 20px;
  backdrop-filter: blur(10px);
}

.dark-mode .selection-bar {
  background: rgba(225, 75, 106, 0.15);
  border-color: rgba(225, 75, 106, 0.3);
}

.selection-info {
  font-weight: 600;
  color: #6d1a36;
}

.dark-mode .selection-info {
  color: #f8e9f0;
}

.action-buttons {
  display: flex;
  gap: 12px;
}

/* Override table container to use modern styling */
.table-container {
  margin-bottom: 1.5rem;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.modern-table-wrapper {
  overflow-x: auto;
  max-width: 100%;
}

.modern-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  font-size: 0.875rem;
}

.dark-mode .modern-table {
  background: #1e1e2e;
}

/* Table Header */
.table-header {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
}

.dark-mode .table-header {
  background: linear-gradient(135deg, #2d3748 0%, #1a202c 100%);
}

.modern-table th {
  padding: 1rem 0.75rem;
  text-align: center;
  font-weight: 600;
  color: #374151;
  border-bottom: 2px solid #e5e7eb;
  white-space: nowrap;
  font-size: 0.875rem;
}

.dark-mode .modern-table th {
  color: #e2e2e2;
  border-bottom-color: #4a5568;
}

/* Table Data Cells */
.modern-table td {
  padding: 1rem 0.75rem;
  text-align: center;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
}

.dark-mode .modern-table td {
  border-bottom-color: #374151;
}

/* Table Row Hover Effects */
.table-row {
  transition: all 0.2s ease;
}

.table-row:hover {
  background: #f8fafc;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.dark-mode .table-row:hover {
  background: #2d3748;
}

/* Row selection styles */
.row-selected {
  background: rgba(225, 75, 106, 0.1) !important;
  border-left: 4px solid #e14b6a;
}

.dark-mode .row-selected {
  background: rgba(225, 75, 106, 0.2) !important;
}

/* Status-based Row Colors */
.row-pending {
  border-left: 4px solid #f59e0b;
}

.row-approved {
  border-left: 4px solid #10b981;
}

.row-rejected {
  border-left: 4px solid #ef4444;
}

.row-review {
  border-left: 4px solid #3b82f6;
}

/* Dark mode row variants */
.dark-mode .row-pending {
  background: linear-gradient(135deg, rgba(146, 64, 14, 0.1), rgba(120, 53, 15, 0.05));
  border-left-color: #d97706;
}

.dark-mode .row-approved {
  background: linear-gradient(135deg, rgba(4, 120, 87, 0.1), rgba(6, 95, 70, 0.05));
  border-left-color: #10b981;
}

.dark-mode .row-rejected {
  background: linear-gradient(135deg, rgba(220, 38, 38, 0.1), rgba(185, 28, 28, 0.05));
  border-left-color: #dc2626;
}

.dark-mode .row-review {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05));
  border-left-color: #3b82f6;
}

/* Checkbox styles - keep existing */
.checkbox-column {
  width: 50px;
  text-align: center;
}

.checkbox-container {
  position: relative;
  display: inline-block;
  cursor: pointer;
}

.checkbox-container input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

.checkmark {
  position: relative;
  top: 0;
  left: 0;
  height: 20px;
  width: 20px;
  background-color: rgba(255, 255, 255, 0.9);
  border: 2px solid #e4c9d6;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.checkbox-container:hover input ~ .checkmark {
  background-color: rgba(225, 75, 106, 0.1);
  border-color: #e14b6a;
}

.checkbox-container input:checked ~ .checkmark {
  background-color: #e14b6a;
  border-color: #e14b6a;
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
  left: 6px;
  top: 2px;
  width: 6px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

/* Dark mode checkbox */
.dark-mode .checkmark {
  background-color: rgba(36, 23, 38, 0.9);
  border-color: #51203c;
}

.dark-mode .checkbox-container:hover input ~ .checkmark {
  background-color: rgba(225, 75, 106, 0.2);
  border-color: #e14b6a;
}

.dark-mode .checkbox-container input:checked ~ .checkmark {
  background-color: #e14b6a;
  border-color: #e14b6a;
}

/* Code Link */
.code-link {
  color: #6d1a36;
  text-decoration: none;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.code-link:hover {
  background: #6d1a36;
  color: white;
  text-decoration: none;
}

.dark-mode .code-link {
  color: #e14b6a;
}

.dark-mode .code-link:hover {
  background: #e14b6a;
  color: white;
}

/* Action Buttons */
.action-buttons-group {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  align-items: center;
}

.action-btn {
  padding: 0.5rem;
  border: none;
  border-radius: 6px;
  background: #f3f4f6;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.view-btn:hover {
  background: #3b82f6;
  color: white;
}

.approve-btn:hover {
  background: #10b981;
  color: white;
}

.reject-btn:hover {
  background: #ef4444;
  color: white;
}

.dark-mode .action-btn {
  background: #374151;
  color: #e2e2e2;
}

/* Status badges */
.status-badge {
  padding: 0.375rem 0.75rem;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.status-pending {
  background: #fef3c7;
  color: #92400e;
}

.status-approved {
  background: #d1fae5;
  color: #065f46;
}

.status-rejected {
  background: #fee2e2;
  color: #991b1b;
}

.status-under {
  background: #dbeafe;
  color: #1e40af;
}

.status-badge:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Dark mode status badges */
.dark-mode .status-pending {
  background: rgba(146, 64, 14, 0.2);
  color: #fbbf24;
}

.dark-mode .status-approved {
  background: rgba(4, 120, 87, 0.2);
  color: #4ade80;
}

.dark-mode .status-rejected {
  background: rgba(220, 38, 38, 0.2);
  color: #f87171;
}

.dark-mode .status-under {
  background: rgba(37, 99, 235, 0.2);
  color: #60a5fa;
}

/* Enhanced Pagination Styles */
.pagination-wrapper {
  padding: 1.5rem;
  border-radius: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.pagination-info {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.pagination-text {
  color: #6b7280;
  font-weight: 500;
}

.dark-mode .pagination-text {
  color: #d1d5db;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.pagination-btn {
  padding: 0.5rem 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: white;
  color: #374151;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
  min-width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pagination-btn:hover:not(:disabled) {
  background: #6d1a36;
  color: white;
  border-color: #6d1a36;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(109, 26, 54, 0.2);
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.pagination-btn.active {
  background: #6d1a36;
  color: white;
  border-color: #6d1a36;
}

.page-numbers {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.page-number {
  min-width: 35px;
  height: 35px;
  padding: 0;
}

.pagination-btn.ellipsis {
  cursor: default;
  background: transparent;
  border: none;
  color: #6b7280;
}

.pagination-btn.ellipsis:hover {
  background: transparent;
  transform: none;
  box-shadow: none;
}

.dark-mode .pagination-btn {
  background: #374151;
  color: #e2e2e2;
  border-color: #4a5568;
}

.dark-mode .pagination-btn:hover:not(:disabled) {
  background: #8a2a44;
  border-color: #8a2a44;
}

.dark-mode .pagination-btn.active {
  background: #8a2a44;
  border-color: #8a2a44;
}

/* Action buttons at top */
.btn-approve,
.btn-reject {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-approve {
  background: rgba(34, 197, 94, 0.1);
  color: #059669;
  border: 2px solid rgba(34, 197, 94, 0.2);
}

.btn-reject {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
  border: 2px solid rgba(239, 68, 68, 0.2);
}

.btn-approve:hover {
  background: #059669;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);
}

.btn-reject:hover {
  background: #dc2626;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
}

.btn-approve:disabled,
.btn-reject:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* Loading container */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.loader {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(225, 75, 106, 0.2);
  border-left-color: #e14b6a;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

.dark-mode .loader {
  border-color: rgba(225, 75, 106, 0.3);
  border-left-color: #e14b6a;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.no-results {
  text-align: center;
  padding: 40px 20px;
  color: #8a2a44;
  font-style: italic;
}

.dark-mode .no-results {
  color: #e14b6a;
}

/* Modal styles - keep existing */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
}

.modal-container {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  transform: scale(0.9);
  animation: modalEnter 0.3s ease forwards;
}

.modal-header {
  padding: 20px 24px;
  border-bottom: 1px solid #e5e5e5;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #f8f6f8, #fff6fa);
}

.modal-header h2 {
  margin: 0;
  color: #6d1a36;
  font-size: 1.4rem;
  font-weight: 700;
}

.close-modal {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #8a2a44;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.close-modal:hover {
  background: rgba(138, 42, 68, 0.1);
  color: #6d1a36;
}

.modal-body {
  padding: 24px;
  max-height: 400px;
  overflow-y: auto;
}

.modal-footer {
  padding: 20px 24px;
  border-top: 1px solid #e5e5e5;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  background: #fafafa;
}

.btn-secondary {
  padding: 10px 20px;
  border: 2px solid #e4c9d6;
  background: white;
  color: #6d1a36;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  background: #f5f5f5;
  border-color: #d1b3c4;
}

/* Dark mode modal */
.dark-mode.modal-container {
  background: #241726;
  color: #f8e9f0;
}

.dark-mode .modal-header {
  background: linear-gradient(135deg, #2d1b32, #241726);
  border-bottom-color: #51203c;
}

.dark-mode .modal-header h2 {
  color: #f8e9f0;
}

.dark-mode .close-modal {
  color: #e14b6a;
}

.dark-mode .close-modal:hover {
  background: rgba(225, 75, 106, 0.2);
  color: #f8e9f0;
}

.dark-mode .modal-footer {
  background: #1a1623;
  border-top-color: #51203c;
}

.dark-mode .btn-secondary {
  background: #2d1b32;
  border-color: #51203c;
  color: #f8e9f0;
}

.dark-mode .btn-secondary:hover {
  background: #362040;
  border-color: #6d3a56;
}

.error-modal .modal-header {
  background: linear-gradient(135deg, #fef2f2, #fee2e2);
}

.dark-mode .error-modal .modal-header {
  background: linear-gradient(135deg, #451a1a, #3f1515);
}

/* Rejection reason styles */
.reason-container {
  margin-top: 20px;
}

.reason-label {
  display: block;
  font-weight: 600;
  color: #6d1a36;
  margin-bottom: 8px;
}

.reason-textarea {
  width: 100%;
  padding: 12px;
  border: 2px solid #e4c9d6;
  border-radius: 8px;
  font-family: inherit;
  font-size: 14px;
  resize: vertical;
  min-height: 80px;
  transition: all 0.3s ease;
}

.reason-textarea:focus {
  outline: none;
  border-color: #e14b6a;
  box-shadow: 0 0 0 3px rgba(225, 75, 106, 0.1);
}

.dark-mode .reason-textarea {
  background: rgba(36, 23, 38, 0.9);
  border-color: #51203c;
  color: #f8e9f0;
}

.dark-mode .reason-textarea::placeholder {
  color: #a87394;
}

.dark-mode .reason-label {
  color: #f8e9f0;
}

.reason-error {
  color: #dc2626;
  font-size: 12px;
  margin-top: 6px;
  animation: shake 0.5s ease-in-out;
}

.dark-mode .reason-error {
  color: #f87171;
}

@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  10%,
  30%,
  50%,
  70%,
  90% {
    transform: translateX(-2px);
  }
  20%,
  40%,
  60%,
  80% {
    transform: translateX(2px);
  }
}

@keyframes modalEnter {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .pagination-wrapper {
    flex-direction: column;
    text-align: center;
  }

  .pagination-info {
    justify-content: center;
  }

  .modern-table {
    font-size: 0.75rem;
  }

  .modern-table th,
  .modern-table td {
    padding: 0.5rem 0.25rem;
  }

  .action-buttons-group {
    flex-direction: column;
    gap: 0.25rem;
  }
}

/* RTL support */
[dir='rtl'] .search-icon {
  left: auto;
  right: 12px;
}

[dir='rtl'] .input-search {
  padding: 12px 44px 12px 16px;
}

[dir='rtl'] .clear-search {
  left: 12px;
  right: auto;
}

[dir='rtl'] .modal-footer {
  justify-content: flex-start;
}
</style>
