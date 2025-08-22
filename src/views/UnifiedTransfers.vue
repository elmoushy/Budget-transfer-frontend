<template>
  <div
    :class="[styles.unifiedPage, pageClass, { [styles.darkTheme]: themeStore.darkMode }]"
    :dir="isArabic ? 'rtl' : 'ltr'"
  >
    <!-- Simplified background effects -->
    <div :class="styles.backgroundEffects">
      <div :class="[styles.floatingOrb, styles.orb1]"></div>
      <div :class="[styles.floatingOrb, styles.orb2]"></div>
    </div>

    <!-- Page Header -->
    <div :class="[styles.pageHeader, styles.glassPanel]">
      <div :class="styles.headerLeft">
        <h1 :class="styles.pageTitle">{{ pageTitle }}</h1>
        <p :class="styles.pageSubtitle">{{ pageSubtitle }}</p>
      </div>
      <div :class="styles.headerRight">
        <button
          :class="styles.btnPrimary"
          @click="openNewRequestModal"
          :title="newRequestButtonTitle"
        >
          <span>{{ newRequestButtonText }}</span>
        </button>
      </div>
    </div>

    <!-- Search and Filters -->
    <div :class="[styles.searchSection, styles.glassPanel]">
      <div :class="styles.searchContainer">
        <div :class="styles.searchInputWrapper">
          <input
            v-model="searchQuery"
            type="text"
            :class="styles.searchInput"
            :placeholder="searchPlaceholder"
            @input="handleSearchInput"
            @focus="handleSearchFocus"
            @blur="handleSearchBlur"
          />
          <button v-if="searchQuery" :class="styles.clearSearch" @click="clearSearch">
            <span>×</span>
          </button>
        </div>
        <div :class="styles.searchActions">
          <button :class="styles.btnFilter" title="Advanced Filters">
            <span>Filters</span>
          </button>
          <button :class="styles.btnRefresh" @click="fetchData" title="Refresh Data">
            <span>⟳</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Main Table -->
    <div :class="[styles.tableContainer, styles.glassPanel]">
      <div v-if="loading" :class="styles.loadingState">
        <div :class="styles.loadingContainer">
          <div :class="styles.loadingSpinnerEnhanced">
            <div :class="[styles.spinnerRing, styles.ring1]"></div>
            <div :class="[styles.spinnerRing, styles.ring2]"></div>
            <div :class="styles.loadingCore">
              <div :class="styles.coreDot"></div>
            </div>
          </div>
          <div :class="styles.loadingDots">
            <span :class="[styles.dot, styles.dot1]"></span>
            <span :class="[styles.dot, styles.dot2]"></span>
            <span :class="[styles.dot, styles.dot3]"></span>
          </div>
        </div>
        <p :class="styles.loadingText">{{ loadingText }}</p>
        <div :class="styles.loadingProgress">
          <div :class="styles.progressBar"></div>
        </div>
      </div>

      <div v-else-if="displayedRows.length === 0" :class="styles.emptyState">
        <div :class="styles.emptyIcon">📋</div>
        <h3>{{ emptyStateTitle }}</h3>
        <p>{{ emptyStateMessage }}</p>
      </div>

      <div v-else-if="!loading && displayedRows.length > 0" :class="styles.modernTableWrapper">
        <table :class="styles.modernTable">
          <thead>
            <tr :class="styles.tableHeader">
              <th :class="styles.thActions">{{ tableHeaders.actions }}</th>
              <th :class="styles.thCode">{{ tableHeaders.code }}</th>
              <th :class="styles.thRequestedBy">{{ tableHeaders.requestedBy }}</th>
              <th :class="styles.thDescription">{{ tableHeaders.description }}</th>
              <th :class="styles.thRequestDate">{{ tableHeaders.requestDate }}</th>
              <th :class="styles.thTransactionDate">{{ tableHeaders.transactionDate }}</th>
              <th :class="styles.thTrack">{{ tableHeaders.track }}</th>
              <th :class="styles.thStatus">{{ tableHeaders.status }}</th>
              <th :class="styles.thAttachments">{{ tableHeaders.attachments }}</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in displayedRows"
              :key="row.transaction_id"
              :class="[styles.tableRow, getRowBgClass(row.status)]"
              @mouseenter="applyMagneticEffect"
            >
              <!-- Actions Column -->
              <td :class="styles.tdActions">
                <div :class="styles.actionButtonsGroup">
                  <button
                    :class="[
                      styles.actionBtn,
                      styles.editBtn,
                      { [styles.disabled]: !isWaitingToSubmit(row) },
                    ]"
                    @click="isWaitingToSubmit(row) ? editRow(row) : null"
                    :disabled="!isWaitingToSubmit(row)"
                    :title="isWaitingToSubmit(row) ? 'Edit' : 'Cannot edit after submission'"
                  >
                    <EditIcon :size="16" />
                  </button>
                  <button
                    :class="[
                      styles.actionBtn,
                      styles.deleteBtn,
                      { [styles.disabled]: !isWaitingToSubmit(row) },
                    ]"
                    @click="isWaitingToSubmit(row) ? deleteRow(row) : null"
                    :disabled="!isWaitingToSubmit(row)"
                    :title="isWaitingToSubmit(row) ? 'Delete' : 'Cannot delete after submission'"
                  >
                    <TrashIcon :size="16" />
                  </button>
                  <!-- Rejection Icon for rejected items -->
                  <button
                    v-if="isRejectionClickable(row)"
                    :class="[styles.actionBtn, styles.rejectionIconBtn]"
                    @click="showRejectionPopup(row)"
                    :title="isArabic ? 'عرض سبب الرفض' : 'View rejection reason'"
                  >
                    <span :class="styles.rejectionIconSmall">⚠</span>
                  </button>
                </div>
              </td>

              <!-- Code Column -->
              <td :class="styles.tdCode">
                <router-link
                  :to="getDetailRoute(row)"
                  :class="styles.codeLink"
                  @click="setSourceNavigation(row)"
                >
                  {{ row.code }}
                </router-link>
              </td>

              <!-- Requested By -->
              <td :class="styles.tdRequestedBy">{{ row.requested_by }}</td>

              <!-- Description -->
              <td :class="styles.tdDescription">
                <button
                  :class="styles.descriptionBtn"
                  @click="viewDesc(row)"
                  title="View full description"
                >
                  <FileTextIcon :size="16" />
                </button>
              </td>

              <!-- Request Date -->
              <td :class="styles.tdRequestDate">{{ formatDate(row.request_date) }}</td>

              <!-- Transaction Date -->
              <td :class="styles.tdTransactionDate">{{ row.transaction_date }}</td>

              <!-- Track -->
              <td :class="styles.tdTrack">
                <button :class="styles.trackBtn" @click="openOracleTrackingModal()">Track</button>
              </td>

              <!-- Status -->
              <td :class="styles.tdStatus">
                <span
                  :class="[styles.statusBadge, getStatusBadgeClass(row.status)]"
                  @click="openApprovalModal(row)"
                  role="button"
                >
                  {{ row.status }}
                </span>
              </td>

              <!-- Attachments -->
              <td :class="styles.tdAttachments">
                <button
                  :class="styles.attachmentBtn"
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
    <div
      v-if="!loading && displayedRows.length > 0"
      :class="[styles.paginationWrapper, styles.glassPanel]"
    >
      <div :class="styles.paginationInfo">
        <span :class="styles.paginationText">{{ paginationText }}</span>
        <div :class="styles.itemsPerPage">
          <!-- <span>Items per page:</span>
          <select :class="styles.pageSizeSelect" v-model="pageSize" @change="handlePageSizeChange">
            <option value="6">6</option>
            <option value="12">12</option>
            <option value="24">24</option>
            <option value="50">50</option>
          </select> -->
        </div>
      </div>
      <div :class="styles.paginationControls">
        <button
          :class="[styles.paginationBtn, styles.paginationBtnFirst]"
          @click="goToFirstPage"
          :disabled="currentPage === 1"
          title="First Page"
        >
          ⟪
        </button>
        <button
          :class="[styles.paginationBtn, styles.paginationBtnPrev]"
          @click="prevPage"
          :disabled="currentPage === 1"
          title="Previous Page"
        >
          ⟨
        </button>

        <div :class="styles.pageNumbers">
          <button
            v-for="page in visiblePages"
            :key="page"
            :class="[
              styles.paginationBtn,
              styles.pageNumber,
              { [styles.active]: page === currentPage, [styles.ellipsis]: page === -1 },
            ]"
            @click="goToPage(page)"
            :disabled="page === -1"
          >
            {{ page === -1 ? '...' : page }}
          </button>
        </div>

        <button
          :class="[styles.paginationBtn, styles.paginationBtnNext]"
          @click="nextPage"
          :disabled="currentPage >= totalPages"
          title="Next Page"
        >
          ⟩
        </button>
        <button
          :class="[styles.paginationBtn, styles.paginationBtnLast]"
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
    <div v-if="showDeleteModal" :class="styles.modalOverlay" @click="cancelDelete">
      <div :class="[styles.modalContainer, styles.deleteModal]" @click.stop>
        <div :class="styles.modalHeader">
          <h3>{{ deleteModalTitle }}</h3>
          <button :class="styles.closeModal" @click="cancelDelete">×</button>
        </div>
        <div :class="styles.modalBody">
          <p>{{ deleteModalMessage }}</p>
        </div>
        <div :class="styles.modalFooter">
          <button :class="styles.btnSecondary" @click="cancelDelete">
            {{ cancelButtonText }}
          </button>
          <button :class="styles.btnDanger" @click="confirmDelete">
            {{ confirmDeleteButtonText }}
          </button>
        </div>
      </div>
    </div>

    <!-- Description Modal -->
    <div v-if="showDescModal" :class="styles.modalOverlay" @click="closeDescModal">
      <div :class="[styles.modalContainer, styles.descModal]" @click.stop>
        <div :class="styles.modalHeader">
          <h3>{{ descModalTitle }}</h3>
          <button :class="styles.closeModal" @click="closeDescModal">×</button>
        </div>
        <div :class="styles.modalBody">
          <div :class="styles.descriptionContent" v-html="formatHtmlContent(currentDesc)"></div>
        </div>
        <div :class="styles.modalFooter">
          <button :class="styles.btnSecondary" @click="closeDescModal">
            {{ closeButtonText }}
          </button>
        </div>
      </div>
    </div>

    <!-- Rejection Reason Popup with Teleport -->
    <Teleport to="body">
      <div
        v-if="showRejectionReasonPopup"
        :class="styles.rejectionPopupOverlay"
        @click="closeRejectionPopup"
      >
        <div :class="styles.rejectionPopupContainer" @click.stop>
          <!-- Popup Header -->
          <div :class="styles.rejectionPopupHeader">
            <div :class="styles.rejectionPopupTitle">
              <span :class="styles.rejectionPopupIcon">⚠</span>
              <h3>{{ isArabic ? 'سبب الرفض' : 'Rejection Reason' }}</h3>
            </div>
            <button :class="styles.rejectionPopupClose" @click="closeRejectionPopup">
              <span>×</span>
            </button>
          </div>

          <!-- Popup Body -->
          <div :class="styles.rejectionPopupBody">
            <div v-if="currentRejectionRow" :class="styles.rejectionDetails">
              <div :class="styles.rejectionMeta">
                <span :class="styles.metaLabel">{{
                  isArabic ? 'رقم المعاملة:' : 'Transaction:'
                }}</span>
                <span :class="styles.metaValue">{{ currentRejectionRow.code }}</span>
              </div>
              <div :class="styles.rejectionReasonContent">
                <p :class="styles.reasonLabel">{{ isArabic ? 'السبب:' : 'Reason:' }}</p>
                <div :class="styles.reasonTextContainer">
                  <p :class="styles.reasonTextFull">{{ currentRejectionReason }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Popup Footer -->
          <div :class="styles.rejectionPopupFooter">
            <button :class="styles.btnPopupClose" @click="closeRejectionPopup">
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
import styles from './UnifiedTransfers.module.css'

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

function getRowBgClass(status: string) {
  const statusLower = status.toLowerCase()
  return statusLower === 'pending'
    ? styles.rowPending
    : statusLower === 'approved'
      ? styles.rowApproved
      : statusLower === 'rejected'
        ? styles.rowRejected
        : statusLower === 'submitted'
          ? styles.rowSubmitted
          : ''
}

function getStatusBadgeClass(status: string) {
  const statusLower = status.toLowerCase()
  return statusLower === 'pending'
    ? styles.statusPending
    : statusLower === 'approved'
      ? styles.statusApproved
      : statusLower === 'rejected'
        ? styles.statusRejected
        : statusLower === 'submitted'
          ? styles.statusSubmitted
          : ''
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
