<template>
  <div class="contract-page" :class="{ 'dark-mode': isDarkMode }">
    <!-- top bar: new request / actions / search -->
    <div class="toolbar">
      <button class="btn-primary" @click="openNewRequestModal">
        <span class="btn-icon">+</span>
        {{ isArabic ? 'طلب عقد جديد' : 'New Contract' }}
      </button>

      <div class="toolbar-right">
        <div class="search-container">
          <SearchIcon class="search-icon" />
          <input
            v-model="searchQuery"
            type="search"
            :placeholder="isArabic ? 'بحث...' : 'Search...'"
            class="input-search"
            @input="handleSearch"
          />
          <button v-if="searchQuery" @click="clearSearch" class="clear-search">×</button>
        </div>
      </div>
    </div>

    <!-- table -->
    <div class="table-container">
      <transition-group name="table-fade" tag="table" class="main-table">
        <thead key="head">
          <tr>
            <th>{{ tableHeaders.attachment }}</th>
            <th>{{ tableHeaders.statusLevel }}</th>
            <th>{{ tableHeaders.giPostingStatus }}</th>
            <th>{{ tableHeaders.contractPeriod }}</th>
            <th>{{ tableHeaders.requestDate }}</th>
            <th>{{ tableHeaders.contractDescription }}</th>
            <th>{{ tableHeaders.requestedBy }}</th>
            <th>{{ tableHeaders.code }}</th>
            <th></th>
          </tr>
        </thead>
        <tbody key="body">
          <tr
            v-for="row in displayedRows"
            :key="row.transaction_id"
            :class="rowBg(row.status)"
            class="table-row"
          >
            <td>
              <div class="attachment-cell">
                <div
                  class="attachment-indicator"
                  :class="{
                    'has-attachments': row.attachment_count > 0,
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
                  <span v-if="row.attachment_count > 0" class="attachment-badge">
                    {{ row.attachment_count }}
                  </span>
                </div>
                <span
                  class="attachment-text"
                  :class="{ 'with-attachments': row.attachment_count > 0 }"
                >
                  {{ row.attachment }}
                </span>
              </div>
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
              <button class="icon-btn" @click="editGI(row)">
                <EditIcon />
              </button>
            </td>
            <td>{{ row.transaction_date }}</td>
            <td>{{ formatDate(row.request_date) }}</td>
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
            <td>{{ row.requested_by }}</td>
            <td class="code-cell">
              <router-link :to="`/contracts/${row.transaction_id}`" class="code-link">
                {{ row.code }}
              </router-link>
            </td>
            <td>
              <div class="action-buttons">
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
                <button
                  v-if="row.status.toLowerCase() === 'pending'"
                  class="icon-btn delete-btn"
                  @click="deleteRow(row)"
                >
                  <TrashIcon />
                </button>
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

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-overlay" @click="cancelDelete">
      <div class="delete-modal-container" :class="{ 'dark-mode': isDarkMode }" @click.stop>
        <div class="modal-header">
          <h2>{{ isArabic ? 'تأكيد الحذف' : 'Confirm Deletion' }}</h2>
          <button class="close-modal" @click="cancelDelete">×</button>
        </div>
        <div class="modal-body">
          <p class="delete-message">
            {{
              isArabic
                ? 'هل أنت متأكد من رغبتك في حذف هذا العقد؟'
                : 'Are you sure you want to delete this contract?'
            }}
          </p>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="cancelDelete">
            {{ isArabic ? 'إلغاء' : 'Cancel' }}
          </button>
          <button class="btn-primary delete-confirm-btn" @click="confirmDelete">
            {{ isArabic ? 'نعم، حذف' : 'Yes, Delete' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Attachment Modal Component -->
    <AttachmentModal
      v-model:show="showFileModal"
      :transaction-id="currentTransactionId"
      @files-updated="handleFilesUpdated"
    />

    <!-- Approval Pipeline Modal Component -->
    <ApprovalPipelineModal v-model="showApprovalModal" :approval-data="currentApproval" />
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
import contractService from '@/services/contractService'

// Import CSS
import '@/assets/css/Contracts.css'

// Define component name explicitly to satisfy the multi-word rule
defineOptions({
  name: 'ContractsPage',
})

// Page size constant
const PAGE_SIZE = 10

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
      // Show success message
      alert(isArabic.value ? 'تم حذف العقد بنجاح' : 'Contract deleted successfully')
    })
    .catch((error) => {
      console.error('Error deleting contract:', error)
      alert(isArabic.value ? 'حدث خطأ أثناء حذف العقد' : 'Error deleting the contract')
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
function openFileModal(row) {
  currentTransactionId.value = row.transaction_id
  showFileModal.value = true
}

// Handle files updated event from attachment modal
function handleFilesUpdated() {
  // Refresh the main data to update attachment counts
  fetchData()
}

// Add function to generate attachment tooltip
function getAttachmentTooltip(row: ContractData): string {
  if (!row.attachment_count) {
    return isArabic.value ? 'لا توجد مرفقات' : 'No attachments'
  }

  return isArabic.value
    ? `${row.attachment_count} مرفقات - انقر للعرض`
    : `${row.attachment_count} attachments - Click to view`
}

// Function to open the approval modal
function openApprovalModal(row: ContractData) {
  currentApproval.value = row
  showApprovalModal.value = true
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
  giPostingStatus: 'Posting Status - Oracle System',
  contractPeriod: 'Contract Period',
  requestDate: 'Request Date',
  contractDescription: 'Contract Description',
  requestedBy: 'Requested By',
  code: 'Code',
}
const arabicHeaders = {
  attachment: 'مرفقات',
  statusLevel: 'مستوى حالة الطلب',
  giPostingStatus: 'حالة العقد في نظام الأوراكل',
  contractPeriod: 'فترة العقد',
  requestDate: 'تاريخ الطلب',
  contractDescription: 'وصف العقد',
  requestedBy: 'طلب من',
  code: 'الرمز',
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
  return Math.ceil(totalCount.value / PAGE_SIZE) || 1
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
</script>
