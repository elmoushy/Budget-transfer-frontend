<template>
  <div class="approval-page" :class="{ 'dark-mode': isDarkMode }">
    <!-- top bar: title / search -->
    <div class="toolbar">
      <h1 class="page-title">
        {{ isArabic ? 'المناقصات قيد الاعتماد' : 'Contracts Pending Approval' }}
      </h1>

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

    <!-- table -->
    <div class="table-container">
      <transition-group name="table-fade" tag="table" class="main-table">
        <thead key="head">
          <tr>
            <th class="checkbox-column">
              <label class="checkbox-container">
                <input type="checkbox" @change="toggleAllRows" :checked="allRowsSelected" />
                <span class="checkmark"></span>
              </label>
            </th>
            <th>{{ tableHeaders.stateLevel }}</th>
            <th>{{ tableHeaders.code }}</th>
            <th>{{ tableHeaders.requestDate }}</th>
            <th>{{ tableHeaders.requestedBy }}</th>
            <th>{{ tableHeaders.transactionDate }}</th>
            <th>{{ isArabic ? 'إجراءات' : 'Actions' }}</th>
          </tr>
        </thead>
        <tbody key="body">
          <tr
            v-for="row in paginatedRows"
            :key="row.id"
            :class="[rowBg(row.stateLevel), { 'row-selected': isRowSelected(row) }]"
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
              <span class="status-badge" :class="'status-' + row.stateLevel.toLowerCase()">
                {{ row.stateLevel }}
              </span>
            </td>
            <td class="code-cell">{{ row.code }}</td>
            <td>{{ row.requestDate }}</td>
            <td>{{ row.requestedBy }}</td>
            <td>{{ row.transactionDate }}</td>
            <td>
              <div class="action-buttons-cell">
                <button class="icon-btn view-btn" @click="viewDetails(row)" title="View Details">
                  <EyeIcon />
                </button>
                <button class="icon-btn approve-btn" @click="approveRow(row)" title="Approve">
                  <CheckIcon />
                </button>
                <button class="icon-btn reject-btn" @click="rejectRow(row)" title="Reject">
                  <XIcon />
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="filteredRows.length === 0" key="no-results">
            <td colspan="7" class="no-results">
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

    <!-- Confirmation Modal -->
    <div v-if="showConfirmModal" class="modal-overlay" @click="closeConfirmModal">
      <div class="modal-container" :class="{ 'dark-mode': isDarkMode }" @click.stop>
        <div class="modal-header">
          <h2>{{ confirmModalTitle }}</h2>
          <button class="close-modal" @click="closeConfirmModal">×</button>
        </div>
        <div class="modal-body">
          <p>{{ confirmModalMessage }}</p>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="closeConfirmModal">
            {{ isArabic ? 'إلغاء' : 'Cancel' }}
          </button>
          <button
            :class="confirmModalType === 'approve' ? 'btn-approve' : 'btn-reject'"
            @click="confirmAction"
          >
            {{
              confirmModalType === 'approve'
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { SearchIcon, EyeIcon, CheckIcon, XIcon } from 'lucide-vue-next'
import { useThemeStore } from '@/stores/themeStore'

// Define component name explicitly
defineOptions({
  name: 'ContractsPendingApprovalPage',
})

// ───────────────────────────────────────────────────────────── Type Declarations
interface RowData {
  id: number
  stateLevel: string
  code: string
  requestDate: string
  requestedBy: string
  transactionDate: string
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

// ───────────────────────────────────────────────────────────── Sample Data
type Rows = RowData[]
const rows = ref<Rows>([
  {
    id: 1,
    stateLevel: 'Pending',
    code: 'TR-0001',
    requestDate: '2023-07-15',
    requestedBy: 'Ahmed Mohammed',
    transactionDate: 'July 2023',
  },
  {
    id: 2,
    stateLevel: 'Under Review',
    code: 'TR-0002',
    requestDate: '2023-07-18',
    requestedBy: 'Fatima Ali',
    transactionDate: 'July 2023',
  },
  {
    id: 3,
    stateLevel: 'Pending',
    code: 'TR-0003',
    requestDate: '2023-07-20',
    requestedBy: 'Mohammed Salem',
    transactionDate: 'August 2023',
  },
  {
    id: 4,
    stateLevel: 'Under Review',
    code: 'TR-0004',
    requestDate: '2023-07-22',
    requestedBy: 'Layla Ibrahim',
    transactionDate: 'August 2023',
  },
  {
    id: 5,
    stateLevel: 'Pending',
    code: 'TR-0005',
    requestDate: '2023-07-25',
    requestedBy: 'Khalid Ahmed',
    transactionDate: 'August 2023',
  },
  {
    id: 6,
    stateLevel: 'Under Review',
    code: 'TR-0006',
    requestDate: '2023-07-27',
    requestedBy: 'Noor Hassan',
    transactionDate: 'August 2023',
  },
  {
    id: 7,
    stateLevel: 'Pending',
    code: 'TR-0007',
    requestDate: '2023-07-30',
    requestedBy: 'Samir Qasim',
    transactionDate: 'September 2023',
  },
  {
    id: 8,
    stateLevel: 'Under Review',
    code: 'TR-0008',
    requestDate: '2023-08-02',
    requestedBy: 'Aisha Mohammed',
    transactionDate: 'September 2023',
  },
  {
    id: 9,
    stateLevel: 'Pending',
    code: 'TR-0009',
    requestDate: '2023-08-05',
    requestedBy: 'Omar Farooq',
    transactionDate: 'September 2023',
  },
  {
    id: 10,
    stateLevel: 'Under Review',
    code: 'TR-0010',
    requestDate: '2023-08-08',
    requestedBy: 'Zainab Ali',
    transactionDate: 'September 2023',
  },
  {
    id: 11,
    stateLevel: 'Pending',
    code: 'TR-0011',
    requestDate: '2023-08-10',
    requestedBy: 'Youssef Hamid',
    transactionDate: 'October 2023',
  },
  {
    id: 12,
    stateLevel: 'Under Review',
    code: 'TR-0012',
    requestDate: '2023-08-12',
    requestedBy: 'Rania Ahmed',
    transactionDate: 'October 2023',
  },
])

// ───────────────────────────────────────────────────────────── Row Selection
const selectedRows = ref<RowData[]>([])

const allRowsSelected = computed(() => {
  return filteredRows.value.length > 0 && selectedRows.value.length === filteredRows.value.length
})

function isRowSelected(row: RowData) {
  return selectedRows.value.some((selectedRow) => selectedRow.id === row.id)
}

function toggleRowSelection(row: RowData) {
  if (isRowSelected(row)) {
    selectedRows.value = selectedRows.value.filter((selectedRow) => selectedRow.id !== row.id)
  } else {
    selectedRows.value.push(row)
  }
}

function toggleAllRows(event: Event) {
  const checkbox = event.target as HTMLInputElement
  if (checkbox.checked) {
    selectedRows.value = [...filteredRows.value]
  } else {
    selectedRows.value = []
  }
}

// ───────────────────────────────────────────────────────────── Row Styling
function rowBg(status: string) {
  if (status === 'Approved') return 'row-approved'
  if (status === 'Rejected') return 'row-rejected'
  if (status === 'Under Review') return 'row-review'
  return 'row-pending'
}

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

const filteredRows = computed(() => {
  const query = searchQuery.value.toLowerCase()
  return rows.value.filter(
    (row) =>
      row.code.toLowerCase().includes(query) ||
      row.requestedBy.toLowerCase().includes(query) ||
      row.transactionDate.toLowerCase().includes(query),
  )
})

watch(searchQuery, () => {
  currentPage.value = 1
  selectedRows.value = []
})

const totalPages = computed(() => Math.ceil(filteredRows.value.length / itemsPerPage))
const paginatedRows = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredRows.value.slice(start, start + itemsPerPage)
})

// ───────────────────────────────────────────────────────────── Row Actions
function viewDetails(row: RowData) {
  console.log('View details for row:', row.id)
  // Implement view details functionality
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

function showConfirmationModal(type: 'approve' | 'reject', rowsToAction: RowData[]) {
  confirmModalType.value = type
  rowsToProcess.value = rowsToAction

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

function confirmAction() {
  const type = confirmModalType.value
  const actionItems = rowsToProcess.value

  // Implement the actual action (API call would go here)
  console.log(
    `${type === 'approve' ? 'Approving' : 'Rejecting'} ${actionItems.length} items:`,
    actionItems,
  )

  // Update UI (in a real app, you'd wait for API confirmation)
  actionItems.forEach((item) => {
    const rowIndex = rows.value.findIndex((row) => row.id === item.id)
    if (rowIndex !== -1) {
      rows.value[rowIndex].stateLevel = type === 'approve' ? 'Approved' : 'Rejected'
    }
  })

  // Clear selection
  selectedRows.value = selectedRows.value.filter(
    (row) => !actionItems.some((item) => item.id === row.id),
  )

  closeConfirmModal()
}
</script>

<style scoped>
.approval-page {
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

.dark-mode .page-title {
  color: #e2e2e2;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 0.8rem;
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

/* Dark mode search */
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

/* Selection bar */
.selection-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f8fafc;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  margin-bottom: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  animation: slideIn 0.3s ease-out;
}

.dark-mode .selection-bar {
  background-color: #2c2c44;
}

.selection-info {
  font-weight: 500;
  color: #4b5563;
}

.dark-mode .selection-info {
  color: #e2e2e2;
}

.action-buttons {
  display: flex;
  gap: 0.75rem;
}

/* Table container */
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

.row-selected {
  background-color: rgba(109, 26, 54, 0.1) !important;
}

.dark-mode .row-selected {
  background-color: rgba(125, 42, 70, 0.2) !important;
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
.dark-mode .checkmark {
  background-color: #2c2c44;
  border-color: #3f3f5f;
}

.dark-mode .checkbox-container:hover input ~ .checkmark {
  background-color: #252538;
  border-color: #4f4f6f;
}

.dark-mode .checkbox-container input:checked ~ .checkmark {
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
.dark-mode .status-approved {
  background-color: rgba(52, 211, 153, 0.15);
  color: #4ade80;
}

.dark-mode .status-pending {
  background-color: rgba(248, 113, 113, 0.15);
  color: #fb7185;
}

.dark-mode .status-under {
  background-color: rgba(245, 158, 11, 0.15);
  color: #fbbf24;
}

.dark-mode .status-rejected {
  background-color: rgba(239, 68, 68, 0.15);
  color: #fb7185;
}

/* Row background colors */
.row-pending {
  background: rgba(248, 113, 113, 0.1);
}

.row-approved {
  background: rgba(52, 211, 153, 0.1);
}

.row-rejected {
  background: rgba(239, 68, 68, 0.1);
}

.row-review {
  background: rgba(245, 158, 11, 0.1);
}

/* Dark mode row colors */
.dark-mode .row-pending {
  background: rgba(248, 113, 113, 0.08);
}

.dark-mode .row-approved {
  background: rgba(52, 211, 153, 0.08);
}

.dark-mode .row-rejected {
  background: rgba(239, 68, 68, 0.08);
}

.dark-mode .row-review {
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
.dark-mode .icon-btn {
  color: #ff9ea0;
}

.dark-mode .view-btn {
  color: #60a5fa;
}

.dark-mode .approve-btn {
  color: #4ade80;
}

.dark-mode .reject-btn {
  color: #fb7185;
}

.dark-mode .icon-btn:hover {
  background-color: rgba(125, 42, 70, 0.2);
}

.dark-mode .view-btn:hover {
  background-color: rgba(96, 165, 250, 0.2);
}

.dark-mode .approve-btn:hover {
  background-color: rgba(74, 222, 128, 0.2);
}

.dark-mode .reject-btn:hover {
  background-color: rgba(251, 113, 133, 0.2);
}

.code-cell {
  color: #6d1a36;
  font-weight: 600;
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

/* Confirmation modal */
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
  max-width: 500px;
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

/* Dark mode modal */
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

.dark-mode .btn-secondary {
  background-color: #2c2c44;
  color: #e2e2e2;
  border-color: #3f3f5f;
}

.dark-mode .btn-secondary:hover {
  background-color: #3f3f5f;
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

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
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

/* RTL support */
[dir='rtl'] .search-icon {
  left: auto;
  right: 10px;
}

[dir='rtl'] .input-search {
  padding: 0.6rem 2.2rem 0.6rem 0.6rem;
}

[dir='rtl'] .clear-search {
  right: auto;
  left: 10px;
}

[dir='rtl'] .modal-footer {
  flex-direction: row-reverse;
}
</style>
