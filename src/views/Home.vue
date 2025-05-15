<template>
  <div class="home-page" :class="{ 'dark-mode': isDarkMode }">
    <!-- top bar: new request / actions / search -->
    <div class="toolbar">
      <button class="btn-primary" @click="openNewRequestModal">
        <span class="btn-icon">+</span>
        {{ isArabic ? 'طلب ملاحظة جديدة' : 'New Request' }}
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
            <th>{{ tableHeaders.transferPeriod }}</th>
            <th>{{ tableHeaders.requestDate }}</th>
            <th>{{ tableHeaders.transferDescription }}</th>
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
            <td>{{ row.attachment ? 'Yes' : 'No' }}</td>
            <td>
              <span class="status-badge" :class="'status-' + row.status.toLowerCase()">
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
              <router-link :to="`/cost-center-transfer/${row.transaction_id}`" class="code-link">
                {{ row.code }}
              </router-link>
            </td>
            <td>
              <div class="action-buttons">
                <button class="icon-btn" @click="editRow(row)">
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

    <!-- New Request Modal Component -->
    <NewRequestModal v-model="showModal" @submit="handleNewRequestSubmit" />

    <!-- Edit Transfer Modal Component -->
    <EditTransferModal
      v-model="showEditModal"
      :transferData="currentEditTransfer"
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
                ? 'هل أنت متأكد من رغبتك في حذف هذا الطلب؟'
                : 'Are you sure you want to delete this request?'
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { EditIcon, FileTextIcon, SearchIcon, TrashIcon } from 'lucide-vue-next'
import { useThemeStore } from '@/stores/themeStore'
import { useAuthStore } from '@/stores/authStore'
import NewRequestModal from '@/components/NewRequestModal.vue'
import EditTransferModal from '@/components/EditTransferModal.vue'
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
      // Show success message
      alert(isArabic.value ? 'تم حذف الطلب بنجاح' : 'Request deleted successfully')
    })
    .catch((error) => {
      console.error('Error deleting request:', error)
      alert(isArabic.value ? 'حدث خطأ أثناء حذف الطلب' : 'Error deleting the request')
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
  return 'row-none'
}

// ───────────────────────────────────────────────────────────── Theme & Lang
const themeStore = useThemeStore()
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
  giPostingStatus: 'posting Status - oracle System',
  transferPeriod: 'Transfer Period',
  requestDate: 'Request Date',
  transferDescription: 'Transfer Description',
  requestedBy: 'Requested By',
  code: 'Code',
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
function handleEditSubmit(updatedData: any) {
  console.log('Transfer updated:', updatedData)
  // After successful update, refresh the data
  fetchData()
}
</script>

<style scoped>
.home-page {
  padding: 1.5rem;
  max-width: auto;
  margin: 0 auto;
  transition:
    background-color 0.3s ease,
    color 0.3s ease;
}

/* Dark mode styles */
.dark-mode {
  background-color: #1a1a2e;
  color: #e2e2e2;
}

/* --- toolbar --- */
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.btn-primary {
  background: linear-gradient(135deg, #6d1a36, #4a0d20);
  color: #fff;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.btn-primary:hover {
  background: linear-gradient(135deg, #7d2a46, #5a1d30);
  transform: translateY(-2px);
  box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15);
}

.btn-primary:active {
  transform: translateY(1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn-icon {
  font-size: 1.2rem;
  font-weight: bold;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

/* Modern search input */
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

.input-search {
  width: 250px;
  padding: 0.6rem 0.6rem 0.6rem 2.2rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  transition: all 0.3s ease;
  font-size: 0.9rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
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

/* Dark mode button and UI elements */
.dark-mode .btn-primary {
  background: linear-gradient(135deg, #7d2a46, #5a1d30);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
}

.dark-mode .input-search {
  background-color: #2c2c44;
  color: #e2e2e2;
  border-color: #3f3f5f;
}

.dark-mode .input-search::placeholder {
  color: #8f8fa8;
}

.dark-mode .search-icon,
.dark-mode .clear-search {
  color: #8f8fa8;
}

/* --- table container --- */
.table-container {
  overflow-x: auto;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  margin-bottom: 1rem;
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

.table-row {
  transition: all 0.2s ease;
}

.table-row:hover {
  background-color: rgba(109, 26, 54, 0.05);
}

.no-results {
  text-align: center;
  padding: 2rem !important;
  color: #64748b;
  font-style: italic;
}

/* Dark mode table styling */
.dark-mode .table-container {
  background-color: #2c2c44;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
}

.dark-mode .main-table th {
  background: #252538;
  color: #a0a0b8;
}

.dark-mode .main-table td {
  border-bottom-color: #3f3f5f;
}

.dark-mode .table-row:hover {
  background-color: rgba(125, 42, 70, 0.15);
}

.dark-mode .no-results {
  color: #a0a0b8;
}

/* --- Status badges --- */
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

.status-no {
  background-color: rgba(156, 163, 175, 0.2);
  color: #4b5563;
}

/* Dark mode status badges */
.dark-mode .status-approved {
  background-color: rgba(52, 211, 153, 0.15);
  color: #4ade80;
}

.dark-mode .status-pending {
  background-color: rgba(248, 113, 113, 0.15);
  color: #fb7185;
}

.dark-mode .status-no {
  background-color: rgba(156, 163, 175, 0.15);
  color: #bfc3cd;
}

/* --- row colors - subtler version --- */
.row-pending {
  background: rgba(248, 113, 113, 0.1);
}

.row-approved {
  background: rgba(52, 211, 153, 0.1);
}

.row-none {
  background: rgba(156, 163, 175, 0.1);
}

/* Dark mode row colors */
.dark-mode .row-pending {
  background: rgba(248, 113, 113, 0.08);
}

.dark-mode .row-approved {
  background: rgba(52, 211, 153, 0.08);
}

.dark-mode .row-none {
  background: rgba(156, 163, 175, 0.08);
}

/* --- icons in cells --- */
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

.code-cell {
  color: #6d1a36;
  font-weight: 600;
}

.code-link {
  color: #6d1a36;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: color 0.2s ease;
}

.code-link:hover {
  text-decoration: underline;
  color: #8a2a44;
}

.dark-mode .code-link {
  color: #ff9ea0;
}

.dark-mode .code-link:hover {
  color: #ffb5b7;
}

/* Dark mode icon buttons */
.dark-mode .icon-btn {
  color: #ff9ea0;
}

.dark-mode .icon-btn:hover {
  background-color: rgba(125, 42, 70, 0.2);
}

.dark-mode .code-cell {
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
</style>
