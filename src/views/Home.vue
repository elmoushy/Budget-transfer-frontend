<template>
  <div class="home-page" :class="{ 'dark-mode': isDarkMode }">
    <div class="page-background">
      <div class="gradient-orb orb-1"></div>
      <div class="gradient-orb orb-2"></div>
      <div class="gradient-orb orb-3"></div>
    </div>

    <!-- top bar: new request / actions / search -->
    <div class="toolbar glass-panel" v-motion-slide-top>
      <button class="btn-primary glass-btn" @click="openNewRequestModal">
        <span class="btn-icon">+</span>
        <span class="btn-text">{{ isArabic ? 'طلب ملاحظة جديدة' : 'New Request' }}</span>
        <div class="btn-glint"></div>
      </button>

      <div class="toolbar-right">
        <div class="search-container glass-field">
            <SearchIcon class="search-icon" :style="{ transform: isArabic ? 'translateX(-200px)' : 'translateX(200px)' }" />
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
    <div class="table-container glass-panel" v-motion-slide-bottom :delay="200">
      <transition-group name="table-fade" tag="table" class="main-table">
      <thead key="head">
      <tr>
            <th :style="{ transform: isArabic ? 'translateX(70px)' : 'translateX(30px)' }">{{ tableHeaders.action }}</th>
            <th :style="{ transform: isArabic ? 'translateX(45px)' : 'translateX(30px)' }">{{ tableHeaders.code }}</th>
            <th :style="{ transform: isArabic ? 'translateX(35px)' : 'translateX(30px)' }">{{ tableHeaders.requestedBy }}</th>
            <th :style="{ transform: isArabic ? 'translateX(40px)' : 'translateX(30px)' }">{{ tableHeaders.transferDescription }}</th>
            <th :style="{ transform: isArabic ? 'translateX(50px)' : 'translateX(30px)' }">{{ tableHeaders.requestDate }}</th>
            <th :style="{ transform: isArabic ? 'translateX(45px)' : 'translateX(30px)' }">{{ tableHeaders.transferPeriod }}</th>
            <th :style="{ transform: isArabic ? 'translateX(56px)' : 'translateX(30px)' }">{{ tableHeaders.giPostingStatus }}</th>
            <th :style="{ transform: isArabic ? 'translateX(69px)' : 'translateX(30px)' }">{{ tableHeaders.statusLevel }}</th>
            <th :style="{ transform: isArabic ? 'translateX(45px)' : 'translateX(30px)' }">{{ tableHeaders.attachment }}</th>
          </tr>
      </thead>
      <tbody key="body">
        <tr
        v-for="(row, index) in displayedRows"
        :key="row.transaction_id"
        :class="rowBg(row.status)"
        class="table-row"
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
          <td>
Track
        </td>
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
            @click="row.status.toLowerCase() === 'pending' ? openFileModal(row) : null"
            :title="
            row.status.toLowerCase() === 'pending'
              ? getAttachmentTooltip(row)
              : isArabic
              ? 'لا يمكن تعديل المرفقات لهذا الطلب'
              : 'Attachments cannot be modified for this request'
            "
          >
            <PaperclipIcon :size="18" />
            <span
            v-if="row.attachment_count && row.attachment_count > 0"
            class="attachment-badge"
            >
            {{ row.attachment_count }}
            </span>
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

    <!-- New Request Modal Component -->
    <NewRequestModal v-model="showModal" @submit="handleNewRequestSubmit" />

    <!-- Edit Transfer Modal Component -->
    <EditTransferModal
      v-model="showEditModal"
      :transferData="currentEditTransfer || {}"
      @submit="handleEditSubmit"
    />

    <!-- Description Modal -->
    <div v-if="showDescModal" class="modal-overlay" @click="closeDescModal">
      <div class="desc-modal-container" :class="{ 'dark-mode': isDarkMode }" @click.stop>
        <div class="modal-header">
          <h2>{{ isArabic ? 'وصف المعاملة' : 'Transfer Description' }}</h2>
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
                ? 'هل أنت متأكد من رغبتك في حذف هذا الطلب؟'
                : 'Are you sure you want to delete this request?'
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
      @files-updated="handleFilesUpdated"
    />

    <!-- Approval Pipeline Modal Component -->
    <ApprovalPipelineModal v-model="showApprovalModal" :approval-data="currentApproval || {}" />

    <!-- Add FuturisticPopup component -->
    <FuturisticPopup
      v-model:show="showPopup"
      :type="popupType"
      :message="popupMessage"
      :duration="3000"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { EditIcon, FileTextIcon, SearchIcon, TrashIcon, PaperclipIcon } from 'lucide-vue-next'
import { useThemeStore } from '@/stores/themeStore'
import { useAuthStore } from '@/stores/authStore'
import NewRequestModal from '@/components/NewRequestModal.vue'
import EditTransferModal from '@/components/EditTransferModal.vue'
import AttachmentModal from '@/components/AttachmentModal.vue'
import ApprovalPipelineModal from '@/components/ApprovalPipelineModal.vue'
import FuturisticPopup from '@/components/FuturisticPopup.vue'
import transferService from '@/services/transferService'

// Import CSS
import '@/assets/css/Home.css'

// Define component name explicitly to satisfy the multi-word rule
defineOptions({
  name: 'HomePage',
})

// Page size constant
const PAGE_SIZE = 10

// ───────────────────────────────────────────────────────────── Type Declarations
interface ApiResponse {
  count: number
  next: string | null
  previous: string | null
  results: TransferData[]
}

interface TransferData {
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
  attachment_count?: number
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
}

// ───────────────────────────────────────────────────────────── State
const loading = ref(false)
const apiData = ref<ApiResponse | null>(null)
const displayedRows = ref<TransferData[]>([])
const totalCount = ref(0)
const hasNextPage = ref(false)
const hasPrevPage = ref(false)
const showModal = ref(false)
const showDescModal = ref(false)
const currentDesc = ref('')

// New states for edit modal
const showEditModal = ref(false)
const currentEditTransfer = ref<TransferData | null>(null)

// Add new state variables for delete confirmation
const showDeleteModal = ref(false)
const rowToDelete = ref<TransferData | null>(null)

// Simplified file modal state
const showFileModal = ref(false)
const currentTransactionId = ref(0)

// New state for approval modal
const showApprovalModal = ref(false)
const currentApproval = ref<TransferData | null>(null)

// Add state for futuristic popup
const showPopup = ref(false)
const popupType = ref<'success' | 'error' | 'warning' | 'info'>('info')
const popupMessage = ref('')

// ───────────────────────────────────────────────────────────── Helper Functions
function formatDate(dateString: string): string {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString()
}

function editGI(row: TransferData) {
  console.log('Editing GI for row:', row.transaction_id)
  // Set the current transfer data for editing
  currentEditTransfer.value = row
  // Open the edit modal
  showEditModal.value = true
}

function formatHtmlContent(html: string): string {
  // Sanitize HTML content if needed
  return html || ''
}

function viewDesc(row: TransferData) {
  // Show description in modal
  currentDesc.value = row.notes || ''
  showDescModal.value = true
}

function closeDescModal() {
  showDescModal.value = false
}

function editRow(row: TransferData) {
  // Set the current transfer data for editing
  currentEditTransfer.value = row
  // Open the edit modal
  showEditModal.value = true
}

function deleteRow(row: TransferData) {
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

  // Use the specific endpoint: http://localhost:8000/api/budget/transfers/{transaction_id}/delete/
  transferService
    .deleteTransfer(rowToDelete.value.transaction_id)
    .then(() => {
      // Success - refresh the data
      fetchData()
      // Replace SweetAlert with our custom popup
      showFuturisticPopup(
        'success',
        isArabic.value ? 'تم حذف الطلب بنجاح' : 'Request deleted successfully',
      )
    })
    .catch((error: Error) => {
      console.error('Error deleting request:', error)
      // Replace SweetAlert with our custom popup for error
      showFuturisticPopup(
        'error',
        isArabic.value ? 'حدث خطأ أثناء حذف الطلب' : 'Error deleting the request',
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

// Function to open the file modal
function openFileModal(row: TransferData) {
  currentTransactionId.value = row.transaction_id
  showFileModal.value = true
}

// Handle files updated event from attachment modal
function handleFilesUpdated() {
  // Refresh the main data to update attachment counts
  fetchData()
}

// Add function to generate attachment tooltip
function getAttachmentTooltip(row: TransferData): string {
  if (!row.attachment_count) {
    return isArabic.value ? 'لا توجد مرفقات' : 'No attachments'
  }

  return isArabic.value
    ? `${row.attachment_count} مرفقات - انقر للعرض`
    : `${row.attachment_count} attachments - Click to view`
}

// Function to open the approval modal
function openApprovalModal(row: TransferData) {
  currentApproval.value = row
  showApprovalModal.value = true
}

// No need for closeApprovalModal anymore as it's handled by the v-model binding

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
  const tableRows = document.querySelectorAll('.table-row')

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

// Call this after component mount to apply the magnetic effect
onMounted(() => {
  // ...existing mounted code...

  // Apply magnetic effect with a slight delay to ensure DOM is ready
  setTimeout(() => {
    applyMagneticEffect()
  }, 1000)

  // Set up background animation
  animateBackgroundOrbs()
})

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

// Replace the SweetAlert2 notification function with our custom function
function showFuturisticPopup(type: 'success' | 'error' | 'warning' | 'info', message: string) {
  popupType.value = type
  popupMessage.value = message
  showPopup.value = true
}

// ───────────────────────────────────────────────────────────── Theme & Lang
const themeStore = useThemeStore()
const isArabic = ref(false)
const isDarkMode = ref(false)

onMounted(() => {
  isArabic.value = themeStore.language === 'ar'
  isDarkMode.value = themeStore.darkMode

  // Fetch data when component mounts
  fetchData()

  // Note: transferService uses the authStore internally
  // No need to manually set tokens
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
  attachment: 'Attachment',
  statusLevel: 'Status Level',
  giPostingStatus: 'posting Status - oracle System',
  transferPeriod: 'Transfer Period',
  requestDate: 'Request Date',
  transferDescription: 'Transfer Description',
  requestedBy: 'Requested By',
  code: 'Code',
  action: 'Action',
}
const arabicHeaders = {
  attachment: 'مرفقات',
  statusLevel: 'مستوى حالة الطلب',
  giPostingStatus: 'حالة المعاملة في نظام الأوراكل',
  transferPeriod: 'شهر المعاملة',
  requestDate: 'تاريخ الطلب',
  transferDescription: 'وصف المعاملة',
  requestedBy: 'طلب من',
  code: 'الرمز',
  action: 'الإجراء',
}
const tableHeaders = computed(() => (isArabic.value ? arabicHeaders : englishHeaders))

// ───────────────────────────────────────────────────────────── API Functions
const searchQuery = ref('')
const currentPage = ref(1)
const debounceTimeout = ref<number | null>(null)

async function fetchData() {
  loading.value = true

  try {
    const data = await transferService.fetchTransfers(searchQuery.value, currentPage.value)

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
  return Math.ceil(totalCount.value / PAGE_SIZE) || 1
})

// ───────────────────────────────────────────────────────────── Modal Functions
function openNewRequestModal() {
  showModal.value = true
}

function handleNewRequestSubmit(formData: { timePeriod: string; transferReason: string }) {
  console.log('New request submitted:', formData)
  // After successful submission, refresh the data
  fetchData()
}

// Handle edit transfer submission
function handleEditSubmit(updatedData: Record<string, unknown>) {
  console.log('Transfer updated:', updatedData)
  // After successful update, refresh the data
  fetchData()
}
</script>

<style scoped>
/* Base page styles */
.home-page {
  min-height: 100vh;
  padding: 1.5rem;
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, var(--color-bg-light) 0%, #e4e8f0 100%);
}

.home-page.dark-mode {
  background: linear-gradient(135deg, var(--color-bg-dark) 0%, #111122 100%);
  color: var(--color-text-light);
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
  background: radial-gradient(circle, var(--color-accent-magenta) 0%, rgba(240, 171, 252, 0) 70%);
  animation: pulse 15s ease-in-out infinite alternate;
}

.orb-2 {
  bottom: 20%;
  right: 10%;
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, var(--color-accent-cyan) 0%, rgba(94, 234, 212, 0) 70%);
  animation: pulse 18s ease-in-out infinite alternate-reverse;
}

.orb-3 {
  top: 40%;
  right: 30%;
  width: 350px;
  height: 350px;
  background: radial-gradient(circle, var(--color-accent-primary) 0%, rgba(109, 26, 54, 0) 70%);
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
  background: rgba(255, 255, 255, var(--glass-opacity-light));
  backdrop-filter: blur(var(--glass-blur));
  border: 1px solid var(--glass-border-light);
  border-radius: 24px;
  box-shadow: var(--shadow-light);
  transition: all var(--transition-normal);
}

.dark-mode .glass-panel {
  background: rgba(17, 17, 34, var(--glass-opacity-dark));
  border: 1px solid var(--glass-border-dark);
  box-shadow: var(--shadow-dark);
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
  background: linear-gradient(90deg, var(--color-accent-primary), var(--color-accent-secondary));
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
  transition: all var(--transition-normal);
}

.btn-primary.glass-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(109, 26, 54, 0.3);
}

.dark-mode .btn-primary.glass-btn:hover {
  box-shadow: var(--shadow-glow-magenta);
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
  transition: all var(--transition-fast);
}

.search-container.focused {
  border-color: var(--color-accent-primary);
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
  background: linear-gradient(90deg, var(--color-accent-primary), var(--color-accent-magenta));
  transform: scaleX(0);
  transform-origin: left;
  transition: transform var(--transition-normal);
}

.search-container.focused .search-focus-indicator {
  transform: scaleX(1);
}

.search-icon {
  color: #64748b;
  transition: color var(--transition-fast);
}

.search-container.focused .search-icon {
  color: var(--color-accent-primary);
}

.dark-mode .search-container.focused .search-icon {
  color: var(--color-accent-magenta);
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
  transition: all var(--transition-fast);
}

.clear-search:hover {
  background: rgba(0, 0, 0, 0.05);
  color: var(--color-accent-primary);
}

.dark-mode .clear-search:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--color-accent-magenta);
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
  transition: color var(--transition-fast);
}

.dark-mode .main-table thead th {
  color: #94a3b8;
}

.main-table tbody td {
  padding: 1rem 0.75rem;
  vertical-align: middle;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  transition: all var(--transition-fast);
}

.dark-mode .main-table tbody td {
  border-top-color: rgba(255, 255, 255, 0.05);
}

.table-row {
  position: relative;
  transition:
    transform var(--transition-fast),
    background-color var(--transition-fast);
}

.table-row:hover {
  background-color: rgba(0, 0, 0, 0.02);
  transform: scale(1.01);
  z-index: 1;
}

.dark-mode .table-row:hover {
  background-color: rgba(255, 255, 255, 0.03);
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

/* Pagination styles */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 1.5rem;
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
.dark-mode .page-btn {
  background: #252538;
  border-color: #3f3f5f;
  color: #e2e2e2;
}

.dark-mode .page-btn:hover:not(.disabled) {
  background: #303048;
  border-color: #4f4f6f;
}

.dark-mode .page-info {
  color: #a0a0b8;
}

/* Animations */
.table-fade-enter-active,
.table-fade-leave-active {
  transition: opacity 0.3s ease;
}

.table-fade-enter-from,
.table-fade-leave-to {
  opacity: 0;
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

.table-row {
  animation: fadeIn 0.3s ease-out forwards;
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

/* Modal Styles */
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
  background-color: white;
  width: 95%;
  max-width: 600px;
  border-radius: 12px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  animation: slideIn 0.3s ease;
}

.modal-header {
  padding: 1.25rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.25rem;
  color: #1a202c;
}

.close-modal {
  background: transparent;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.close-modal:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.modal-body {
  padding: 1.5rem;
}

.modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #4a5568;
}

.required::after {
  content: ' *';
  color: #e53e3e;
}

.select-wrapper {
  position: relative;
}

.select-wrapper select {
  width: 100%;
  padding: 0.75rem 1rem;
  padding-right: 2.5rem;
  font-size: 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background-color: white;
  appearance: none;
  -webkit-appearance: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.select-wrapper select:focus {
  outline: none;
  border-color: #6d1a36;
  box-shadow: 0 0 0 3px rgba(109, 26, 54, 0.2);
}

.select-arrow {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: #64748b;
  font-size: 0.8rem;
}

.rich-text-editor {
  min-height: 150px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 0.75rem;
  overflow-y: auto;
  transition: all 0.3s ease;
  font-size: 1rem;
  line-height: 1.5;
}

.rich-text-editor:focus {
  outline: none;
}

.editor-focused {
  border-color: #6d1a36;
  box-shadow: 0 0 0 3px rgba(109, 26, 54, 0.2);
}

.btn-secondary {
  background-color: #f1f5f9;
  color: #334155;
  border: 1px solid #e2e8f0;
  padding: 0.6rem 1.2rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  background-color: #e2e8f0;
}

.submit-btn {
  min-width: 100px;
}

/* Dark mode modal styles */
.dark-mode.modal-container {
  background-color: #1a1a2e;
  border: 1px solid #3f3f5f;
}

.dark-mode .modal-header {
  border-bottom-color: #3f3f5f;
}

.dark-mode .modal-header h2 {
  color: #e2e2e2;
}

.dark-mode .close-modal {
  color: #e2e2e2;
}

.dark-mode .close-modal:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.dark-mode .modal-footer {
  border-top-color: #3f3f5f;
}

.dark-mode .form-group label {
  color: #a0a0b8;
}

.dark-mode .select-wrapper select {
  background-color: #2c2c44;
  color: #e2e2e2;
  border-color: #3f3f5f;
}

.dark-mode .select-wrapper select:focus {
  border-color: #ff9ea0;
  box-shadow: 0 0 0 3px rgba(255, 158, 160, 0.2);
}

.dark-mode .select-arrow {
  color: #a0a0b8;
}

.dark-mode .rich-text-editor {
  background-color: #2c2c44;
  color: #e2e2e2;
  border-color: #3f3f5f;
}

.dark-mode .editor-focused {
  border-color: #ff9ea0;
  box-shadow: 0 0 0 3px rgba(255, 158, 160, 0.2);
}

.dark-mode .btn-secondary {
  background-color: #2c2c44;
  color: #e2e2e2;
  border-color: #3f3f5f;
}

.dark-mode .btn-secondary:hover {
  background-color: #3f3f5f;
}

/* Modern editor styles for PrimeVue */
:deep(.p-editor-container) {
  border-radius: 8px;
  overflow: hidden;
}

:deep(.p-editor-content) {
  min-height: 150px;
}

.dark-mode :deep(.p-editor-container) {
  border-color: #3f3f5f;
}

.dark-mode :deep(.p-editor-content) {
  background-color: #2c2c44;
  color: #e2e2e2;
}

/* Error message styling */
.error-message {
  color: #e53e3e;
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

/* Dark mode error message styling */
.dark-mode .error-message {
  color: #fc8181;
}

/* Modern Quill editor styles */
.transfer-editor {
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
}

.transfer-editor:focus-within {
  border-color: #6d1a36;
  box-shadow: 0 0 0 3px rgba(109, 26, 54, 0.2);
}

.editor-error {
  border-color: #e53e3e !important;
}

.dark-mode .transfer-editor {
  border-color: #3f3f5f;
}

.dark-mode .transfer-editor:focus-within {
  border-color: #ff9ea0;
  box-shadow: 0 0 0 3px rgba(255, 158, 160, 0.2);
}

:deep(.ql-toolbar) {
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  background-color: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

:deep(.ql-container) {
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
  min-height: 150px;
  font-family: inherit;
}

.dark-mode :deep(.ql-toolbar) {
  background-color: #252538;
  border-color: #3f3f5f;
}

.dark-mode :deep(.ql-container) {
  background-color: #2c2c44;
  color: #e2e2e2;
  border-color: #3f3f5f;
}

.dark-mode :deep(.ql-stroke) {
  stroke: #a0a0b8;
}

.dark-mode :deep(.ql-fill) {
  fill: #a0a0b8;
}

.dark-mode :deep(.ql-picker-label) {
  color: #a0a0b8;
}

/* Animation keyframes */
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
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* RTL support for Arabic */
[dir='rtl'] .select-arrow {
  right: auto;
  left: 1rem;
}

[dir='rtl'] .modal-footer {
  flex-direction: row-reverse;
}

.loading-row {
  text-align: center;
  padding: 2rem !important;
  color: #64748b;
  font-style: italic;
  animation: pulse 1.5s infinite;
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

/* Dark mode loading styles */
.dark-mode .loading-row {
  color: #a0a0b8;
}

.description-cell {
  display: flex;
  align-items: center;
  justify-content: center; /* Changed from space-between to center */
  max-width: auto;
}

.view-desc-btn {
  flex-shrink: 0;
  margin-left: 0; /* Removed margin since we're centered */
}

[dir='rtl'] .view-desc-btn {
  margin-left: 0;
  margin-right: 0; /* Removed margin since we're centered */
}

/* Description Modal Styles */
.desc-modal-container {
  background-color: white;
  width: 95%;
  max-width: 600px;
  border-radius: 12px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  animation: slideIn 0.3s ease;
}

.desc-modal-body {
  max-height: 60vh;
  overflow-y: auto;
}

.desc-content {
  line-height: 1.6;
}

.desc-content :deep(p) {
  margin-bottom: 1rem;
}

.desc-content :deep(ul),
.desc-content :deep(ol) {
  margin-left: 1.5rem;
  margin-bottom: 1rem;
}

.no-desc {
  color: #64748b;
  font-style: italic;
  text-align: center;
}

.dark-mode .no-desc {
  color: #a0a0b8;
}

.dark-mode .desc-content {
  color: #e2e2e2;
}

/* Scrollbar styling for the description modal */
.desc-modal-body::-webkit-scrollbar {
  width: 8px;
}

.desc-modal-body::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 8px;
}

.desc-modal-body::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 8px;
}

.desc-modal-body::-webkit-scrollbar-thumb:hover {
  background: #555;
}

.dark-mode .desc-modal-body::-webkit-scrollbar-track {
  background: #2c2c44;
}

.dark-mode .desc-modal-body::-webkit-scrollbar-thumb {
  background: #4f4f6f;
}

.dark-mode .desc-modal-body::-webkit-scrollbar-thumb:hover {
  background: #5f5f7f;
}

/* Add styles for action buttons container */
.action-buttons {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
}

.delete-btn {
  color: #dc2626; /* Red color for delete button */
}

.delete-btn:hover {
  background-color: rgba(220, 38, 38, 0.1);
}

/* Dark mode delete button */
.dark-mode .delete-btn {
  color: #ef4444;
}

.dark-mode .delete-btn:hover {
  background-color: rgba(239, 68, 68, 0.15);
}

/* Delete Confirmation Modal Styles */
.delete-modal-container {
  background-color: white;
  width: 95%;
  max-width: 450px;
  border-radius: 12px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  animation: slideIn 0.3s ease;
}

.delete-message {
  text-align: center;
  font-size: 1.1rem;
  margin: 1rem 0;
}

.delete-confirm-btn {
  background: linear-gradient(135deg, #dc2626, #b91c1c);
}

.delete-confirm-btn:hover {
  background: linear-gradient(135deg, #ef4444, #dc2626);
}

.dark-mode .delete-modal-container {
  background-color: #1a1a2e;
}

.dark-mode .delete-message {
  color: #e2e2e2;
}

.dark-mode .delete-confirm-btn {
  background: linear-gradient(135deg, #ef4444, #dc2626);
}

.dark-mode .delete-confirm-btn:hover {
  background: linear-gradient(135deg, #f87171, #ef4444);
}

/* Add these new styles for file management */
.attachment-cell {
  display: flex;
  justify-content: center;
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
}

.attachment-indicator:hover {
  transform: scale(1.1);
}

.attachment-indicator::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 50%;
  opacity: 0.15;
  transition: all 0.2s ease;
}

.has-attachments {
  color: #2563eb;
}

.has-attachments::after {
  background-color: #2563eb;
}

.has-attachments:hover::after {
  opacity: 0.25;
}

.no-attachments {
  color: #9ca3af;
}

.no-attachments::after {
  background-color: #9ca3af;
}

.no-attachments:hover::after {
  opacity: 0.25;
}

.attachment-badge {
  position: absolute;
  top: -2px;
  right: -2px;
  background-color: #6d1a36;
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
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  animation: scaleIn 0.3s ease-out;
}

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

/* Dark mode attachment styles */
.dark-mode .has-attachments {
  color: #60a5fa;
}

.dark-mode .has-attachments::after {
  background-color: #60a5fa;
}

.dark-mode .no-attachments {
  color: #6b7280;
}

.dark-mode .no-attachments::after {
  background-color: #6b7280;
}

.dark-mode .attachment-badge {
  background-color: #ff9ea0;
  color: #1a1a2e;
}

/* Updated attachment cell styling */
.attachment-cell {
  display: flex;
  justify-content: center;
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
}

/* ...existing attachment indicator styles... */

.attachment-text {
  font-size: 0.875rem;
  color: #64748b;
  transition: all 0.2s ease;
  max-width: 120px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.attachment-text.with-attachments {
  color: #2563eb;
  font-weight: 500;
}

.dark-mode .attachment-text {
  color: #94a3b8;
}

.dark-mode .attachment-text.with-attachments {
  color: #60a5fa;
}

/* Remove old attachment count styles */
.attachment-count {
  position: absolute;
  top: -8px;
  right: -8px;
  background-color: #6d1a36;
  color: white;
  font-size: 0.7rem;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dark-mode .attachment-count {
  background-color: #ff9ea0;
  color: #1a1a2e;
}

/* Disabled button styles */
.disabled-btn {
  opacity: 0.5;
  cursor: not-allowed !important;
}

.disabled-btn:hover {
  background-color: transparent !important;
  transform: none !important;
}

.dark-mode .disabled-btn {
  opacity: 0.4;
}

/* Status badge clickable styles */
.status-badge {
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.status-badge:hover {
  transform: translateY(-2px);
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
}

/* Make status badge look clickable */
.status-badge {
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.status-badge:hover {
  transform: translateY(-2px);
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
}

/* Add these styles to the CSS section */
.attachment-indicator.disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.attachment-indicator.disabled:hover {
  transform: none !important;
}

.dark-mode .attachment-indicator.disabled {
  opacity: 0.5;
}

/* Enhanced attachment indicator */
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
}

.attachment-indicator:hover {
  transform: scale(1.1);
}

.has-attachments {
  color: var(--color-accent-cyan);
}

.dark-mode .has-attachments {
  color: var(--color-accent-cyan);
  text-shadow: 0 0 8px rgba(94, 234, 212, 0.4);
}

.attachment-badge {
  position: absolute;
  top: -2px;
  right: -2px;
  background: linear-gradient(135deg, var(--color-accent-primary), var(--color-accent-secondary));
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
  box-shadow: var(--shadow-light);
  animation: scaleIn 0.3s ease-out;
}

.dark-mode .attachment-badge {
  box-shadow: var(--shadow-glow-magenta);
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
  transition: all var(--transition-fast);
}

.icon-btn:hover {
  background: rgba(0, 0, 0, 0.05);
  color: var(--color-accent-primary);
  transform: translateY(-2px);
}

.dark-mode .icon-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  color: var(--color-accent-magenta);
  box-shadow: var(--shadow-glow-magenta);
}

/* Animation for table rows */
.table-fade-enter-active,
.table-fade-leave-active {
  transition: all 0.5s ease;
}

.table-fade-enter-from,
.table-fade-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

/* Responsive adjustments */
@media (max-width: 1024px) {
  .home-page {
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
    transform: scale(0.95);
    opacity: 0.7;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.3;
  }
  100% {
    transform: scale(0.95);
    opacity: 0.7;
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
