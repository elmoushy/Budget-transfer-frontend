<template>
  <div class="page-container contract-page" :class="{ 'dark-mode': isDarkMode }">
    <div class="page-background">
      <div class="gradient-orb orb-1"></div>
      <div class="gradient-orb orb-2"></div>
      <div class="gradient-orb orb-3"></div>
    </div>

    <!-- top bar: new request / actions / search -->
    <div class="page-toolbar toolbar glass-panel" v-motion-slide-top>
      <button class="btn-primary glass-btn" @click="openNewRequestModal">
        <span class="btn-icon">+</span>
        <span class="btn-text">{{ isArabic ? 'طلب عقد جديد' : 'New Contract' }}</span>
        <div class="btn-glint"></div>
      </button>

      <div class="toolbar-right">
        <div class="search-container">
          <SearchIcon
            class="search-icon"
            :style="{ transform: isArabic ? 'translateX(-200px)' : 'translateX(200px)' }"
          />
          <input
            v-model="searchQuery"
            type="search"
            :placeholder="isArabic ? 'بحث...' : 'Search...'"
            class="input-search"
            @input="handleSearch"
            @focus="handleSearchFocus"
            @blur="handleSearchBlur"
          />
          <button v-if="searchQuery" @click="clearSearch" class="clear-search glass-btn-icon">
            <span>×</span>
          </button>
          <div class="search-focus-indicator"></div>
        </div>
      </div>
    </div>

    <!-- table -->
    <div
      class="page-table-container table-container glass-panel"
      v-motion-slide-bottom
      :delay="200"
    >
      <transition-group name="table-fade" tag="table" class="page-table main-table">
        <thead key="head">
          <tr>
            <th>
              <p :style="{ transform: isArabic ? 'translateX(70px)' : 'translateX(30px)' }">
                {{ tableHeaders.action }}
              </p>
            </th>
            <th>
              <p :style="{ transform: isArabic ? 'translateX(75px)' : 'translateX(40px)' }">
                {{ tableHeaders.code }}
              </p>
            </th>
            <th>
              <p :style="{ transform: isArabic ? 'translateX(35px)' : 'translateX(30px)' }">
                {{ tableHeaders.requestedBy }}
              </p>
            </th>
            <th>
              <p :style="{ transform: isArabic ? 'translateX(40px)' : 'translateX(30px)' }">
                {{ tableHeaders.contractDescription }}
              </p>
            </th>
            <th>
              <p :style="{ transform: isArabic ? 'translateX(50px)' : 'translateX(30px)' }">
                {{ tableHeaders.requestDate }}
              </p>
            </th>
            <th>
              <p :style="{ transform: isArabic ? 'translateX(45px)' : 'translateX(30px)' }">
                {{ tableHeaders.contractPeriod }}
              </p>
            </th>
            <th>
              <p :style="{ transform: isArabic ? 'translateX(56px)' : 'translateX(30px)' }">
                {{ tableHeaders.giPostingStatus }}
              </p>
            </th>
            <th>
              <p :style="{ transform: isArabic ? 'translateX(69px)' : 'translateX(30px)' }">
                {{ tableHeaders.statusLevel }}
              </p>
            </th>
            <th>
              <p
                :style="{
                  transform: isArabic ? 'translateX(95px)!important' : 'translateX(30px)',
                }"
              >
                {{ tableHeaders.attachment }}
              </p>
            </th>
          </tr>
        </thead>
        <tbody key="body">
          <tr
            v-for="(row, index) in displayedRows"
            :key="row.transaction_id"
            :class="rowBg(row.status)"
            class="page-table-row table-row"
            v-motion-slide-right
            :delay="300 + index * 50"
          >
            <td>
              <div class="action-buttons">
                <button
                  v-if="row.status.toLowerCase() === 'pending'"
                  class="icon-btn delete-btn"
                  @click="deleteRow(row)"
                >
                  <TrashIcon />
                </button>
                <button
                  class="icon-btn"
                  :class="{ 'disabled-btn': row.status.toLowerCase() !== 'pending' }"
                  @click="row.status.toLowerCase() === 'pending' ? editRow(row) : null"
                  :disabled="row.status.toLowerCase() !== 'pending'"
                  :title="
                    row.status.toLowerCase() === 'pending'
                      ? 'Edit'
                      : 'Cannot edit non-pending items'
                  "
                >
                  <EditIcon />
                </button>
              </div>
            </td>
            <td class="code-cell">
              <router-link :to="`/cost-center-transfer/${row.transaction_id}`" class="code-link">
                {{ row.code }}
              </router-link>
            </td>
            <td>{{ row.requested_by }}</td>
            <td>
              <div class="description-cell">
                <button
                  class="icon-btn view-desc-btn"
                  @click="viewDesc(row)"
                  title="View full description"
                >
                  <FileTextIcon />
                </button>
              </div>
            </td>
            <td>{{ formatDate(row.request_date) }}</td>
            <td>{{ row.transaction_date }}</td>
            <td>Track</td>
            <td>
              <span
                class="status-badge"
                :class="'status-' + row.status.toLowerCase()"
                @click="openApprovalModal(row)"
                role="button"
              >
                {{ row.status }}
              </span>
            </td>
            <td>
              <div class="attachment-cell">
                <span
                  class="attachment-text"
                  :class="{ 'with-attachments': row.attachment_count && row.attachment_count > 0 }"
                >
                  {{ row.attachment }}
                </span>
                <div
                  class="attachment-indicator"
                  :class="{
                    'has-attachments': row.attachment_count && row.attachment_count > 0,
                    'no-attachments': !row.attachment_count,
                    disabled: row.status.toLowerCase() !== 'pending',
                  }"
                  @click="openFileModal(row)"
                  :title="getAttachmentTooltip(row)"
                >
                  <PaperclipIcon :size="18" />

                  <span
                    v-if="row.attachment_count && row.attachment_count > 0"
                    class="attachment-badge"
                  >
                    {{ row.attachment_count }}
                  </span>
                </div>
                <div
                  :class="[
                    'rejection-indicator',
                    { disabled: row.status.toLowerCase() !== 'rejected' },
                  ]"
                  :title="isArabic ? 'تقارير الرفض' : 'Rejection reports'"
                  @click="row.status.toLowerCase() === 'rejected' && openRejectionModal(row)"
                >
                  <FileTextIcon :size="18" />
                </div>
              </div>
            </td>
          </tr>
          <tr v-if="loading" key="loading">
            <td colspan="9" class="loading-row">
              {{ isArabic ? 'جاري التحميل...' : 'Loading...' }}
            </td>
          </tr>
          <tr v-else-if="displayedRows.length === 0" key="no-results">
            <td colspan="9" class="no-results">
              {{ isArabic ? 'لا توجد نتائج' : 'No results found' }}
            </td>
          </tr>
        </tbody>
      </transition-group>
    </div>

    <!-- Pagination -->
    <div class="pagination">
      <button
        @click="prevPage"
        class="page-btn"
        :disabled="currentPage === 1"
        :class="{ disabled: currentPage === 1 }"
      >
        {{ isArabic ? 'السابق' : 'Previous' }}
      </button>

      <span class="page-info">
        {{
          isArabic ? `صفحة ${currentPage} من ${totalPages}` : `Page ${currentPage} of ${totalPages}`
        }}
      </span>

      <button
        @click="nextPage"
        class="page-btn"
        :disabled="!hasNextPage"
        :class="{ disabled: !hasNextPage }"
      >
        {{ isArabic ? 'التالي' : 'Next' }}
      </button>
    </div>

    <!-- New Contract Modal Component -->
    <NewContractModal v-model="showModal" @submit="handleNewRequestSubmit" />

    <!-- Edit Contract Modal Component -->
    <EditContractModal
      v-model="showEditModal"
      :contractData="currentEditContract"
      @submit="handleEditSubmit"
    />

    <!-- Description Modal -->
    <div v-if="showDescModal" class="modal-overlay" @click="closeDescModal">
      <div class="desc-modal-container" :class="{ 'dark-mode': isDarkMode }" @click.stop>
        <div class="modal-header">
          <h2>{{ isArabic ? 'وصف العقد' : 'Contract Description' }}</h2>
          <button class="close-modal" @click="closeDescModal">×</button>
        </div>
        <div class="modal-body desc-modal-body">
          <div
            class="desc-content"
            v-if="currentDesc"
            v-html="formatHtmlContent(currentDesc)"
          ></div>
          <div class="no-desc" v-else>
            {{ isArabic ? 'لا يوجد وصف' : 'No description available' }}
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal - Futuristic Design -->
    <div v-if="showDeleteModal" class="modal-overlay futuristic-overlay" @click="cancelDelete">
      <div
        class="delete-modal-container futuristic-modal"
        :class="{ 'dark-mode': isDarkMode }"
        @click.stop
        v-motion-slide-bottom
      >
        <div class="modal-glow-effect"></div>
        <div class="modal-header futuristic-header">
          <div class="modal-decorator left"></div>
          <h2>{{ isArabic ? 'تأكيد الحذف' : 'Confirm Deletion' }}</h2>
          <div class="modal-decorator right"></div>
          <button class="close-modal futuristic-close" @click="cancelDelete">
            <span class="close-icon">×</span>
            <span class="close-pulse"></span>
          </button>
        </div>
        <div class="modal-body futuristic-body">
          <div class="warning-icon-container">
            <div class="warning-icon">
              <div class="warning-circle"></div>
              <span>!</span>
            </div>
            <div class="warning-pulse"></div>
          </div>
          <p class="delete-message futuristic-message">
            {{
              isArabic
                ? 'هل أنت متأكد من رغبتك في حذف هذا العقد؟'
                : 'Are you sure you want to delete this contract?'
            }}
          </p>
          <div class="delete-info" v-if="rowToDelete">
            <div class="info-item">
              <span class="info-label">{{ isArabic ? 'الرمز:' : 'Code:' }}</span>
              <span class="info-value">{{ rowToDelete.code }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">{{ isArabic ? 'التاريخ:' : 'Date:' }}</span>
              <span class="info-value">{{ formatDate(rowToDelete.request_date) }}</span>
            </div>
          </div>
        </div>
        <div class="modal-footer futuristic-footer">
          <button class="btn-secondary futuristic-btn-secondary" @click="cancelDelete">
            {{ isArabic ? 'إلغاء' : 'Cancel' }}
            <span class="btn-glow"></span>
          </button>
          <button
            class="btn-primary delete-confirm-btn futuristic-btn-delete"
            @click="confirmDelete"
          >
            <span class="btn-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <polyline points="3 6 5 6 21 6"></polyline>
                <path
                  d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                ></path>
                <line x1="10" y1="11" x2="10" y2="17"></line>
                <line x1="14" y1="11" x2="14" y2="17"></line>
              </svg>
            </span>
            {{ isArabic ? 'نعم، حذف' : 'Yes, Delete' }}
            <span class="btn-glow delete-glow"></span>
          </button>
        </div>
        <div class="modal-corner top-left"></div>
        <div class="modal-corner top-right"></div>
        <div class="modal-corner bottom-left"></div>
        <div class="modal-corner bottom-right"></div>
      </div>
    </div>

    <!-- Attachment Modal Component -->
    <AttachmentModal
      v-model:show="showFileModal"
      :transaction-id="currentTransactionId"
      :status="currentTransactionStatus"
      @files-updated="handleFilesUpdated"
    />

    <!-- Approval Pipeline Modal Component -->
    <ApprovalPipelineModal v-model="showApprovalModal" :approval-data="currentApproval" />

    <!-- Replace SweetAlert with our custom popup component -->
    <FuturisticPopup
      v-model:show="showPopup"
      :type="popupType"
      :message="popupMessage"
      :duration="3000"
    />

    <!-- Rejection Reports Modal Component -->
    <RejectionReportModal v-model:show="showRejectionModal" :transaction-id="currentRejectionId" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { EditIcon, FileTextIcon, SearchIcon, TrashIcon, PaperclipIcon } from 'lucide-vue-next'
import { useThemeStore } from '@/stores/themeStore'
import { useAuthStore } from '@/stores/authStore'
import NewContractModal from '@/components/NewContractModal.vue'
import EditContractModal from '@/components/EditContractModal.vue'
import AttachmentModal from '@/components/AttachmentModal.vue'
import ApprovalPipelineModal from '@/components/ApprovalPipelineModal.vue'
import RejectionReportModal from '@/components/RejectionReportModal.vue'
import FuturisticPopup from '@/components/FuturisticPopup.vue'
import contractService from '@/services/contractService'

// Import CSS
import '@/assets/css/shared-page-styles.css'
import '@/assets/css/Contracts.css'

// Define component name explicitly to satisfy the multi-word rule
defineOptions({
  name: 'ContractsPage',
})

// Use the page size from the API response - don't hardcode it

// ───────────────────────────────────────────────────────────── Type Declarations
interface ApiResponse {
  count: number
  next: string | null
  previous: string | null
  results: ContractData[]
}

interface ContractData {
  transaction_id: number
  transaction_date: string
  amount: number
  status: string
  requested_by: string
  user_id: number
  request_date: string
  notes: string
  description_x: string
  code: string
  gl_posting_status: string
  approvel_1: string
  approvel_2: string
  approvel_3: string
  approvel_4: string
  approvel_1_date: null | string
  approvel_2_date: null | string
  approvel_3_date: null | string
  approvel_4_date: null | string
  status_level: number
  attachment: string
  fy: string
  group_id: null | number
  interface_id: null | number
  reject_group_id: null | number
  reject_interface_id: null | number
  approve_group_id: null | number
  approve_interface_id: null | number
  report: string
  type: string
  attachment_count?: number
}

// ───────────────────────────────────────────────────────────── State
const loading = ref(false)
const apiData = ref<ApiResponse | null>(null)
const displayedRows = ref<ContractData[]>([])
const totalCount = ref(0)
const hasNextPage = ref(false)
const hasPrevPage = ref(false)
const showModal = ref(false)
const showDescModal = ref(false)
const currentDesc = ref('')

// New states for edit modal
const showEditModal = ref(false)
const currentEditContract = ref<ContractData | null>(null)

// Add new state variables for delete confirmation
const showDeleteModal = ref(false)
const rowToDelete = ref<ContractData | null>(null)

// Simplified file modal state
const showFileModal = ref(false)
const currentTransactionId = ref(0)

// New state for approval modal
const showApprovalModal = ref(false)
const currentApproval = ref<ContractData | null>(null)

// Add state for our custom popup
const showPopup = ref(false)
const popupType = ref<'success' | 'error' | 'info'>('info')
const popupMessage = ref('')

// Add state for current transaction status
const currentTransactionStatus = ref('pending')

// Add state for rejection reports modal
const showRejectionModal = ref(false)
const currentRejectionId = ref(0)

// ───────────────────────────────────────────────────────────── Helper Functions
function formatDate(dateString: string): string {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString()
}

function editGI(row: ContractData) {
  console.log('Editing GI for row:', row.transaction_id)
  // Set the current contract data for editing
  currentEditContract.value = row
  // Open the edit modal
  showEditModal.value = true
}

function formatHtmlContent(html: string): string {
  // Sanitize HTML content if needed
  return html || ''
}

function viewDesc(row: ContractData) {
  // Show description in modal
  currentDesc.value = row.notes || ''
  showDescModal.value = true
}

function closeDescModal() {
  showDescModal.value = false
}

function editRow(row: ContractData) {
  // Set the current contract data for editing
  currentEditContract.value = row
  // Open the edit modal
  showEditModal.value = true
}

function deleteRow(row: ContractData) {
  // Only allow deletion if status is pending
  if (row.status.toLowerCase() !== 'pending') {
    return
  }

  // Show delete confirmation modal instead of using confirm()
  rowToDelete.value = row
  showDeleteModal.value = true
}

function cancelDelete() {
  showDeleteModal.value = false
  rowToDelete.value = null
}

function confirmDelete() {
  if (!rowToDelete.value) return

  // Show loading state
  loading.value = true
  showDeleteModal.value = false

  // Use the specific endpoint for contracts
  contractService
    .deleteContract(rowToDelete.value.transaction_id)
    .then(() => {
      // Success - refresh the data
      fetchData()
      // Show success message using our custom popup instead of SweetAlert
      showFuturisticPopup(
        'success',
        isArabic.value ? 'تم حذف العقد بنجاح' : 'Contract deleted successfully',
      )
    })
    .catch((error) => {
      console.error('Error deleting contract:', error)
      // Show error message using our custom popup instead of SweetAlert
      showFuturisticPopup(
        'error',
        isArabic.value ? 'حدث خطأ أثناء حذف العقد' : 'Error deleting the contract',
      )
    })
    .finally(() => {
      loading.value = false
      rowToDelete.value = null
    })
}

function rowBg(status: string) {
  const statusLower = status.toLowerCase()
  if (statusLower === 'approved') return 'row-approved'
  if (statusLower === 'pending') return 'row-pending'
  if (statusLower === 'rejected') return 'row-rejected'
  return 'row-none'
}

// Function to open the file modal - updated to also pass status
function openFileModal(row) {
  currentTransactionId.value = row.transaction_id
  currentTransactionStatus.value = row.status
  showFileModal.value = true
}

// Handle files updated event from attachment modal
function handleFilesUpdated() {
  // Refresh the main data to update attachment counts
  fetchData()
}

// Updated function to generate attachment tooltip with read-only indication
function getAttachmentTooltip(row: ContractData): string {
  const baseMessage = !row.attachment_count
    ? isArabic.value
      ? 'لا توجد مرفقات'
      : 'No attachments'
    : isArabic.value
      ? `${row.attachment_count} مرفقات - انقر للعرض`
      : `${row.attachment_count} attachments - Click to view`

  if (row.status.toLowerCase() !== 'pending') {
    const readOnlyMessage = isArabic.value ? ' (وضع القراءة فقط)' : ' (read-only mode)'
    return baseMessage + readOnlyMessage
  }

  return baseMessage
}

// Function to open the approval modal
function openApprovalModal(row: ContractData) {
  currentApproval.value = row
  showApprovalModal.value = true
}

// Function to open rejection report modal
function openRejectionModal(row: ContractData) {
  // Check if status is rejected before showing the modal
  if (row.status.toLowerCase() === 'rejected') {
    currentRejectionId.value = row.transaction_id
    showRejectionModal.value = true
  }
}

// Add search focus handlers
function handleSearchFocus(e: Event) {
  const target = e.target as HTMLElement
  const container = target.closest('.search-container')
  if (container) {
    container.classList.add('focused')
  }
}

function handleSearchBlur(e: Event) {
  const target = e.target as HTMLElement
  const container = target.closest('.search-container')
  if (container) {
    container.classList.remove('focused')
    if ((target as HTMLInputElement).value) {
      container.classList.add('has-value')
    } else {
      container.classList.remove('has-value')
    }
  }
}

// Apply magnetic snapping effect to table rows
function applyMagneticEffect() {
  const tableRows = document.querySelectorAll('.page-table-row')

  tableRows.forEach((row) => {
    row.addEventListener('mousemove', (e: Event) => {
      const mouseEvent = e as MouseEvent
      const rect = (row as HTMLElement).getBoundingClientRect()
      const x = mouseEvent.clientX - rect.left
      const y = mouseEvent.clientY - rect.top

      // Calculate distance from center
      const centerX = rect.width / 2
      const centerY = rect.height / 2

      // Apply subtle transform based on mouse position
      const strength = 0.5 // Lower value for subtler effect
      const moveX = ((x - centerX) / centerX) * strength
      const moveY = ((y - centerY) / centerY) * strength

      ;(row as HTMLElement).style.transform = `translate(${moveX}px, ${moveY}px)`
    })

    row.addEventListener('mouseleave', () => {
      // Reset transform when mouse leaves
      ;(row as HTMLElement).style.transform = 'translate(0, 0)'

      // Add smooth transition back to original position
      ;(row as HTMLElement).style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
      setTimeout(() => {
        ;(row as HTMLElement).style.transition = ''
      }, 500)
    })
  })
}

// Animate floating background orbs
function animateBackgroundOrbs() {
  const randomMovement = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1) + min)
  }

  const orbs = document.querySelectorAll('.gradient-orb')

  orbs.forEach((orb) => {
    const elem = orb as HTMLElement
    setInterval(() => {
      const xMovement = randomMovement(-30, 30)
      const yMovement = randomMovement(-30, 30)

      elem.style.transform = `translate(${xMovement}px, ${yMovement}px)`
    }, 8000)
  })
}

// ───────────────────────────────────────────────────────────── Theme & Lang
const themeStore = useThemeStore()
// Use auth store for API calls but not directly in template
const authStore = useAuthStore()
const isArabic = ref(false)
const isDarkMode = ref(false)

onMounted(() => {
  isArabic.value = themeStore.language === 'ar'
  isDarkMode.value = themeStore.darkMode

  // Fetch data when component mounts
  fetchData()

  // Apply magnetic effect with a slight delay to ensure DOM is ready
  setTimeout(() => {
    applyMagneticEffect()
  }, 1000)

  // Set up background animation
  animateBackgroundOrbs()
})

watch(
  () => themeStore.language,
  (l) => (isArabic.value = l === 'ar'),
)
watch(
  () => themeStore.darkMode,
  (d) => (isDarkMode.value = d),
)

// ───────────────────────────────────────────────────────────── Table Headers
const englishHeaders = {
  action: 'Action',
  code: 'Code',
  requestedBy: 'Requested By',
  contractDescription: 'Contract Description',
  requestDate: 'Request Date',
  contractPeriod: 'Contract Period',
  giPostingStatus: 'Posting Status - Oracle System',
  statusLevel: 'Status Level',
  attachment: 'Attachment',
}
const arabicHeaders = {
  action: 'إجراء',
  code: 'الرمز',
  requestedBy: 'طلب من',
  contractDescription: 'وصف العقد',
  requestDate: 'تاريخ الطلب',
  contractPeriod: 'فترة العقد',
  giPostingStatus: 'حالة العقد في نظام الأوراكل',
  statusLevel: 'مستوى حالة الطلب',
  attachment: 'مرفقات',
}
const tableHeaders = computed(() => (isArabic.value ? arabicHeaders : englishHeaders))

// ───────────────────────────────────────────────────────────── API Functions
const searchQuery = ref('')
const currentPage = ref(1)
const debounceTimeout = ref<number | null>(null)

async function fetchData() {
  loading.value = true

  try {
    const data = await contractService.fetchContracts(searchQuery.value, currentPage.value)

    apiData.value = data
    displayedRows.value = data.results
    totalCount.value = data.count
    hasNextPage.value = !!data.next
    hasPrevPage.value = !!data.previous
  } catch (error) {
    console.error('Error in component while fetching data:', error)
    displayedRows.value = []
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  // Debounce search requests to avoid excessive API calls
  if (debounceTimeout.value) {
    clearTimeout(debounceTimeout.value)
  }

  debounceTimeout.value = setTimeout(() => {
    currentPage.value = 1 // Reset to first page when searching
    fetchData()
  }, 300) as unknown as number
}

function clearSearch() {
  searchQuery.value = ''
  currentPage.value = 1
  fetchData()
}

function nextPage() {
  if (hasNextPage.value) {
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

const totalPages = computed(() => {
  if (totalCount.value === 0) return 1

  // Get page size from API response URL if available
  if (apiData.value && apiData.value.next) {
    const url = new URL(apiData.value.next)
    const pageSize = url.searchParams.get('page_size')
    if (pageSize) {
      return Math.ceil(totalCount.value / parseInt(pageSize))
    }
  }

  // Fallback to default page size of 6
  return Math.ceil(totalCount.value / 6)
})

// ───────────────────────────────────────────────────────────── Modal Functions
function openNewRequestModal() {
  showModal.value = true
}

function handleNewRequestSubmit(formData: { timePeriod: string; contractReason: string }) {
  console.log('New contract requested:', formData)
  // After successful submission, refresh the data
  fetchData()
}

// Handle edit contract submission
function handleEditSubmit(updatedData: Record<string, unknown>) {
  console.log('Contract updated:', updatedData)
  // After successful update, refresh the data
  fetchData()
}

// Helper function for showing futuristic popups
function showFuturisticPopup(type: 'success' | 'error' | 'info', message: string) {
  popupType.value = type
  popupMessage.value = message
  showPopup.value = true
}
</script>

<style scoped>
/* Base page styles */
.contract-page {
  min-height: 100vh;
  padding: 1.5rem;
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, var(--color-bg-light, #f8fafc) 0%, #e4e8f0 100%);
}

.contract-page.dark-mode {
  background: linear-gradient(135deg, var(--color-bg-dark, #1a1a2e) 0%, #111122 100%);
  color: var(--color-text-light, #e2e2e2);
}

/* Background animation elements */
.page-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  overflow: hidden;
}

.gradient-orb {
  position: absolute;
  border-radius: 50%;
  opacity: 0.4;
  filter: blur(80px);
  transition: transform 8s cubic-bezier(0.23, 1, 0.32, 1);
}

.orb-1 {
  top: 10%;
  left: 10%;
  width: 450px;
  height: 450px;
  background: radial-gradient(
    circle,
    var(--color-accent-magenta, #f0abfc) 0%,
    rgba(240, 171, 252, 0) 70%
  );
  animation: pulse 15s ease-in-out infinite alternate;
}

.orb-2 {
  bottom: 20%;
  right: 10%;
  width: 500px;
  height: 500px;
  background: radial-gradient(
    circle,
    var(--color-accent-cyan, #5eead4) 0%,
    rgba(94, 234, 212, 0) 70%
  );
  animation: pulse 18s ease-in-out infinite alternate-reverse;
}

.orb-3 {
  top: 40%;
  right: 30%;
  width: 350px;
  height: 350px;
  background: radial-gradient(
    circle,
    var(--color-accent-primary, #6d1a36) 0%,
    rgba(109, 26, 54, 0) 70%
  );
  animation: pulse 20s ease-in-out infinite alternate;
}

@keyframes pulse {
  0% {
    transform: scale(0.9);
    opacity: 0.3;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.5;
  }
  100% {
    transform: scale(0.9);
    opacity: 0.3;
  }
}

/* Glassmorphism panels */
.glass-panel {
  background: rgba(255, 255, 255, var(--glass-opacity-light, 0.7));
  backdrop-filter: blur(var(--glass-blur, 10px));
  border: 1px solid var(--glass-border-light, rgba(255, 255, 255, 0.2));
  border-radius: 24px;
  box-shadow: var(--shadow-light, 0 8px 32px rgba(0, 0, 0, 0.1));
  transition: all var(--transition-normal, 0.3s ease);
}

.dark-mode .glass-panel {
  background: rgba(17, 17, 34, var(--glass-opacity-dark, 0.7));
  border: 1px solid var(--glass-border-dark, rgba(255, 255, 255, 0.05));
  box-shadow: var(--shadow-dark, 0 8px 32px rgba(0, 0, 0, 0.2));
}

/* Toolbar styles */
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding: 1rem 1.5rem;
}

.btn-primary.glass-btn {
  position: relative;
  background: linear-gradient(
    90deg,
    var(--color-accent-primary, #6d1a36),
    var(--color-accent-secondary, #4a0d20)
  );
  border: none;
  border-radius: 12px;
  color: white;
  font-weight: 600;
  padding: 0.75rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  overflow: hidden;
  transition: all var(--transition-normal, 0.3s ease);
}

.btn-primary.glass-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(109, 26, 54, 0.3);
}

.dark-mode .btn-primary.glass-btn:hover {
  box-shadow: var(--shadow-glow-magenta, 0 0 15px rgba(240, 171, 252, 0.5));
}

.btn-glint {
  position: absolute;
  top: -100%;
  left: -100%;
  width: 300%;
  height: 300%;
  background: linear-gradient(
    45deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.1) 50%,
    rgba(255, 255, 255, 0) 100%
  );
  transform: rotate(45deg);
  transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}

.btn-primary.glass-btn:hover .btn-glint {
  transform: rotate(45deg) translate(100%, 100%);
}

.btn-icon {
  font-size: 1.2rem;
  line-height: 1;
}

/* Search container */
.search-container {
  position: relative;
  min-width: 250px;
  border-radius: 12px;
  padding: 0.5rem 1rem;
  display: flex;
  align-items: center;
  transition: all var(--transition-fast, 0.2s ease);
}

.search-container.focused {
  border-color: var(--color-accent-primary, #6d1a36);
  box-shadow: 0 0 0 2px rgba(109, 26, 54, 0.2);
}

.dark-mode .search-container.focused {
  box-shadow: 0 0 0 2px rgba(240, 171, 252, 0.2);
}

.search-focus-indicator {
  position: absolute;
  bottom: 0;
  left: 12px;
  right: 12px;
  height: 2px;
  background: linear-gradient(
    90deg,
    var(--color-accent-primary, #6d1a36),
    var(--color-accent-magenta, #f0abfc)
  );
  transform: scaleX(0);
  transform-origin: left;
  transition: transform var(--transition-normal, 0.3s ease);
}

.search-container.focused .search-focus-indicator {
  transform: scaleX(1);
}

.search-icon {
  color: #64748b;
  transition: color var(--transition-fast, 0.2s ease);
}

.search-container.focused .search-icon {
  color: var(--color-accent-primary, #6d1a36);
}

.dark-mode .search-container.focused .search-icon {
  color: var(--color-accent-magenta, #f0abfc);
}

.input-search {
  background: transparent;
  border: none;
  padding: 0.5rem;
  font-size: 1rem;
  color: inherit;
  width: 100%;
  outline: none;
}

.clear-search {
  background: transparent;
  border: none;
  color: #64748b;
  cursor: pointer;
  font-size: 1.2rem;
  line-height: 1;
  padding: 0.25rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast, 0.2s ease);
}

.clear-search:hover {
  background: rgba(0, 0, 0, 0.05);
  color: var(--color-accent-primary, #6d1a36);
}

.dark-mode .clear-search:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--color-accent-magenta, #f0abfc);
}

/* Table container */
.table-container {
  overflow-x: auto;
  padding: 1rem;
  margin-bottom: 1.5rem;
}

.main-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

.main-table thead th {
  text-align: left;
  font-weight: 600;
  font-size: 0.875rem;
  padding: 1rem 0.75rem;
  color: #64748b;
  position: relative;
  transition: color var(--transition-fast, 0.2s ease);
}

.dark-mode .main-table thead th {
  border-bottom: none;
  color: #94a3b8;
}

.main-table tbody td {
  padding: 1rem 0.75rem;
  vertical-align: middle;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  transition: all var(--transition-fast, 0.2s ease);
}

.dark-mode .main-table tbody td {
  border-top-color: rgba(255, 255, 255, 0.05);
}

.table-row {
  position: relative;
  transition:
    transform var(--transition-fast, 0.2s ease),
    background-color var(--transition-fast, 0.2s ease);
  animation: fadeIn 0.3s ease-out forwards;
}

.table-row:hover {
  background-color: rgba(0, 0, 0, 0.02);
  transform: scale(1.01);
  z-index: 1;
}

.dark-mode .table-row:hover {
  background-color: rgba(255, 255, 255, 0.03);
}

/* Make each row appear with delay based on its index */
.table-row:nth-child(1) {
  animation-delay: 0.05s;
}
.table-row:nth-child(2) {
  animation-delay: 0.1s;
}
.table-row:nth-child(3) {
  animation-delay: 0.15s;
}
.table-row:nth-child(4) {
  animation-delay: 0.2s;
}
.table-row:nth-child(5) {
  animation-delay: 0.25s;
}
.table-row:nth-child(6) {
  animation-delay: 0.3s;
}
.table-row:nth-child(7) {
  animation-delay: 0.35s;
}
.table-row:nth-child(8) {
  animation-delay: 0.4s;
}
.table-row:nth-child(9) {
  animation-delay: 0.45s;
}
.table-row:nth-child(10) {
  animation-delay: 0.5s;
}

/* Status badge */
.status-badge {
  display: inline-block;
  padding: 0.35rem 0.75rem;
  border-radius: 10px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
  position: relative;
  overflow: hidden;
}

.status-badge::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0) 70%);
  opacity: 0;
  transition: opacity var(--transition-fast);
}

.status-badge:hover::after {
  opacity: 1;
}

.status-pending {
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  color: #7c2d12;
}

.status-approved {
  background: linear-gradient(135deg, #10b981, #059669);
  color: #064e3b;
}

.status-rejected {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: #7f1d1d;
}

.dark-mode .status-pending {
  color: #fef3c7;
  box-shadow: 0 0 10px rgba(251, 191, 36, 0.4);
}

.dark-mode .status-approved {
  color: #d1fae5;
  box-shadow: 0 0 10px rgba(16, 185, 129, 0.4);
}

.dark-mode .status-rejected {
  color: #fee2e2;
  box-shadow: 0 0 10px rgba(239, 68, 68, 0.4);
}

/* Add styles for action buttons container */
.action-buttons {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
}

/* Button styles */
.icon-btn {
  background: transparent;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #64748b;
  transition: all var(--transition-fast, 0.2s ease);
}

.icon-btn:hover {
  background: rgba(0, 0, 0, 0.05);
  color: var(--color-accent-primary, #6d1a36);
  transform: translateY(-2px);
}

.dark-mode .icon-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  color: var(--color-accent-magenta, #f0abfc);
  box-shadow: var(--shadow-glow-magenta, 0 0 10px rgba(240, 171, 252, 0.4));
}

.delete-btn {
  color: #dc2626;
}

.delete-btn:hover {
  background-color: rgba(220, 38, 38, 0.1);
  color: #dc2626;
}

.dark-mode .delete-btn {
  color: #ef4444;
}

.dark-mode .delete-btn:hover {
  background-color: rgba(239, 68, 68, 0.15);
  color: #ef4444;
}

.disabled-btn {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

/* Description cell */
.description-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  max-width: auto;
}

.view-desc-btn {
  flex-shrink: 0;
}

[dir='rtl'] .view-desc-btn {
  margin-left: 0;
  margin-right: 0;
}

/* Code cell link styling */
.code-cell {
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
}

.code-link {
  color: var(--color-accent-primary, #6d1a36);
  text-decoration: none;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  transition: all var(--transition-fast, 0.2s ease);
}

.code-link:hover {
  background: rgba(109, 26, 54, 0.1);
  transform: translateY(-1px);
}

.dark-mode .code-link {
  color: var(--color-accent-magenta, #f0abfc);
}

.dark-mode .code-link:hover {
  background: rgba(240, 171, 252, 0.1);
}

/* Enhanced attachment styles */
.attachment-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.attachment-indicator {
  position: relative;
  min-width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  background: rgba(255, 255, 255, 0.1);
}

.attachment-indicator:hover {
  transform: scale(1.1);
  background: rgba(255, 255, 255, 0.2);
}

.has-attachments {
  color: var(--color-accent-cyan, #5eead4);
  background: rgba(94, 234, 212, 0.15);
}

.dark-mode .has-attachments {
  color: var(--color-accent-cyan, #5eead4);
  text-shadow: 0 0 8px rgba(94, 234, 212, 0.4);
  background: rgba(94, 234, 212, 0.1);
}

.no-attachments {
  color: #64748b;
}

.dark-mode .no-attachments {
  color: #94a3b8;
}

.attachment-indicator.disabled {
  opacity: 0.5;
  cursor: default;
  pointer-events: none;
}

.attachment-badge {
  position: absolute;
  top: -2px;
  right: -2px;
  background: linear-gradient(
    135deg,
    var(--color-accent-primary, #6d1a36),
    var(--color-accent-secondary, #4a0d20)
  );
  color: white;
  font-size: 0.7rem;
  min-width: 16px;
  height: 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
  font-weight: 600;
  box-shadow: var(--shadow-light, 0 2px 4px rgba(0, 0, 0, 0.1));
  animation: scaleIn 0.3s ease-out;
}

.dark-mode .attachment-badge {
  box-shadow: var(--shadow-glow-magenta, 0 0 10px rgba(240, 171, 252, 0.4));
}

/* Rejection indicator styles */
.rejection-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255, 59, 48, 0.15);
  cursor: pointer;
  margin-left: 8px;
  color: #ff3b30;
  transition: all 0.25s cubic-bezier(0.165, 0.84, 0.44, 1);
  position: relative;
  overflow: hidden;
}

.rejection-indicator::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at center, rgba(255, 59, 48, 0.4) 0%, transparent 70%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.rejection-indicator:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(255, 59, 48, 0.3);
}

.rejection-indicator:hover::before {
  opacity: 1;
}

.dark-mode .rejection-indicator {
  background: rgba(255, 69, 58, 0.15);
  color: #ff453a;
}

.dark-mode .rejection-indicator:hover {
  box-shadow: 0 4px 8px rgba(255, 69, 58, 0.3);
}

/* Disabled rejection indicator */
.rejection-indicator.disabled {
  opacity: 0.5;
  cursor: default;
  pointer-events: none;
}

.rejection-indicator.disabled:hover {
  transform: none;
  box-shadow: none;
}

.rejection-indicator.disabled::before {
  display: none;
}

.dark-mode .rejection-indicator.disabled {
  opacity: 0.4;
}

/* Loading and no results rows */
.loading-row {
  text-align: center;
  padding: 2rem !important;
  color: #64748b;
  font-style: italic;
  animation: pulse 1.5s infinite;
}

.no-results {
  text-align: center;
  padding: 2rem !important;
  color: #64748b;
  font-style: italic;
}

.dark-mode .loading-row,
.dark-mode .no-results {
  color: #a0a0b8;
}

/* Animation keyframes */
@keyframes scaleIn {
  from {
    transform: scale(0);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.6;
  }
}

/* Pagination styling */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 1.5rem;
}

.page-btn {
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(0, 0, 0, 0.05);
  border-radius: 10px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  backdrop-filter: blur(5px);
}

.page-btn:hover:not(.disabled) {
  background: rgba(255, 255, 255, 0.8);
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.page-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  color: #64748b;
  font-size: 0.875rem;
}

.dark-mode .page-btn {
  background: rgba(30, 30, 46, 0.6);
  border-color: rgba(255, 255, 255, 0.05);
  color: #e2e2e2;
}

.dark-mode .page-btn:hover:not(.disabled) {
  background: rgba(40, 40, 56, 0.8);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
}

.dark-mode .page-info {
  color: #a0a0b8;
}

/* Responsive adjustments */
@media (max-width: 1024px) {
  .contract-page {
    padding: 1rem;
  }

  .toolbar {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .toolbar-right {
    width: 100%;
  }

  .search-container {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .table-container {
    border-radius: 12px;
    margin: 0 -0.5rem;
  }

  .table-container::before {
    content: '←  Scroll horizontally  →';
    display: block;
    text-align: center;
    padding: 0.5rem;
    color: #64748b;
    font-size: 0.75rem;
  }

  .dark-mode .table-container::before {
    color: #94a3b8;
  }
}
</style>

<style>
/* Futuristic Delete Modal Styles */
.futuristic-overlay {
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  animation: fadeIn 0.3s ease-out;
}

.futuristic-modal {
  position: relative;
  max-width: 450px;
  width: 90%;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow:
    0 20px 40px rgba(0, 0, 0, 0.2),
    0 0 0 1px rgba(255, 255, 255, 0.1);
  overflow: hidden;
  animation: modalAppear 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  transform-origin: center;
}

.dark-mode .futuristic-modal {
  background: rgba(25, 25, 35, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow:
    0 20px 40px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(255, 255, 255, 0.05),
    0 0 20px rgba(240, 171, 252, 0.1);
}

.modal-glow-effect {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(240, 171, 252, 0.1) 0%, rgba(240, 171, 252, 0) 60%);
  z-index: -1;
  opacity: 0;
  animation: glow-pulse 4s ease-in-out infinite alternate;
}

.dark-mode .modal-glow-effect {
  opacity: 1;
}

.futuristic-header {
  position: relative;
  display: flex;
  align-items: center;
  padding: 1.2rem 1.5rem;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0),
    rgba(109, 26, 54, 0.1),
    rgba(255, 255, 255, 0)
  );
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.dark-mode .futuristic-header {
  background: linear-gradient(
    90deg,
    rgba(25, 25, 35, 0),
    rgba(240, 171, 252, 0.15),
    rgba(25, 25, 35, 0)
  );
  border-bottom: 1px solid rgba(240, 171, 252, 0.1);
}

.modal-decorator {
  height: 2px;
  flex: 1;
  background: linear-gradient(
    90deg,
    transparent,
    var(--color-accent-primary, #6d1a36),
    transparent
  );
}

.modal-decorator.left {
  margin-right: 15px;
  opacity: 0;
  animation: decoratorAppear 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards 0.3s;
}

.modal-decorator.right {
  margin-left: 15px;
  opacity: 0;
  animation: decoratorAppear 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards 0.5s;
}

.futuristic-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  white-space: nowrap;
  background: linear-gradient(
    90deg,
    var(--color-accent-primary, #6d1a36),
    var(--color-accent-magenta, #f0abfc)
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-fill-color: transparent;
}

.futuristic-close {
  position: absolute;
  right: 1rem;
  top: 1rem;
  width: 30px;
  height: 30px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  font-size: 1.2rem;
  transition: all 0.3s ease;
  overflow: hidden;
}

.futuristic-close:hover {
  background: rgba(255, 255, 255, 0.2);
  color: var(--color-accent-primary, #6d1a36);
  transform: rotate(90deg);
}

.dark-mode .futuristic-close:hover {
  background: rgba(240, 171, 252, 0.2);
  color: var(--color-accent-magenta, #f0abfc);
  box-shadow: 0 0 10px rgba(240, 171, 252, 0.3);
}

.close-icon {
  position: relative;
  z-index: 2;
}

.close-pulse {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  background: rgba(240, 171, 252, 0.3);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  z-index: 1;
}

.futuristic-close:hover .close-pulse {
  animation: close-pulse 0.6s ease-out;
}

.futuristic-body {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.2rem;
}

.warning-icon-container {
  position: relative;
  width: 80px;
  height: 80px;
  margin-bottom: 0.5rem;
}

.warning-icon {
  position: absolute;
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #f87171, #ef4444);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 20px rgba(239, 68, 68, 0.3);
  animation: warningAppear 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
  z-index: 2;
}

.dark-mode .warning-icon {
  box-shadow:
    0 4px 20px rgba(239, 68, 68, 0.5),
    0 0 0 1px rgba(239, 68, 68, 0.2);
}

.warning-circle {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 3px solid rgba(255, 255, 255, 0.6);
  box-sizing: border-box;
}

.warning-icon span {
  color: white;
  font-size: 2.5rem;
  font-weight: 700;
  transform: translateY(-2px);
}

.warning-pulse {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: rgba(239, 68, 68, 0.3);
  animation: pulse 2s ease-out infinite;
  z-index: 1;
}

.futuristic-message {
  font-size: 1.1rem;
  font-weight: 500;
  text-align: center;
  max-width: 90%;
  margin: 0;
  line-height: 1.5;
}

.delete-info {
  width: 100%;
  background: rgba(0, 0, 0, 0.03);
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.dark-mode .delete-info {
  background: rgba(255, 255, 255, 0.05);
}

.info-item {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
}

.info-label {
  color: #64748b;
  font-weight: 500;
}

.dark-mode .info-label {
  color: #94a3b8;
}

.info-value {
  font-weight: 600;
}

.futuristic-footer {
  display: flex;
  justify-content: flex-end;
  padding: 1.2rem 1.5rem;
  gap: 1rem;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  position: relative;
}

.dark-mode .futuristic-footer {
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.futuristic-btn-secondary {
  position: relative;
  padding: 0.6rem 1.2rem;
  border-radius: 10px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  background: rgba(255, 255, 255, 0.5);
  color: #64748b;
  font-weight: 500;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s ease;
}

.futuristic-btn-secondary:hover {
  background: rgba(255, 255, 255, 0.8);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.dark-mode .futuristic-btn-secondary {
  background: rgba(30, 30, 46, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #e2e2e2;
}

.dark-mode .futuristic-btn-secondary:hover {
  background: rgba(40, 40, 56, 0.8);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.futuristic-btn-delete {
  position: relative;
  padding: 0.6rem 1.2rem;
  border-radius: 10px;
  border: none;
  background: linear-gradient(135deg, #ef4444, #b91c1c);
  color: white;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  overflow: hidden;
  transition: all 0.3s ease;
}

.futuristic-btn-delete:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(239, 68, 68, 0.4);
}

.dark-mode .futuristic-btn-delete:hover {
  box-shadow:
    0 4px 15px rgba(239, 68, 68, 0.6),
    0 0 20px rgba(239, 68, 68, 0.3);
}

.btn-glow {
  position: absolute;
  top: 0;
  left: -100%;
  width: 80%;
  height: 100%;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.3) 50%,
    rgba(255, 255, 255, 0) 100%
  );
  transform: skewX(-30deg);
  transition: all 0.6s ease;
}

.futuristic-btn-secondary:hover .btn-glow,
.futuristic-btn-delete:hover .btn-glow {
  left: 120%;
  transition: all 0.6s ease;
}

.delete-glow {
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.5) 50%,
    rgba(255, 255, 255, 0) 100%
  );
}

.modal-corner {
  position: absolute;
  width: 12px;
  height: 12px;
  border-color: var(--color-accent-primary, #6d1a36);
  border-style: solid;
  opacity: 0;
  animation: cornerAppear 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.dark-mode .modal-corner {
  border-color: var(--color-accent-magenta, #f0abfc);
}

.top-left {
  top: 0;
  left: 0;
  border-width: 2px 0 0 2px;
  animation-delay: 0.2s;
}

.top-right {
  top: 0;
  right: 0;
  border-width: 2px 2px 0 0;
  animation-delay: 0.4s;
}

.bottom-left {
  bottom: 0;
  left: 0;
  border-width: 0 0 2px 2px;
  animation-delay: 0.6s;
}

.bottom-right {
  bottom: 0;
  right: 0;
  border-width: 0 2px 2px 0;
  animation-delay: 0.8s;
}

@keyframes modalAppear {
  0% {
    opacity: 0;
    transform: scale(0.8);
  }
  80% {
    transform: scale(1.02);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes cornerAppear {
  0% {
    opacity: 0;
    width: 0;
    height: 0;
  }
  100% {
    opacity: 1;
    width: 12px;
    height: 12px;
  }
}

@keyframes warningAppear {
  0% {
    transform: scale(0);
  }
  60% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes pulse {
  0% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.6;
  }
}

@keyframes glow-pulse {
  0% {
    transform: rotate(0deg);
    opacity: 0.3;
  }
  50% {
    opacity: 0.5;
  }
  100% {
    transform: rotate(360deg);
    opacity: 0.3;
  }
}

@keyframes close-pulse {
  0% {
    width: 0;
    height: 0;
    opacity: 0.5;
  }
  100% {
    width: 100px;
    height: 100px;
    opacity: 0;
  }
}

@keyframes decoratorAppear {
  0% {
    opacity: 0;
    transform: scaleX(0);
  }
  100% {
    opacity: 1;
    transform: scaleX(1);
  }
}

@media (max-width: 480px) {
  .futuristic-modal {
    width: 95%;
  }

  .futuristic-footer {
    flex-direction: column;
  }

  .futuristic-btn-secondary,
  .futuristic-btn-delete {
    width: 100%;
    justify-content: center;
  }
}
</style>
