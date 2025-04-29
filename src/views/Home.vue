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
            v-for="row in paginatedRows"
            :key="row.id"
            :class="rowBg(row.statusLevel)"
            class="table-row"
          >
            <td>{{ row.attachment }}</td>
            <td>
              <span class="status-badge" :class="'status-' + row.statusLevel.toLowerCase()">
                {{ row.statusLevel }}
              </span>
            </td>
            <td>
              <button class="icon-btn" @click="editGI(row)">
                <EditIcon />
              </button>
            </td>
            <td>{{ row.period }}</td>
            <td>{{ row.date }}</td>
            <td>
              <button class="icon-btn" @click="viewDesc(row)">
                <FileTextIcon />
              </button>
            </td>
            <td>{{ row.requestedBy }}</td>
            <td class="code-cell">{{ row.code }}</td>
            <td>
              <button class="icon-btn" @click="editRow(row)">
                <EditIcon />
              </button>
            </td>
          </tr>
          <tr v-if="filteredRows.length === 0" key="no-results">
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
        :disabled="currentPage >= totalPages"
        :class="{ disabled: currentPage >= totalPages }"
      >
        {{ isArabic ? 'التالي' : 'Next' }}
      </button>
    </div>

    <!-- New Request Modal -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-container" :class="{ 'dark-mode': isDarkMode }" @click.stop>
        <div class="modal-header">
          <h2>{{ isArabic ? 'طلب مناقلة جديد' : 'New Transfer Request' }}</h2>
          <button class="close-modal" @click="closeModal">×</button>
        </div>

        <div class="modal-body">
          <!-- Time Period Field -->
          <div class="form-group">
            <label for="timePeriod" class="required">
              {{ isArabic ? 'الفترة الزمنية' : 'Time Period' }}
            </label>
            <div class="select-wrapper">
              <select id="timePeriod" v-model="newRequest.timePeriod" required>
                <option value="" disabled>{{ isArabic ? 'اختر فترة' : 'Select period' }}</option>
                <option value="Jan">{{ isArabic ? 'يناير' : 'January' }}</option>
                <option value="Feb">{{ isArabic ? 'فبراير' : 'February' }}</option>
                <option value="Mar">{{ isArabic ? 'مارس' : 'March' }}</option>
                <option value="Apr">{{ isArabic ? 'أبريل' : 'April' }}</option>
                <option value="May">{{ isArabic ? 'مايو' : 'May' }}</option>
                <option value="Jun">{{ isArabic ? 'يونيو' : 'June' }}</option>
                <option value="Jul">{{ isArabic ? 'يوليو' : 'July' }}</option>
                <option value="Aug">{{ isArabic ? 'أغسطس' : 'August' }}</option>
                <option value="Sep">{{ isArabic ? 'سبتمبر' : 'September' }}</option>
                <option value="Oct">{{ isArabic ? 'أكتوبر' : 'October' }}</option>
                <option value="Nov">{{ isArabic ? 'نوفمبر' : 'November' }}</option>
                <option value="Dec">{{ isArabic ? 'ديسمبر' : 'December' }}</option>
              </select>
              <div class="select-arrow">▼</div>
            </div>
          </div>

          <!-- Reason for Transfer Field -->
          <div class="form-group">
            <label for="transferReason" class="required">
              {{ isArabic ? 'سبب المناقلة' : 'Reason for Transfer' }}
            </label>
            <QuillEditor
              v-model:content="editorContent"
              :toolbar="editorToolbar"
              contentType="html"
              theme="snow"
              :options="editorOptions"
              class="transfer-editor"
              :class="{ 'editor-error': editorError }"
            />
            <div v-if="editorError" class="error-message">
              {{ isArabic ? 'هذا الحقل مطلوب' : 'This field is required' }}
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-secondary" @click="closeModal">
            {{ isArabic ? 'إلغاء' : 'Cancel' }}
          </button>
          <button class="btn-primary submit-btn" @click="submitRequest">
            {{ isArabic ? 'إنشاء' : 'Create' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { EditIcon, FileTextIcon, SearchIcon } from 'lucide-vue-next'
import { useThemeStore } from '@/stores/themeStore'
import { QuillEditor } from '@vueup/vue-quill'

// Define component name explicitly to satisfy the multi-word rule
defineOptions({
  name: 'HomePage',
})

// Track editor state
const editorContent = ref('<p>Enter your reason here...</p>')
const editorError = ref(false)

// Define editor toolbar options
const editorToolbar = [
  ['bold', 'italic', 'underline', 'strike'],
  [{ list: 'ordered' }, { list: 'bullet' }],
  [{ align: [] }],
  ['clean'],
]

// Define editor options
const editorOptions = {
  placeholder: 'Enter your reason here...',
  modules: {
    toolbar: editorToolbar,
  },
}

// ───────────────────────────────────────────────────────────── Type Declarations
interface RowData {
  id: number
  attachment: string
  statusLevel: string
  period: string
  date: string
  requestedBy: string
  code: string
}

// ───────────────────────────────────────────────────────────── Helper Functions
function editGI(row: RowData) {
  console.log('Editing GI for row:', row.id)
}
function viewDesc(row: RowData) {
  console.log('Viewing description for row:', row.id)
}
function editRow(row: RowData) {
  console.log('Editing row:', row.id)
}
function rowBg(status: string) {
  if (status === 'Approved') return 'row-approved'
  if (status === 'Pending') return 'row-pending'
  return 'row-none'
}

// ───────────────────────────────────────────────────────────── Theme & Lang
const themeStore = useThemeStore()
const isArabic = ref(false)
const isDarkMode = ref(false)

onMounted(() => {
  isArabic.value = themeStore.language === 'ar'
  isDarkMode.value = themeStore.darkMode
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

// ───────────────────────────────────────────────────────────── Sample Rows
type Rows = RowData[]
const rows = ref<Rows>([
  {
    id: 1,
    attachment: 'Yes',
    statusLevel: 'Pending',
    period: 'Feb',
    date: '1/29/2025',
    requestedBy: '661',
    code: 'FAR-0001',
  },
  {
    id: 2,
    attachment: 'Yes',
    statusLevel: 'Approved',
    period: 'Mar',
    date: '1/28/2025',
    requestedBy: '661',
    code: 'FAR-0002',
  },
  {
    id: 3,
    attachment: 'No',
    statusLevel: 'No Data',
    period: 'Apr',
    date: '1/29/2025',
    requestedBy: '661',
    code: 'FAR-0003',
  },
  {
    id: 4,
    attachment: 'Yes',
    statusLevel: 'Approved',
    period: 'May',
    date: '2/1/2025',
    requestedBy: '662',
    code: 'FAR-0004',
  },
  {
    id: 5,
    attachment: 'No',
    statusLevel: 'Pending',
    period: 'Jun',
    date: '2/5/2025',
    requestedBy: '663',
    code: 'FAR-0005',
  },
  {
    id: 6,
    attachment: 'Yes',
    statusLevel: 'Approved',
    period: 'Jul',
    date: '2/10/2025',
    requestedBy: '664',
    code: 'FAR-0006',
  },
  {
    id: 7,
    attachment: 'No',
    statusLevel: 'No Data',
    period: 'Aug',
    date: '2/15/2025',
    requestedBy: '665',
    code: 'FAR-0007',
  },
  {
    id: 8,
    attachment: 'Yes',
    statusLevel: 'Pending',
    period: 'Sep',
    date: '2/20/2025',
    requestedBy: '666',
    code: 'FAR-0008',
  },
  {
    id: 9,
    attachment: 'No',
    statusLevel: 'Approved',
    period: 'Oct',
    date: '2/25/2025',
    requestedBy: '667',
    code: 'FAR-0009',
  },
  {
    id: 10,
    attachment: 'Yes',
    statusLevel: 'Pending',
    period: 'Nov',
    date: '3/1/2025',
    requestedBy: '668',
    code: 'FAR-0010',
  },
  {
    id: 11,
    attachment: 'No',
    statusLevel: 'No Data',
    period: 'Dec',
    date: '3/5/2025',
    requestedBy: '669',
    code: 'FAR-0011',
  },
  {
    id: 12,
    attachment: 'Yes',
    statusLevel: 'Approved',
    period: 'Jan',
    date: '3/10/2025',
    requestedBy: '670',
    code: 'FAR-0012',
  },
])

// ───────────────────────────────────────────────────────────── Search & Pagination
const searchQuery = ref('')
const currentPage = ref(1)
const itemsPerPage = 10

function clearSearch() {
  searchQuery.value = ''
}
function nextPage() {
  if (currentPage.value < totalPages.value) currentPage.value++
}
function prevPage() {
  if (currentPage.value > 1) currentPage.value--
}
const filteredRows = computed(() =>
  rows.value.filter((r) => r.code?.toLowerCase().includes(searchQuery.value.toLowerCase())),
)
watch(searchQuery, () => (currentPage.value = 1))
const totalPages = computed(() => Math.ceil(filteredRows.value.length / itemsPerPage))
const paginatedRows = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredRows.value.slice(start, start + itemsPerPage)
})

// ───────────────────────────────────────────────────────────── Modal
const showModal = ref(false)
const newRequest = ref({
  timePeriod: '',
  transferReason: '',
})

function openNewRequestModal() {
  showModal.value = true
  newRequest.value = { timePeriod: '', transferReason: '' }
  // Reset editor content and error state when opening modal
  editorContent.value = '<p>Enter your reason here...</p>'
  editorError.value = false
}

function closeModal() {
  showModal.value = false
  // Reset error state when closing
  editorError.value = false
}

function submitRequest() {
  // Validate fields
  const isDefaultContent =
    editorContent.value === '<p>Enter your reason here...</p>' ||
    editorContent.value === '<p><br></p>' ||
    editorContent.value === ''

  if (!newRequest.value.timePeriod || isDefaultContent) {
    // Show error for editor if it's empty or has default content
    if (isDefaultContent) {
      editorError.value = true
    }

    alert(isArabic.value ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill all required fields')
    return
  }

  // Reset error state
  editorError.value = false

  // Update transfer reason with editor content
  newRequest.value.transferReason = editorContent.value

  console.log('Submitting new request:', newRequest.value)
  closeModal()
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
</style>
