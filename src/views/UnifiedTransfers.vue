<template>
  <div
    class="unified-page"
    :class="[pageClass, { 'dark-theme': themeStore.darkMode }]"
    :dir="isArabic ? 'rtl' : 'ltr'"
  >
    <!-- Simplified background effects -->
    <div class="background-effects">
      <div class="floating-orb orb-1"></div>
      <div class="floating-orb orb-2"></div>
    </div>

    <!-- Page Header -->
    <div class="page-header glass-panel">
      <div class="header-left">
        <h1 class="page-title">{{ pageTitle }}</h1>
        <p class="page-subtitle">{{ pageSubtitle }}</p>
      </div>
      <div class="header-right">
        <button class="btn-primary" @click="openNewRequestModal" :title="newRequestButtonTitle">
          <span>{{ newRequestButtonText }}</span>
        </button>
      </div>
    </div>

    <!-- Search and Filters -->
    <div class="search-section glass-panel">
      <div class="search-container">
        <div class="search-input-wrapper">
          <input
            v-model="searchQuery"
            type="text"
            class="search-input"
            :placeholder="searchPlaceholder"
            @input="handleSearchInput"
            @focus="handleSearchFocus"
            @blur="handleSearchBlur"
          />
          <button v-if="searchQuery" class="clear-search" @click="clearSearch">
            <span>×</span>
          </button>
        </div>
        <div class="search-actions">
          <button class="btn-filter" title="Advanced Filters">
            <span>Filters</span>
          </button>
          <button class="btn-refresh" @click="fetchData" title="Refresh Data">
            <span>⟳</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Main Table -->
    <div class="table-container glass-panel">
      <div v-if="loading" class="loading-state">
        <div class="loading-container">
          <div class="loading-spinner-enhanced">
            <div class="spinner-ring ring-1"></div>
            <div class="spinner-ring ring-2"></div>
            <div class="loading-core">
              <div class="core-dot"></div>
            </div>
          </div>
          <div class="loading-dots">
            <span class="dot dot-1"></span>
            <span class="dot dot-2"></span>
            <span class="dot dot-3"></span>
          </div>
        </div>
        <p class="loading-text">{{ loadingText }}</p>
        <div class="loading-progress">
          <div class="progress-bar"></div>
        </div>
      </div>

      <div v-else-if="displayedRows.length === 0" class="empty-state">
        <div class="empty-icon">📋</div>
        <h3>{{ emptyStateTitle }}</h3>
        <p>{{ emptyStateMessage }}</p>
      </div>

      <div v-if="!loading" class="modern-table-wrapper">
        <table class="modern-table">
          <thead>
            <tr class="table-header">
              <th class="th-actions">{{ tableHeaders.actions }}</th>
              <th class="th-code">{{ tableHeaders.code }}</th>
              <th class="th-requested-by">{{ tableHeaders.requestedBy }}</th>
              <th class="th-description">{{ tableHeaders.description }}</th>
              <th class="th-request-date">{{ tableHeaders.requestDate }}</th>
              <th class="th-transaction-date">{{ tableHeaders.transactionDate }}</th>
              <th class="th-track">{{ tableHeaders.track }}</th>
              <th class="th-status">{{ tableHeaders.status }}</th>
              <th class="th-attachments">{{ tableHeaders.attachments }}</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in displayedRows"
              :key="row.transaction_id"
              :class="['table-row', rowBg(row.status)]"
              @mouseenter="applyMagneticEffect"
            >
              <!-- Actions Column -->
              <td class="td-actions">
                <div class="action-buttons-group">
                  <button
                    class="action-btn edit-btn"
                    :class="{ disabled: !isWaitingToSubmit(row) }"
                    @click="isWaitingToSubmit(row) ? editRow(row) : null"
                    :disabled="!isWaitingToSubmit(row)"
                    :title="isWaitingToSubmit(row) ? 'Edit' : 'Cannot edit after submission'"
                  >
                    <EditIcon :size="16" />
                  </button>
                  <button
                    class="action-btn delete-btn"
                    :class="{ disabled: !isWaitingToSubmit(row) }"
                    @click="isWaitingToSubmit(row) ? deleteRow(row) : null"
                    :disabled="!isWaitingToSubmit(row)"
                    :title="isWaitingToSubmit(row) ? 'Delete' : 'Cannot delete after submission'"
                  >
                    <TrashIcon :size="16" />
                  </button>
                  <!-- Rejection Icon for rejected items -->
                  <button
                    v-if="isRejectionClickable(row)"
                    class="action-btn rejection-icon-btn"
                    @click="showRejectionPopup(row)"
                    :title="isArabic ? 'عرض سبب الرفض' : 'View rejection reason'"
                  >
                    <span class="rejection-icon-small">⚠</span>
                  </button>
                </div>
              </td>

              <!-- Code Column -->
              <td class="td-code">
                <router-link
                  :to="getDetailRoute(row)"
                  class="code-link"
                  @click="setSourceNavigation(row)"
                >
                  {{ row.code }}
                </router-link>
              </td>

              <!-- Requested By -->
              <td class="td-requested-by">{{ row.requested_by }}</td>

              <!-- Description -->
              <td class="td-description">
                <button
                  class="description-btn"
                  @click="viewDesc(row)"
                  title="View full description"
                >
                  <FileTextIcon :size="16" />
                </button>
              </td>

              <!-- Request Date -->
              <td class="td-request-date">{{ formatDate(row.request_date) }}</td>

              <!-- Transaction Date -->
              <td class="td-transaction-date">{{ row.transaction_date }}</td>

              <!-- Track -->
              <td class="td-track">
                <button class="track-btn" @click="openOracleTrackingModal()">Track</button>
              </td>

              <!-- Status -->
              <td class="td-status">
                <span
                  class="status-badge"
                  :class="'status-' + row.status.toLowerCase()"
                  @click="openApprovalModal(row)"
                  role="button"
                >
                  {{ row.status }}
                </span>
              </td>

              <!-- Attachments -->
              <td class="td-attachments">
                <button
                  class="attachment-btn"
                  @click="openFileModal(row)"
                  :title="getAttachmentTooltip(row)"
                >
                  Attachments
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Enhanced Pagination -->
    <div v-if="!loading && displayedRows.length > 0" class="pagination-wrapper glass-panel">
      <div class="pagination-info">
        <span class="pagination-text">{{ paginationText }}</span>
        <div class="items-per-page">
          <!-- <span>Items per page:</span>
          <select class="page-size-select" v-model="pageSize" @change="handlePageSizeChange">
            <option value="6">6</option>
            <option value="12">12</option>
            <option value="24">24</option>
            <option value="50">50</option>
          </select> -->
        </div>
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

    <!-- Modals -->
    <component
      :is="newRequestModalComponent"
      v-model="showModal"
      @submit="handleNewRequestSubmit"
    />

    <component
      :is="editModalComponent"
      v-model="showEditModal"
      :contract-data="currentEditTransfer"
      @submit="handleEditSubmit"
    />

    <AttachmentModal
      :show="showFileModal"
      @update:show="showFileModal = $event"
      :transactionId="currentTransactionId"
      :status="currentTransactionStatus"
      @files-updated="handleFilesUpdated"
    />

    <ApprovalPipelineModal
      v-model="showApprovalModal"
      :approval-data="currentApproval as Record<string, unknown>"
    />

    <RejectionReportModal v-model="showRejectionModal" :transactionId="currentRejectionId" />

    <OracleApprovalPipelineModal v-model="showOracleTrackingModal" />

    <FuturisticPopup v-model="showPopup" :type="popupType" :message="popupMessage" :timer="3000" />

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-overlay" @click="cancelDelete">
      <div class="modal-container delete-modal" @click.stop>
        <div class="modal-header">
          <h3>{{ deleteModalTitle }}</h3>
          <button class="close-modal" @click="cancelDelete">×</button>
        </div>
        <div class="modal-body">
          <p>{{ deleteModalMessage }}</p>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="cancelDelete">
            {{ cancelButtonText }}
          </button>
          <button class="btn-danger" @click="confirmDelete">
            {{ confirmDeleteButtonText }}
          </button>
        </div>
      </div>
    </div>

    <!-- Description Modal -->
    <div v-if="showDescModal" class="modal-overlay" @click="closeDescModal">
      <div class="modal-container desc-modal" @click.stop>
        <div class="modal-header">
          <h3>{{ descModalTitle }}</h3>
          <button class="close-modal" @click="closeDescModal">×</button>
        </div>
        <div class="modal-body">
          <div class="description-content" v-html="formatHtmlContent(currentDesc)"></div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="closeDescModal">
            {{ closeButtonText }}
          </button>
        </div>
      </div>
    </div>

    <!-- Rejection Reason Popup with Teleport -->
    <Teleport to="body">
      <div
        v-if="showRejectionReasonPopup"
        class="rejection-popup-overlay"
        @click="closeRejectionPopup"
      >
        <div class="rejection-popup-container" @click.stop>
          <!-- Popup Header -->
          <div class="rejection-popup-header">
            <div class="rejection-popup-title">
              <span class="rejection-popup-icon">⚠</span>
              <h3>{{ isArabic ? 'سبب الرفض' : 'Rejection Reason' }}</h3>
            </div>
            <button class="rejection-popup-close" @click="closeRejectionPopup">
              <span>×</span>
            </button>
          </div>

          <!-- Popup Body -->
          <div class="rejection-popup-body">
            <div v-if="currentRejectionRow" class="rejection-details">
              <div class="rejection-meta">
                <span class="meta-label">{{ isArabic ? 'رقم المعاملة:' : 'Transaction:' }}</span>
                <span class="meta-value">{{ currentRejectionRow.code }}</span>
              </div>
              <div class="rejection-reason-content">
                <p class="reason-label">{{ isArabic ? 'السبب:' : 'Reason:' }}</p>
                <div class="reason-text-container">
                  <p class="reason-text-full">{{ currentRejectionReason }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Popup Footer -->
          <div class="rejection-popup-footer">
            <button class="btn-popup-close" @click="closeRejectionPopup">
              {{ isArabic ? 'إغلاق' : 'Close' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { EditIcon, FileTextIcon, TrashIcon } from 'lucide-vue-next'
import { useThemeStore } from '@/stores/themeStore'
import { useNavigationStore } from '@/stores/navigationStore'

// Component imports
import NewRequestModal from '@/components/NewRequestModal.vue'
import EnhancementsRequestModel from '@/components/EnhancementsRequestModel.vue'
import NewContractModal from '@/components/NewContractModal.vue'
import EditTransferModal from '@/components/EditTransferModal.vue'
import EditContractModal from '@/components/EditContractModal.vue'
import AttachmentModal from '@/components/AttachmentModal.vue'
import ApprovalPipelineModal from '@/components/ApprovalPipelineModal.vue'
import RejectionReportModal from '@/components/RejectionReportModal.vue'
import FuturisticPopup from '@/components/FuturisticPopup.vue'
import OracleApprovalPipelineModal from '@/components/OracleApprovalPipelineModal.vue'

// Service imports
import unifiedTransferService from '@/services/UnifiedTransferService'
import transferService from '@/services/TransferService'
import type { TransferData } from '@/services/TransferService'

// CSS imports
import '@/assets/css/shared-page-styles.css'

// Define component name
defineOptions({
  name: 'UnifiedTransfersPage',
})

// ───────────────────────────────────────────────────────────── Route Configuration
const route = useRoute()
const themeStore = useThemeStore()
const navigationStore = useNavigationStore()

// Route-based configuration
const routeConfig = computed(() => {
  const routeName = route.name as string

  switch (routeName) {
    case 'Home':
      return {
        pageType: 'transfers',
        code: 'FAR',
        newRequestComponent: NewRequestModal,
        editComponent: EditTransferModal,
        cssClass: 'home-page',
        title: 'Transfers',
        subtitle: 'Fund Adjustment Requests',
        searchPlaceholder: 'Search transfers...',
        showRejectionColumn: false,
        detailRoute: '/cost-center-transfer',
      }
    case 'Enhancements':
      return {
        pageType: 'enhancements',
        code: 'AFR',
        newRequestComponent: EnhancementsRequestModel,
        editComponent: EditTransferModal,
        cssClass: 'enhancements-page',
        title: 'Enhancements',
        subtitle: 'Additional Fund Requests',
        searchPlaceholder: 'Search enhancements...',
        showRejectionColumn: false,
        detailRoute: '/cost-center-transfer',
      }
    case 'Settlements':
      return {
        pageType: 'contracts',
        code: 'FAD',
        newRequestComponent: NewContractModal,
        editComponent: EditContractModal,
        cssClass: 'contract-page',
        title: 'Settlements',
        subtitle: 'Fund Adjustment Department',
        searchPlaceholder: 'Search settlements...',
        showRejectionColumn: false,
        detailRoute: '/contracts',
      }
    default:
      return {
        pageType: 'transfers',
        code: 'FAR',
        newRequestComponent: NewRequestModal,
        editComponent: EditTransferModal,
        cssClass: 'home-page',
        title: 'Transfers',
        subtitle: 'Fund Adjustment Requests',
        searchPlaceholder: 'Search transfers...',
        showRejectionColumn: false,
        detailRoute: '/cost-center-transfer',
      }
  }
})

// ───────────────────────────────────────────────────────────── Computed Properties
const pageClass = computed(() => routeConfig.value.cssClass)
const pageTitle = computed(() => {
  if (isArabic.value) {
    switch (route.name) {
      case 'Home':
        return 'المناقلات'
      case 'Enhancements':
        return 'التعزيزات'
      case 'Settlements':
        return 'التسويات'
      default:
        return 'المناقلات'
    }
  }
  return routeConfig.value.title
})

const pageSubtitle = computed(() => {
  if (isArabic.value) {
    switch (route.name) {
      case 'Home':
        return 'طلبات تعديل الميزانية'
      case 'Enhancements':
        return 'طلبات الأموال الإضافية'
      case 'Settlements':
        return 'قسم تعديل الأموال'
      default:
        return 'طلبات تعديل الميزانية'
    }
  }
  return routeConfig.value.subtitle
})
const searchPlaceholder = computed(() => {
  if (isArabic.value) {
    switch (route.name) {
      case 'Home':
        return 'البحث في المناقلات...'
      case 'Enhancements':
        return 'البحث في التعزيزات...'
      case 'Settlements':
        return 'البحث في التسويات...'
      default:
        return 'البحث في المناقلات...'
    }
  }
  return routeConfig.value.searchPlaceholder
})
const newRequestModalComponent = computed(() => routeConfig.value.newRequestComponent)
const editModalComponent = computed(() => routeConfig.value.editComponent)

// ───────────────────────────────────────────────────────────── Internationalization
const isArabic = computed(() => themeStore.language === 'ar')

const newRequestButtonText = computed(() => (isArabic.value ? 'طلب جديد' : 'New Request'))
const newRequestButtonTitle = computed(() =>
  isArabic.value ? `إنشاء ${pageTitle.value} جديد` : `Create New ${routeConfig.value.title}`,
)
const loadingText = computed(() => (isArabic.value ? 'جاري التحميل...' : 'Loading...'))
const emptyStateTitle = computed(() => (isArabic.value ? 'لا توجد بيانات' : 'No Data Available'))
const emptyStateMessage = computed(() =>
  isArabic.value
    ? `لا توجد ${pageTitle.value} متاحة`
    : `No ${routeConfig.value.title.toLowerCase()} available`,
)
const deleteModalTitle = computed(() => (isArabic.value ? 'تأكيد الحذف' : 'Confirm Delete'))
const deleteModalMessage = computed(() =>
  isArabic.value ? 'هل أنت متأكد من حذف هذا العنصر؟' : 'Are you sure you want to delete this item?',
)
const cancelButtonText = computed(() => (isArabic.value ? 'إلغاء' : 'Cancel'))
const confirmDeleteButtonText = computed(() => (isArabic.value ? 'حذف' : 'Delete'))
const descModalTitle = computed(() => (isArabic.value ? 'الوصف' : 'Description'))
const closeButtonText = computed(() => (isArabic.value ? 'إغلاق' : 'Close'))

// Table headers
const tableHeaders = computed(() => ({
  actions: isArabic.value ? 'الإجراءات' : 'Actions',
  code: isArabic.value ? 'الرمز' : 'Code',
  requestedBy: isArabic.value ? 'طلب بواسطة' : 'Requested By',
  description: isArabic.value ? 'الوصف' : 'Description',
  requestDate: isArabic.value ? 'تاريخ الطلب' : 'Request Date',
  transactionDate: isArabic.value ? 'تاريخ المعاملة' : 'Transaction Date',
  track: isArabic.value ? 'تتبع' : 'Track',
  status: isArabic.value ? 'الحالة' : 'Status',
  attachments: isArabic.value ? 'المرفقات' : 'Attachments',
  rejection: isArabic.value ? 'الرفض' : 'Rejection',
}))

const paginationText = computed(() => {
  const start = (currentPage.value - 1) * 6 + 1
  const end = Math.min(currentPage.value * 6, totalCount.value)
  return isArabic.value
    ? `عرض ${start} إلى ${end} من ${totalCount.value} عنصر`
    : `Showing ${start} to ${end} of ${totalCount.value} items`
})

// Type definitions
interface UnifiedTransferResponse {
  results: TransferData[]
  count: number
  next?: string | null
  previous?: string | null
  [key: string]: unknown
}

// ───────────────────────────────────────────────────────────── State Variables
const loading = ref(false)
const apiData = ref<UnifiedTransferResponse | null>(null)
const displayedRows = ref<TransferData[]>([])
const totalCount = ref(0)
const hasNextPage = ref(false)
const hasPrevPage = ref(false)
const currentPage = ref(1)
const pageSize = ref(6) // Add page size state
const searchQuery = ref('')
const searchTimer = ref<number | null>(null)

// Modal states
const showModal = ref(false)
const showDescModal = ref(false)
const currentDesc = ref('')
const showEditModal = ref(false)
const currentEditTransfer = ref<TransferData | null>(null)
const showDeleteModal = ref(false)
const rowToDelete = ref<TransferData | null>(null)
const showFileModal = ref(false)
const currentTransactionId = ref(0)
const currentTransactionStatus = ref('pending')
const showApprovalModal = ref(false)
const currentApproval = ref<TransferData | null>(null)
const showRejectionModal = ref(false)
const currentRejectionId = ref(0)
const showOracleTrackingModal = ref(false)
const showPopup = ref(false)
const popupType = ref<'success' | 'error' | 'warning' | 'info'>('info')
const popupMessage = ref('')

// Rejection reasons state
const rejectionReasons = ref<Map<number, string>>(new Map())
const loadingRejections = ref<Set<number>>(new Set())

// Rejection popup state
const showRejectionReasonPopup = ref(false)
const currentRejectionRow = ref<TransferData | null>(null)
const currentRejectionReason = ref('')

// ───────────────────────────────────────────────────────────── Computed Properties for Data
const totalPages = computed(() => {
  if (totalCount.value === 0) return 1
  return Math.ceil(totalCount.value / pageSize.value)
})

// Enhanced pagination - visible page numbers
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
    // Show smart pagination
    if (current <= 4) {
      // Show 1-5 ... total
      for (let i = 1; i <= 5; i++) {
        pages.push(i)
      }
      if (total > 6) pages.push(-1) // Ellipsis
      pages.push(total)
    } else if (current >= total - 3) {
      // Show 1 ... (total-4)-total
      pages.push(1)
      if (total > 6) pages.push(-1) // Ellipsis
      for (let i = total - 4; i <= total; i++) {
        pages.push(i)
      }
    } else {
      // Show 1 ... (current-1) current (current+1) ... total
      pages.push(1)
      pages.push(-1) // Ellipsis
      for (let i = current - 1; i <= current + 1; i++) {
        pages.push(i)
      }
      pages.push(-1) // Ellipsis
      pages.push(total)
    }
  }

  return pages
})

// ───────────────────────────────────────────────────────────── Helper Functions
function formatDate(dateString: string): string {
  if (!dateString) return ''
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB')
  } catch {
    return dateString
  }
}

function formatHtmlContent(html: string): string {
  if (!html) return ''
  return html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
}

function rowBg(status: string) {
  const statusLower = status.toLowerCase()
  return {
    'row-pending': statusLower === 'pending',
    'row-approved': statusLower === 'approved',
    'row-rejected': statusLower === 'rejected',
    'row-submitted': statusLower === 'submitted',
  }
}

function getDetailRoute(row: TransferData) {
  const baseRoute = routeConfig.value.detailRoute
  const queryParams =
    routeConfig.value.pageType === 'enhancements' ? { source: 'EnhancementsPage' } : {}

  return {
    path: `${baseRoute}/${row.transaction_id}`,
    query: queryParams,
  }
}

function getAttachmentTooltip(row: TransferData): string {
  if (!row.attachment_count || row.attachment_count === 0) {
    return isArabic.value ? 'لا توجد مرفقات' : 'No attachments'
  }
  return isArabic.value
    ? `${row.attachment_count} مرفق(ات)`
    : `${row.attachment_count} attachment(s)`
}

function isRejectionClickable(row: TransferData): boolean {
  return row.status.toLowerCase() === 'rejected'
}

// Check if a transfer is in "waiting to submit" state (before first submission)
function isWaitingToSubmit(row: TransferData): boolean {
  return (
    !row.approvel_1 &&
    !row.approvel_2 &&
    !row.approvel_3 &&
    !row.approvel_4 &&
    !row.approvel_1_date &&
    !row.approvel_2_date &&
    !row.approvel_3_date &&
    !row.approvel_4_date &&
    row.status_level === 1
  )
}

function setSourceNavigation(row: TransferData) {
  if (routeConfig.value.pageType === 'enhancements') {
    navigationStore.setNavigationSource('EnhancementsPage', {
      transactionId: row.transaction_id,
      code: row.code,
    })
  }
}

// Fetch rejection reason for a specific transaction
async function fetchRejectionReason(transactionId: number): Promise<string> {
  if (rejectionReasons.value.has(transactionId)) {
    return rejectionReasons.value.get(transactionId) || ''
  }

  if (loadingRejections.value.has(transactionId)) {
    return ''
  }

  try {
    loadingRejections.value.add(transactionId)
    const reports = await transferService.getRejectionReports(transactionId)

    if (reports && reports.length > 0) {
      // Get the most recent rejection reason
      const latestReport = reports[reports.length - 1]
      const reason =
        latestReport.rejection_reason ||
        latestReport.reason_text ||
        (isArabic.value ? 'لا يوجد سبب محدد' : 'No specific reason provided')
      rejectionReasons.value.set(transactionId, reason)
      return reason
    } else {
      const fallbackReason = isArabic.value ? 'لا يوجد تقرير رفض' : 'No rejection report available'
      rejectionReasons.value.set(transactionId, fallbackReason)
      return fallbackReason
    }
  } catch (error) {
    console.error('Error fetching rejection reason:', error)
    const errorReason = isArabic.value ? 'خطأ في تحميل سبب الرفض' : 'Error loading rejection reason'
    rejectionReasons.value.set(transactionId, errorReason)
    return errorReason
  } finally {
    loadingRejections.value.delete(transactionId)
  }
}

// ───────────────────────────────────────────────────────────── API Functions
async function fetchData() {
  try {
    loading.value = true
    const response = await unifiedTransferService.fetchTransfers(
      routeConfig.value.code,
      searchQuery.value,
      currentPage.value,
    )

    if (response && response.results) {
      apiData.value = response as unknown as UnifiedTransferResponse
      displayedRows.value = Array.isArray(response.results)
        ? response.results
        : response.results.results || []
      totalCount.value = response.count || 0
      hasNextPage.value = !!response.next
      hasPrevPage.value = !!response.previous

      // Preload rejection reasons for rejected items (for all routes)
      const rejectedItems = displayedRows.value.filter((row) => isRejectionClickable(row))
      rejectedItems.forEach((row) => {
        if (!rejectionReasons.value.has(row.transaction_id)) {
          fetchRejectionReason(row.transaction_id)
        }
      })
    } else {
      displayedRows.value = []
      totalCount.value = 0
    }
  } catch (error) {
    console.error('Error fetching data:', error)
    showFuturisticPopup('error', 'Failed to load data')
    displayedRows.value = []
    totalCount.value = 0
  } finally {
    loading.value = false
  }
}

// ───────────────────────────────────────────────────────────── Search & Pagination
function handleSearchInput() {
  if (searchTimer.value) {
    clearTimeout(searchTimer.value)
  }

  searchTimer.value = setTimeout(() => {
    currentPage.value = 1
    fetchData()
  }, 500)
}

function clearSearch() {
  searchQuery.value = ''
  currentPage.value = 1
  fetchData()
}

function nextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    fetchData()
  }
}

function prevPage() {
  if (currentPage.value > 1) {
    currentPage.value--
    fetchData()
  }
}

// Enhanced pagination functions
function goToFirstPage() {
  if (currentPage.value !== 1) {
    currentPage.value = 1
    fetchData()
  }
}

function goToLastPage() {
  if (currentPage.value !== totalPages.value) {
    currentPage.value = totalPages.value
    fetchData()
  }
}

function goToPage(page: number) {
  if (page !== -1 && page !== currentPage.value && page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    fetchData()
  }
}

// function handlePageSizeChange(event: Event) {
//   const target = event.target as HTMLSelectElement
//   const newPageSize = parseInt(target.value)
//   pageSize.value = newPageSize
//   currentPage.value = 1 // Reset to first page
//   fetchData()
// }

// ───────────────────────────────────────────────────────────── Row Actions
function viewDesc(row: TransferData) {
  currentDesc.value = row.description_x || row.notes || ''
  showDescModal.value = true
}

function closeDescModal() {
  showDescModal.value = false
}

function editRow(row: TransferData) {
  currentEditTransfer.value = row
  showEditModal.value = true
}

function deleteRow(row: TransferData) {
  if (!isWaitingToSubmit(row)) {
    return
  }
  rowToDelete.value = row
  showDeleteModal.value = true
}

function cancelDelete() {
  showDeleteModal.value = false
  rowToDelete.value = null
}

function confirmDelete() {
  if (!rowToDelete.value) return

  loading.value = true
  showDeleteModal.value = false

  unifiedTransferService
    .deleteTransfer(rowToDelete.value.transaction_id)
    .then(() => {
      showFuturisticPopup('success', 'Item deleted successfully')
      fetchData()
    })
    .catch((error: unknown) => {
      console.error('Error deleting item:', error)
      showFuturisticPopup('error', 'Failed to delete item')
    })
    .finally(() => {
      loading.value = false
      rowToDelete.value = null
    })
}

function openFileModal(row: TransferData) {
  currentTransactionId.value = row.transaction_id
  currentTransactionStatus.value = isWaitingToSubmit(row) ? 'waiting-to-submit' : row.status
  showFileModal.value = true
}

function openApprovalModal(row: TransferData) {
  currentApproval.value = row
  showApprovalModal.value = true
}

function openRejectionModal(row: TransferData) {
  if (isRejectionClickable(row)) {
    currentRejectionId.value = row.transaction_id
    showRejectionModal.value = true
  }
}

function openOracleTrackingModal() {
  showOracleTrackingModal.value = true
}

// Show rejection reason popup
async function showRejectionPopup(row: TransferData) {
  if (!isRejectionClickable(row)) return

  currentRejectionRow.value = row

  try {
    const reason = await fetchRejectionReason(row.transaction_id)
    currentRejectionReason.value = reason
    showRejectionReasonPopup.value = true
  } catch (error) {
    console.error('Error loading rejection reason:', error)
    currentRejectionReason.value = isArabic.value
      ? 'خطأ في تحميل سبب الرفض'
      : 'Error loading rejection reason'
    showRejectionReasonPopup.value = true
  }
}

function closeRejectionPopup() {
  showRejectionReasonPopup.value = false
  currentRejectionRow.value = null
  currentRejectionReason.value = ''
}

function openDetailedRejectionModal() {
  if (currentRejectionRow.value) {
    openRejectionModal(currentRejectionRow.value)
    closeRejectionPopup()
  }
}

// ───────────────────────────────────────────────────────────── Modal Handlers
function openNewRequestModal() {
  showModal.value = true
}

function handleNewRequestSubmit(formData: Record<string, unknown>) {
  console.log('New request submitted:', formData)
  fetchData()
}

function handleEditSubmit(updatedData: Record<string, unknown>) {
  console.log('Item updated:', updatedData)
  fetchData()
}

function handleFilesUpdated() {
  fetchData()
}

function showFuturisticPopup(type: 'success' | 'error' | 'warning' | 'info', message: string) {
  popupType.value = type
  popupMessage.value = message
  showPopup.value = true
}

// ───────────────────────────────────────────────────────────── UI Effects
function handleSearchFocus(e: Event) {
  const target = e.target as HTMLElement
  target.classList.add('search-focused')
}

function handleSearchBlur(e: Event) {
  const target = e.target as HTMLElement
  target.classList.remove('search-focused')
}

function applyMagneticEffect() {
  // Magnetic effect for table rows
  // Implementation would go here
}

// ───────────────────────────────────────────────────────────── Lifecycle
onMounted(() => {
  fetchData()
})

// Add cleanup on unmount
onUnmounted(() => {
  // Clear any timers
  if (searchTimer.value) {
    clearTimeout(searchTimer.value)
    searchTimer.value = null
  }

  // Clear any running animations
  const elements = document.querySelectorAll('.unified-page *')
  elements.forEach((el) => {
    const htmlEl = el as HTMLElement
    htmlEl.style.animation = 'none'
  })
})

// Watch for route changes
watch(
  () => route.name,
  () => {
    currentPage.value = 1
    searchQuery.value = ''
    fetchData()
  },
)

// Watch theme changes
watch(
  () => themeStore.darkMode,
  () => {
    // isDarkMode is already computed from themeStore.darkMode
    // No need to manually assign
  },
)
</script>

<style scoped>
/* Optimized CSS with RTL and dark-theme support */

/* Main page background with RTL support */
.unified-page {
  min-height: auto;
  padding: 1.5rem;
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #f8f6f8 0%, #fff6fa 50%, #f8f6f8 100%);
  color: #1a1423;
  transition: all 0.3s ease;
  direction: inherit;
}

/* RTL adjustments */
[dir='rtl'] .unified-page {
  background: linear-gradient(225deg, #f8f6f8 0%, #fff6fa 50%, #f8f6f8 100%);
}

.unified-page.dark-theme {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  color: #f8e9f0;
}

[dir='rtl'] .unified-page.dark-theme {
  background: linear-gradient(225deg, #18131a 0%, #241726 50%, #18131a 100%);
}

/* Simplified glass panel effect */
.glass-panel {
  background: rgba(255, 246, 250, 0.9);
  backdrop-filter: blur(10px); /* Reduced from 20px */
  border: 1px solid rgba(228, 201, 214, 0.4);
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(138, 42, 68, 0.1); /* Simplified shadow */
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

/* RTL adjustments for glass panel */
[dir='rtl'] .glass-panel {
  direction: rtl;
}

/* Removed heavy hover effects */
.glass-panel:hover {
  transform: translateY(-1px); /* Reduced from -2px */
  box-shadow: 0 6px 24px rgba(138, 42, 68, 0.15); /* Simplified shadow */
  border-color: rgba(225, 75, 106, 0.3);
}

.dark-theme .glass-panel {
  background: rgba(36, 23, 38, 0.9);
  border-color: rgba(81, 32, 60, 0.4);
  box-shadow: 0 4px 16px rgba(167, 56, 92, 0.15); /* Simplified shadow */
}

.dark-theme .glass-panel:hover {
  box-shadow: 0 6px 24px rgba(167, 56, 92, 0.2); /* Simplified shadow */
  border-color: rgba(225, 75, 106, 0.4);
}

/* Simplified page header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding: 2rem;
  border-radius: 20px;
  position: relative;
  overflow: hidden;
}

/* Removed heavy headerGlow animation */
.page-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg,
    rgba(138, 42, 68, 0.05) 0%,
    rgba(225, 75, 106, 0.03) 50%,
    rgba(109, 26, 54, 0.05) 100%
  );
  z-index: -1;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 800;
  margin: 0;
  background: linear-gradient(135deg, #8a2a44 0%, #e14b6a 50%, #6d1a36 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 2px 4px rgba(138, 42, 68, 0.1);
  position: relative;
  /* Removed heavy titlePulse animation */
}

/* Removed heavy underline animation */
.page-title::after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 0;
  width: 100%;
  height: 3px;
  background: linear-gradient(90deg, transparent, #e14b6a, transparent);
  opacity: 0.5;
}

.page-subtitle {
  margin: 0.5rem 0 0 0;
  color: #6d1a36a0;
  font-size: 1.1rem;
  font-weight: 500;
  opacity: 0.8;
  /* Removed subtitleFade animation */
}

.dark-theme .page-title {
  color: #f8e9f0;
  text-shadow: 0 0 10px rgba(248, 233, 240, 0.3);
}

.dark-theme .page-subtitle {
  color: #d1c4d9;
}

/* Simplified primary button */
.btn-primary {
  padding: 0.875rem 2rem;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #8a2a44 0%, #e14b6a 100%);
  color: white;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(138, 42, 68, 0.2); /* Simplified shadow */
}

/* Removed heavy hover shimmer effect */
.btn-primary:hover {
  transform: translateY(-2px) scale(1.01); /* Reduced scale */
  box-shadow: 0 6px 24px rgba(138, 42, 68, 0.3); /* Simplified shadow */
  background: linear-gradient(135deg, #a7385c 0%, #e14b6a 100%);
}

.btn-primary:active {
  transform: translateY(-1px) scale(0.99);
  transition: all 0.1s ease;
}

/* Simplified background effects */
.background-effects {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: -1;
}

.floating-orb {
  position: absolute;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(109, 26, 54, 0.05), rgba(138, 42, 68, 0.03));
  animation: float-simple 8s ease-in-out infinite; /* Simplified animation */
}

.orb-1 {
  width: 150px; /* Reduced size */
  height: 150px;
  top: 10%;
  left: 10%;
  animation-delay: 0s;
}

.orb-2 {
  width: 100px; /* Reduced size */
  height: 100px;
  top: 60%;
  right: 15%;
  animation-delay: 4s;
}

/* Removed orb-3 to reduce complexity */

/* Simplified float animation */
@keyframes float-simple {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px); /* Reduced movement */
  }
}

/* Simplified loading state */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  text-align: center;
  position: relative;
  min-height: 300px;
  overflow: hidden;
}

/* Removed heavy loading particles */

.loading-container {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 2rem;
}

.loading-spinner-enhanced {
  position: relative;
  width: 60px; /* Reduced size */
  height: 60px;
  margin-bottom: 1.5rem;
}

.spinner-ring {
  position: absolute;
  border-radius: 50%;
  border: 2px solid transparent;
  animation: spin-simple 2s linear infinite; /* Simplified animation */
}

.ring-1 {
  width: 60px;
  height: 60px;
  border-top: 2px solid #16a34a;
  border-right: 2px solid #16a34a;
  animation-duration: 1.5s;
}

.ring-2 {
  width: 40px;
  height: 40px;
  top: 10px;
  left: 10px;
  border-bottom: 2px solid #059669;
  border-left: 2px solid #059669;
  animation-duration: 2s;
  animation-direction: reverse;
}

/* Removed ring-3 to reduce complexity */

.loading-core {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 16px; /* Reduced size */
  height: 16px;
}

.core-dot {
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, #16a34a, #4ade80);
  border-radius: 50%;
  animation: pulse-simple 1.5s ease-in-out infinite; /* Simplified animation */
  box-shadow: 0 0 8px rgba(22, 163, 74, 0.3); /* Simplified shadow */
}

.loading-dots {
  display: flex;
  gap: 8px;
  margin-bottom: 1rem;
}

.dot {
  width: 6px; /* Reduced size */
  height: 6px;
  background: #16a34a;
  border-radius: 50%;
  animation: bounce-simple 1.4s ease-in-out infinite; /* Simplified animation */
}

.dot-1 {
  animation-delay: 0s;
}

.dot-2 {
  animation-delay: 0.2s;
}

.dot-3 {
  animation-delay: 0.4s;
}

.loading-text {
  font-size: 1rem; /* Reduced size */
  font-weight: 600;
  color: #16a34a;
  margin-bottom: 1.5rem;
  /* Removed fade-pulse animation */
}

.loading-progress {
  width: 150px; /* Reduced size */
  height: 3px; /* Reduced height */
  background: rgba(22, 163, 74, 0.1);
  border-radius: 2px;
  overflow: hidden;
  position: relative;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #16a34a, #4ade80, #16a34a);
  background-size: 200% 100%;
  border-radius: 2px;
  animation: progress-simple 2s ease-in-out infinite; /* Simplified animation */
  box-shadow: 0 0 6px rgba(22, 163, 74, 0.3); /* Simplified shadow */
}

/* Simplified animations */
@keyframes spin-simple {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes pulse-simple {
  0%,
  100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
}

@keyframes bounce-simple {
  0%,
  80%,
  100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-6px); /* Reduced movement */
  }
}

@keyframes progress-simple {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

/* Dark mode optimizations */
.dark-theme .loading-text {
  color: #4ade80;
}

.dark-theme .ring-1 {
  border-top-color: #4ade80;
  border-right-color: #4ade80;
}

.dark-theme .ring-2 {
  border-bottom-color: #22c55e;
  border-left-color: #22c55e;
}

.dark-theme .core-dot {
  background: linear-gradient(45deg, #4ade80, #86efac);
  box-shadow: 0 0 6px rgba(74, 222, 128, 0.3);
}

.dark-theme .dot {
  background: #4ade80;
}

.dark-theme .loading-progress {
  background: rgba(74, 222, 128, 0.1);
}

.dark-theme .progress-bar {
  background: linear-gradient(90deg, #4ade80, #86efac, #4ade80);
  box-shadow: 0 0 6px rgba(74, 222, 128, 0.3);
}

/* Empty state */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  text-align: center;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
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
  background: #1e1e2e;
  color: #e2e2e2;
}

/* RTL support for modals */
[dir='rtl'] .modal-header {
  direction: rtl;
}

[dir='rtl'] .modal-footer {
  direction: rtl;
  justify-content: flex-start;
}

[dir='rtl'] .modal-body {
  direction: rtl;
  text-align: right;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.dark-theme .modal-header {
  border-bottom-color: #374151;
}

.modal-body {
  padding: 1.5rem;
  max-height: 60vh;
  overflow-y: auto;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.dark-theme .modal-footer {
  border-top-color: #374151;
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

.description-content {
  line-height: 1.6;
  color: #374151;
}

.dark-theme .description-content {
  color: #d1d5db;
}

/* Additional RTL typography and spacing */
[dir='rtl'] .page-title {
  text-align: right;
  font-family: 'Segoe UI', Tahoma, Arial, 'Noto Sans Arabic', 'Arial Unicode MS', sans-serif;
  letter-spacing: 0;
  line-height: 1.2;
}

[dir='rtl'] .page-subtitle {
  text-align: right;
  font-family: 'Segoe UI', Tahoma, Arial, 'Noto Sans Arabic', 'Arial Unicode MS', sans-serif;
  letter-spacing: 0;
}

[dir='rtl'] .header-left {
  text-align: right;
}

[dir='rtl'] .header-right {
  margin-left: 0;
  margin-right: auto;
}

/* Dark theme text adjustments */
.dark-theme .page-title {
  color: #f8e9f0;
  text-shadow: 0 0 10px rgba(248, 233, 240, 0.3);
}

.dark-theme .page-subtitle {
  color: #d1c4d9;
}

/* Simplified Search Section Styles */
.search-section {
  margin-bottom: 1.5rem;
  padding: 1.5rem;
  border-radius: 12px;
}

.search-container {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.search-input-wrapper {
  position: relative;
  flex: 1;
  min-width: 300px;
  display: flex;
  align-items: center;
}

/* RTL support for search container */
[dir='rtl'] .search-icon {
  left: auto;
  right: 1rem;
}

[dir='rtl'] .search-input {
  padding: 0.875rem 3rem 0.875rem 1rem;
}

[dir='rtl'] .clear-search {
  right: auto;
  left: 0.75rem;
}

.search-icon {
  position: absolute;
  left: 1rem;
  z-index: 2;
  color: #6b7280;
  width: 20px;
  height: 20px;
}

.search-input {
  width: 100%;
  padding: 0.875rem 1rem 0.875rem 3rem;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 1rem;
  background: white;
  transition: all 0.3s ease;
  outline: none;
}

.search-input:focus {
  border-color: #6d1a36;
  box-shadow: 0 0 0 3px rgba(109, 26, 54, 0.1);
  transform: translateY(-1px);
}

.dark-theme .search-input {
  background: #2d3748;
  border-color: #4a5568;
  color: #e2e2e2;
}

.dark-theme .search-input:focus {
  border-color: #8a2a44;
  box-shadow: 0 0 0 3px rgba(138, 42, 68, 0.1);
}

.clear-search {
  position: absolute;
  right: 0.75rem;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
}

.clear-search:hover {
  background: #dc2626;
  transform: scale(1.1);
}

.search-actions {
  display: flex;
  gap: 0.75rem;
}

.btn-filter,
.btn-refresh {
  padding: 0.875rem 1.25rem;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  background: white;
  color: #374151;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-filter:hover,
.btn-refresh:hover {
  border-color: #6d1a36;
  background: #6d1a36;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(109, 26, 54, 0.2);
}

.dark-theme .btn-filter,
.dark-theme .btn-refresh {
  background: #2d3748;
  border-color: #4a5568;
  color: #e2e2e2;
}

.dark-theme .btn-filter:hover,
.dark-theme .btn-refresh:hover {
  border-color: #8a2a44;
  background: #8a2a44;
}

/* Modern Table Styles */
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

.dark-theme .modern-table {
  background: #1e1e2e;
}

/* Table Header */
.table-header {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
}

.dark-theme .table-header {
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

.dark-theme .modern-table th {
  color: #e2e2e2;
  border-bottom-color: #4a5568;
}

/* RTL comprehensive support */
[dir='rtl'] {
  text-align: right;
}

[dir='rtl'] .modern-table th,
[dir='rtl'] .modern-table td {
  text-align: right;
}

[dir='rtl'] .search-section {
  direction: rtl;
}

[dir='rtl'] .page-header {
  direction: rtl;
  text-align: right;
}

[dir='rtl'] .btn-primary {
  direction: rtl;
}

/* Table Data Cells */
.modern-table td {
  padding: 1rem 0.75rem;
  text-align: center;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
}

.dark-theme .modern-table td {
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

.dark-theme .table-row:hover {
  background: #2d3748;
}

/* RTL support for table rows and status indicators */
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

[dir='rtl'] .row-submitted {
  border-left: none;
  border-right: 4px solid #6366f1;
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

.row-submitted {
  border-left: 4px solid #3b82f6;
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

.action-btn:hover:not(.disabled) {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.edit-btn:hover:not(.disabled) {
  background: #3b82f6;
  color: white;
}

.delete-btn:hover:not(.disabled) {
  background: #ef4444;
  color: white;
}

.action-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Rejection Icon Button in Actions */
.rejection-icon-btn {
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
  border: 1px solid #fecaca;
  color: #dc2626;
  position: relative;
  overflow: hidden;
}

.rejection-icon-btn:hover {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  transform: translateY(-1px) scale(1.05);
  box-shadow: 0 4px 8px rgba(239, 68, 68, 0.2);
}

.rejection-icon-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.5s;
}

.rejection-icon-btn:hover::before {
  left: 100%;
}

.rejection-icon-small {
  font-size: 0.9rem;
  font-weight: 700;
  animation: pulse-warning 2s ease-in-out infinite;
}

.dark-theme .rejection-icon-btn {
  background: linear-gradient(135deg, #3f1f1f 0%, #4a2424 100%);
  border-color: #7c2d2d;
  color: #f87171;
}

.dark-theme .rejection-icon-btn:hover {
  background: linear-gradient(135deg, #4a2424 0%, #5a2a2a 100%);
}

@keyframes pulse-warning {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.1);
  }
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

/* Dark theme styles for code link */
.dark-theme .code-link {
  color: #ffffff;
  background: rgba(109, 26, 54, 0.1);
  border: 1px solid rgba(109, 26, 54, 0.3);
}

.dark-theme .code-link:hover {
  background: #6d1a36;
  color: white;
  border-color: #6d1a36;
}

/* Description Button */
.description-btn {
  padding: 0.5rem;
  border: none;
  border-radius: 6px;
  background: #f3f4f6;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s ease;
}

.description-btn:hover {
  background: #6366f1;
  color: white;
  transform: translateY(-1px);
}

/* Track Button */
.track-btn {
  padding: 0.375rem 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: white;
  color: #374151;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
}

.track-btn:hover {
  background: #6366f1;
  color: white;
  border-color: #6366f1;
  transform: translateY(-1px);
}

.dark-theme .track-btn {
  background: #374151;
  color: #e2e2e2;
  border-color: #4a5568;
}

/* Attachment Button - Same style as Track Button */
.attachment-btn {
  padding: 0.375rem 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: white;
  color: #374151;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
}

.attachment-btn:hover {
  background: #6366f1;
  color: white;
  border-color: #6366f1;
  transform: translateY(-1px);
}

.dark-theme .attachment-btn {
  background: #374151;
  color: #e2e2e2;
  border-color: #4a5568;
}

/* Status Badge */
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

.status-submitted {
  background: #dbeafe;
  color: #1e40af;
}

.status-badge:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Modern Rejection Column Styles */
.td-rejection {
  padding: 0.75rem !important;
  min-width: 280px;
}

.rejection-container {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 100%;
}

.rejection-preview {
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
  border: 1px solid #fecaca;
  border-radius: 8px;
  padding: 0.75rem;
  position: relative;
  overflow: hidden;
}

.dark-theme .rejection-preview {
  background: linear-gradient(135deg, #3f1f1f 0%, #4a2424 100%);
  border-color: #7c2d2d;
}

.rejection-preview::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: linear-gradient(to bottom, #ef4444, #dc2626);
}

.rejection-status-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.rejection-icon {
  font-size: 1rem;
  color: #ef4444;
  font-weight: 600;
}

.rejection-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #dc2626;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.dark-theme .rejection-label {
  color: #f87171;
}

.rejection-reason-preview {
  margin-top: 0.5rem;
}

.reason-text {
  font-size: 0.85rem;
  color: #7c2d12;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  font-style: italic;
}

.dark-theme .reason-text {
  color: #fed7aa;
}

.loading-text {
  opacity: 0.7;
  animation: pulse-rejection 1.5s ease-in-out infinite;
}

.loading-dots-inline {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  margin-left: 0.5rem;
}

.loading-dots-inline .dot {
  width: 4px;
  height: 4px;
  background-color: #ef4444;
  border-radius: 50%;
  animation: bounce-dot 1.4s ease-in-out infinite both;
}

.loading-dots-inline .dot:nth-child(1) {
  animation-delay: -0.32s;
}
.loading-dots-inline .dot:nth-child(2) {
  animation-delay: -0.16s;
}
.loading-dots-inline .dot:nth-child(3) {
  animation-delay: 0s;
}

@keyframes bounce-dot {
  0%,
  80%,
  100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

.rejection-details-btn {
  background: linear-gradient(135deg, #6b21a8 0%, #7c3aed 100%);
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.5rem 0.75rem;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.375rem;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  align-self: flex-start;
}

.rejection-details-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.rejection-details-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(107, 33, 168, 0.3);
  background: linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%);
}

.rejection-details-btn:hover::before {
  left: 100%;
}

.rejection-details-btn:active {
  transform: translateY(0);
}

.btn-icon {
  font-size: 0.9rem;
}

.btn-text {
  font-weight: 500;
}

.rejection-not-available {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  color: #9ca3af;
  text-align: center;
  min-height: 60px;
}

.na-icon {
  font-size: 1.25rem;
  margin-bottom: 0.25rem;
  opacity: 0.6;
}

.na-text {
  font-size: 0.8rem;
  font-weight: 500;
  opacity: 0.7;
}

.dark-theme .rejection-not-available {
  color: #6b7280;
}

/* RTL Support for rejection column */
[dir='rtl'] .rejection-preview::before {
  left: auto;
  right: 0;
}

[dir='rtl'] .rejection-status-badge {
  flex-direction: row-reverse;
}

[dir='rtl'] .rejection-details-btn {
  flex-direction: row-reverse;
}

[dir='rtl'] .loading-dots-inline {
  margin-left: 0;
  margin-right: 0.5rem;
}

/* Animation for loading states */
@keyframes pulse-rejection {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

.reason-text:has-text('Loading...'),
.reason-text:has-text('جاري التحميل...') {
  animation: pulse-rejection 1.5s ease-in-out infinite;
  color: #6b7280;
}

/* Responsive adjustments for rejection column */
@media (max-width: 1200px) {
  .td-rejection {
    min-width: 240px;
  }

  .rejection-preview {
    padding: 0.625rem;
  }

  .reason-text {
    font-size: 0.8rem;
    -webkit-line-clamp: 1;
    line-clamp: 1;
  }
}

@media (max-width: 768px) {
  .td-rejection {
    min-width: 200px;
  }

  .rejection-container {
    gap: 0.5rem;
  }

  .rejection-details-btn {
    padding: 0.375rem 0.5rem;
    font-size: 0.75rem;
  }
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

.items-per-page {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6b7280;
  font-weight: 500;
}

.page-size-select {
  padding: 0.375rem 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: white;
  color: #374151;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.page-size-select:focus {
  outline: none;
  border-color: #6d1a36;
  box-shadow: 0 0 0 3px rgba(109, 26, 54, 0.1);
}

.dark-theme .page-size-select {
  background: #374151;
  color: #e2e2e2;
  border-color: #4a5568;
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

.dark-theme .pagination-btn {
  background: #374151;
  color: #e2e2e2;
  border-color: #4a5568;
}

.dark-theme .pagination-btn:hover:not(:disabled) {
  background: #8a2a44;
  border-color: #8a2a44;
}

.dark-theme .pagination-btn.active {
  background: #8a2a44;
  border-color: #8a2a44;
}

/* RTL support for pagination */
[dir='rtl'] .pagination-wrapper {
  direction: rtl;
}

[dir='rtl'] .pagination-controls {
  direction: rtl;
}

[dir='rtl'] .pagination-info {
  direction: rtl;
}

/* Responsive Design */
@media (max-width: 768px) {
  .search-container {
    flex-direction: column;
    align-items: stretch;
  }

  .search-input-wrapper {
    min-width: 100%;
  }

  .search-actions {
    justify-content: center;
  }

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

/* Performance optimization: Reduce animations when user prefers reduced motion */
@media (prefers-reduced-motion: reduce) {
  .floating-orb,
  .spinner-ring,
  .core-dot,
  .dot,
  .progress-bar {
    animation: none;
  }

  .glass-panel,
  .btn-primary,
  .pagination-btn,
  .action-btn {
    transition: none;
  }
}

/* Rejection Popup Styles */
.rejection-popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.3s ease;
  backdrop-filter: blur(4px);
}

.rejection-popup-container {
  background: white;
  border-radius: 16px;
  box-shadow:
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow: hidden;
  animation: popupSlideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  border: 2px solid #fecaca;
}

.dark-theme .rejection-popup-container {
  background: #1f1f2e;
  border-color: #7c2d2d;
  color: #e5e5e5;
}

.rejection-popup-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
  border-bottom: 1px solid #fecaca;
}

.dark-theme .rejection-popup-header {
  background: linear-gradient(135deg, #3f1f1f 0%, #4a2424 100%);
  border-bottom-color: #7c2d2d;
}

.rejection-popup-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.rejection-popup-icon {
  font-size: 1.5rem;
  color: #dc2626;
  animation: bounce 2s infinite;
}

.dark-theme .rejection-popup-icon {
  color: #f87171;
}

.rejection-popup-title h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #7c2d12;
}

.dark-theme .rejection-popup-title h3 {
  color: #fed7aa;
}

.rejection-popup-close {
  background: none;
  border: none;
  color: #6b7280;
  font-size: 1.75rem;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 50%;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.rejection-popup-close:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
  transform: scale(1.1);
}

.dark-theme .rejection-popup-close {
  color: #9ca3af;
}

.dark-theme .rejection-popup-close:hover {
  background: rgba(248, 113, 113, 0.1);
  color: #f87171;
}

.rejection-popup-body {
  padding: 1.5rem;
}

.rejection-details {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.rejection-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: #f9fafb;
  border-radius: 8px;
  border-left: 4px solid #dc2626;
}

.dark-theme .rejection-meta {
  background: #2c2c3f;
  border-left-color: #f87171;
}

.meta-label {
  font-weight: 600;
  color: #6b7280;
  font-size: 0.9rem;
}

.meta-value {
  font-weight: 700;
  color: #dc2626;
  font-size: 0.95rem;
}

.dark-theme .meta-label {
  color: #9ca3af;
}

.dark-theme .meta-value {
  color: #f87171;
}

.rejection-reason-content {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.reason-label {
  font-weight: 600;
  color: #374151;
  margin: 0;
  font-size: 1rem;
}

.dark-theme .reason-label {
  color: #e5e5e5;
}

.reason-text-container {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1rem;
  position: relative;
}

.dark-theme .reason-text-container {
  background: #2c2c3f;
  border-color: #3f3f5f;
}

.reason-text-full {
  margin: 0;
  line-height: 1.6;
  color: #4b5563;
  white-space: pre-wrap;
  word-break: break-word;
}

.dark-theme .reason-text-full {
  color: #d1d5db;
}

.rejection-popup-footer {
  padding: 1rem 1.5rem;
  background: #f9fafb;
  border-top: 1px solid #e5e7eb;
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

.dark-theme .rejection-popup-footer {
  background: #2c2c3f;
  border-top-color: #3f3f5f;
}

.btn-popup-close {
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  color: #374151;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn-popup-close:hover {
  background: #f3f4f6;
  border-color: #9ca3af;
}

.btn-popup-details {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  background: linear-gradient(135deg, #6b21a8 0%, #7c3aed 100%);
  color: white;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn-popup-details:hover {
  background: linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(107, 33, 168, 0.3);
}

.dark-theme .btn-popup-close {
  background: #34343e;
  border-color: #4d4d5a;
  color: #e5e5e5;
}

.dark-theme .btn-popup-close:hover {
  background: #3f3f5f;
}

/* RTL Support for popup */
[dir='rtl'] .rejection-popup-title {
  flex-direction: row-reverse;
}

[dir='rtl'] .rejection-meta {
  border-left: none;
  border-right: 4px solid #dc2626;
}

[dir='rtl'] .dark-theme .rejection-meta {
  border-right-color: #f87171;
}

[dir='rtl'] .rejection-popup-footer {
  justify-content: flex-start;
}

/* Animations */
@keyframes popupSlideIn {
  0% {
    transform: scale(0.8) translateY(-20px);
    opacity: 0;
  }
  100% {
    transform: scale(1) translateY(0);
    opacity: 1;
  }
}

@keyframes bounce {
  0%,
  20%,
  53%,
  80%,
  100% {
    transform: translate3d(0, 0, 0);
  }
  40%,
  43% {
    transform: translate3d(0, -8px, 0);
  }
  70% {
    transform: translate3d(0, -4px, 0);
  }
  90% {
    transform: translate3d(0, -2px, 0);
  }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .rejection-popup-container {
    width: 95%;
    margin: 1rem;
  }

  .rejection-popup-header,
  .rejection-popup-body,
  .rejection-popup-footer {
    padding: 1rem;
  }

  .rejection-popup-title h3 {
    font-size: 1.1rem;
  }
}
</style>
