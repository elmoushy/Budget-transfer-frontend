<template>
  <div class="transfer-request-page" :class="{ 'dark-mode': isDarkMode, rtl: isRTL }">
    <div class="page-header">
      <!-- Replaced title with error message when unbalanced -->
      <div v-if="apiSummary && !apiSummary.balanced" class="balance-error-message">
        <div class="error-icon">!</div>
        <span class="error-text">
          {{
            isArabic
              ? 'الميزان غير متوازن. يرجى مراجعة قيم التحويل.'
              : 'Unbalanced transfer. Please review your transfer values.'
          }}
        </span>
      </div>
      <div class="header-actions">
        <div class="transaction-info">
          <span class="transaction-label">{{
            isArabic ? 'رقم المعاملة:' : 'Transaction ID:'
          }}</span>
          <span class="transaction-id">{{ transactionId }}</span>
        </div>
        <button
          class="btn-header-create"
          @click="createTransfer"
          :disabled="!changesMade"
          :class="{ 'btn-disabled': !changesMade }"
        >
          <span class="btn-icon">✓</span>
          {{ isArabic ? 'حفظ' : 'Save' }}
        </button>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>{{ isArabic ? 'جاري التحميل...' : 'Loading...' }}</p>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="error-container">
      <div class="error-icon">!</div>
      <p>{{ isArabic ? 'حدث خطأ أثناء تحميل البيانات' : 'Error loading data' }}</p>
      <button class="btn-retry" @click="loadData">
        {{ isArabic ? 'إعادة المحاولة' : 'Retry' }}
      </button>
    </div>

    <!-- Data display -->
    <div v-else class="data-container">
      <!-- Table -->
      <div class="card-container table-container">
        <table class="transfer-table">
          <thead>
            <tr>
              <th class="action-column"></th>
              <th>{{ isArabic ? 'إلى' : 'To' }}</th>
              <th>{{ isArabic ? 'من' : 'From' }}</th>
              <th>{{ isArabic ? 'حقًا ماليًا' : 'Encumbrance' }}</th>
              <th>{{ isArabic ? 'الموازنة المتاحة' : 'Available Budget' }}</th>
              <th>{{ isArabic ? 'الحالى' : 'Actual' }}</th>
              <th>{{ isArabic ? 'الموازنة المعتمدة' : 'Approved Budget' }}</th>
              <th>{{ isArabic ? 'اسم الحساب' : 'Account Name' }}</th>
              <th>{{ isArabic ? 'رقم الحساب' : 'Account Code' }}</th>
              <th>{{ isArabic ? 'اسم البند' : 'Cost Center Name' }}</th>
              <th>{{ isArabic ? 'رقم البند' : 'Cost Center Code' }}</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(item, index) in transferData"
              :key="item.transfer_id || index"
              class="data-row"
              :class="{
                'row-error': item.validation_errors && item.validation_errors.length > 0,
                'row-valid': !item.validation_errors || item.validation_errors.length === 0,
              }"
            >
              <td class="action-column">
                <button class="btn-delete-row" @click="deleteRow(index)" title="Delete Row">
                  <span class="delete-icon">×</span>
                </button>
                <!-- Replace tooltip with click-based error display -->
                <div
                  v-if="item.validation_errors && item.validation_errors.length > 0"
                  class="validation-error-indicator"
                  @click="showErrorDetails(item.validation_errors)"
                >
                  <span class="error-icon-small">!</span>
                </div>
                <div v-else class="validation-success-indicator">
                  <span class="success-icon-small">✓</span>
                </div>
              </td>
              <td class="number-cell">
                <input
                  type="text"
                  v-model="item.to_center_input"
                  class="number-input"
                  @input="validateNumberInput(item, 'to_center')"
                  :placeholder="isArabic ? 'إلى' : 'To'"
                />
              </td>
              <td class="number-cell">
                <input
                  type="text"
                  v-model="item.from_center_input"
                  class="number-input"
                  @input="validateNumberInput(item, 'from_center')"
                  :placeholder="isArabic ? 'من' : 'From'"
                />
              </td>
              <td class="number-cell">
                <input
                  type="text"
                  v-model="item.encumbrance_input"
                  class="number-input"
                  @input="validateNumberInput(item, 'encumbrance')"
                  :placeholder="isArabic ? 'حقًا ماليًا' : 'Encumbrance'"
                />
              </td>
              <td class="number-cell">
                <input
                  type="text"
                  v-model="item.available_budget_input"
                  class="number-input"
                  @input="validateNumberInput(item, 'available_budget')"
                  :placeholder="isArabic ? 'الموازنة المتاحة' : 'Available Budget'"
                />
              </td>
              <td class="number-cell">
                <input
                  type="text"
                  v-model="item.actual_input"
                  class="number-input"
                  @input="validateNumberInput(item, 'actual')"
                  :placeholder="isArabic ? 'الحالى' : 'Actual'"
                />
              </td>
              <td class="number-cell">
                <input
                  type="text"
                  v-model="item.approved_budget_input"
                  class="number-input"
                  @input="validateNumberInput(item, 'approved_budget')"
                  :placeholder="isArabic ? 'الموازنة المعتمدة' : 'Approved Budget'"
                />
              </td>
              <td class="name-display">
                {{ item.account_name || getAccountName(item.account_code) || '-' }}
              </td>
              <td>
                <select
                  v-model="item.account_code"
                  class="account-select"
                  @change="updateAccountName(item, $event)"
                >
                  <option value="">{{ isArabic ? 'اختر رقم الحساب' : 'Select Account' }}</option>
                  <option
                    v-for="account in accountEntities"
                    :key="account.account"
                    :value="account.account"
                  >
                    {{ account.account }}
                  </option>
                </select>
              </td>
              <td class="name-display">
                {{ item.cost_center_name || getCostCenterName(item.cost_center_code) || '-' }}
              </td>
              <td>
                <select
                  v-model="item.cost_center_code"
                  class="cost-center-select"
                  @change="updateCostCenterName(item, $event)"
                >
                  <option value="">{{ isArabic ? 'اختر رقم البند' : 'Select Cost Center' }}</option>
                  <option
                    v-for="entity in costCenterEntities"
                    :key="entity.entity"
                    :value="entity.entity"
                  >
                    {{ entity.entity }}
                  </option>
                </select>
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="summary-row">
              <td></td>
              <td class="number-cell">{{ formatNumber(summaryData.toSum) || '-' }}</td>
              <td class="number-cell">{{ formatNumber(summaryData.fromSum) || '-' }}</td>
              <td class="number-cell">{{ formatNumber(summaryData.encumbranceSum) || '-' }}</td>
              <td class="number-cell">{{ formatNumber(summaryData.availableBudgetSum) || '-' }}</td>
              <td class="number-cell">{{ formatNumber(summaryData.actualSum) || '-' }}</td>
              <td class="number-cell">{{ formatNumber(summaryData.approvedBudgetSum) || '-' }}</td>
              <td colspan="4" class="summary-label">
                {{ isArabic ? 'المجموع الكلي' : 'Overall Sum' }}
              </td>
            </tr>
            <tr>
              <td colspan="11" class="add-row-cell">
                <button class="btn-add-row" @click="addNewRow">
                  <span class="add-icon">+</span>
                  {{ isArabic ? 'إضافة صف جديد' : 'Add New Row' }}
                </button>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <!-- Total rows info -->
      <div class="total-info">
        {{ isArabic ? `المجموع ${transferData.length}` : `Total ${transferData.length}` }}
      </div>

      <!-- Action buttons -->
      <div class="action-buttons">
        <button class="btn-action btn-submit" @click="submitRequest">
          <span class="btn-icon">→</span>
          {{ isArabic ? 'تقديم' : 'Submit' }}
        </button>
        <button class="btn-action btn-upload" @click="uploadFile">
          <span class="btn-icon">↑</span>
          {{ isArabic ? 'رفع ملف المناقلة' : 'Upload Transfer File' }}
        </button>
        <button class="btn-action btn-reopen" @click="reopenRequest">
          <span class="btn-icon">↻</span>
          {{ isArabic ? 'إعادة فتح الطلب' : 'Re-open Request' }}
        </button>
        <button class="btn-action btn-report" @click="generateReport">
          <span class="btn-icon">📄</span>
          {{ isArabic ? 'تقرير' : 'Report' }}
        </button>
      </div>

      <!-- File upload input (hidden) -->
      <input
        type="file"
        ref="fileInput"
        class="hidden-file-input"
        @change="handleFileUpload"
        accept=".xlsx,.xls,.csv"
      />
    </div>

    <!-- Error details modal (outside table structure) -->
    <div v-if="showErrorModal" class="error-modal-overlay" @click="hideErrorModal">
      <div class="error-modal-content" @click.stop>
        <div class="error-modal-header">
          <h3>{{ isArabic ? 'أخطاء التحقق' : 'Validation Errors' }}</h3>
          <button class="error-modal-close" @click="hideErrorModal">×</button>
        </div>
        <div class="error-modal-body">
          <ul class="error-list">
            <li v-for="(error, errorIndex) in currentErrors" :key="errorIndex">{{ error }}</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useThemeStore } from '@/stores/themeStore'
import { useAuthStore } from '@/stores/authStore'
import axios from 'axios'
import transferService from '@/services/transferService'

// Component setup
const route = useRoute()
const router = useRouter()
const themeStore = useThemeStore()
const authStore = useAuthStore()

// State variables
const transactionId = ref(null)
const transferData = ref([])
const loading = ref(true)
const error = ref(false)
const fileInput = ref(null)
const activeTooltipIndex = ref(null) // To track which tooltip is active

// Add new state for cost center entities
const costCenterEntities = ref([])
const costCenterEntitiesLoading = ref(false)
const costCenterEntitiesError = ref(false)

// Add new state for account entities
const accountEntities = ref([])
const accountEntitiesLoading = ref(false)
const accountEntitiesError = ref(false)

// New ref to store the original data snapshot
const originalData = ref([])

// Add a new ref to track if changes have been made
const changesMade = ref(false)

// Add a new ref for the summary data from the API
const apiSummary = ref(null)

// // Computed property to detect if any change has occurred
// const changesMade = computed(() => {
//   return JSON.stringify(originalData.value) !== JSON.stringify(transferData.value)
// })

// Theme and language
const isDarkMode = computed(() => themeStore.darkMode)
const isArabic = computed(() => themeStore.language === 'ar')
const isRTL = computed(() => themeStore.language === 'ar')

// Summary data computed property
const summaryData = computed(() => {
  const data = transferData.value
  return {
    toSum: data.reduce((sum, item) => sum + (parseFloat(item.to_center) || 0), 0),
    fromSum: data.reduce((sum, item) => sum + (parseFloat(item.from_center) || 0), 0),
    encumbranceSum: data.reduce((sum, item) => sum + (parseFloat(item.encumbrance) || 0), 0),
    availableBudgetSum: data.reduce(
      (sum, item) => sum + (parseFloat(item.available_budget) || 0),
      0,
    ),
    actualSum: data.reduce((sum, item) => sum + (parseFloat(item.actual) || 0), 0),
    approvedBudgetSum: data.reduce((sum, item) => sum + (parseFloat(item.approved_budget) || 0), 0),
  }
})

// Methods for cost center dropdown
const fetchCostCenterEntities = async () => {
  costCenterEntitiesLoading.value = true
  costCenterEntitiesError.value = false

  try {
    const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
    const response = await axios.get(`${BASE_URL}/api/accounts-entities/entities/`, {
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    })

    if (response.data && response.data.data) {
      costCenterEntities.value = response.data.data
    }
  } catch (err) {
    console.error('Failed to fetch cost center entities:', err)
    costCenterEntitiesError.value = true
  } finally {
    costCenterEntitiesLoading.value = false
  }
}

// Methods for account entities dropdown
const fetchAccountEntities = async () => {
  accountEntitiesLoading.value = true
  accountEntitiesError.value = false

  try {
    const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
    const response = await axios.get(`${BASE_URL}/api/accounts-entities/accounts/`, {
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    })

    if (response.data && response.data.data) {
      accountEntities.value = response.data.data
    }
  } catch (err) {
    console.error('Failed to fetch account entities:', err)
    accountEntitiesError.value = true
  } finally {
    accountEntitiesLoading.value = false
  }
}

const getCostCenterName = (code) => {
  if (!code) return ''
  const entity = costCenterEntities.value.find((e) => e.entity === code)
  return entity ? entity.alias_default : ''
}

const updateCostCenterName = (item, event) => {
  const code = event.target.value
  item.cost_center_code = code
  item.cost_center_name = getCostCenterName(code)
  checkForChanges()
}

const getAccountName = (code) => {
  if (!code) return ''
  const account = accountEntities.value.find((a) => a.account === code)
  return account ? account.alias_default : ''
}

const updateAccountName = (item, event) => {
  const code = event.target.value
  item.account_code = code
  item.account_name = getAccountName(code)
  checkForChanges()
}

// Method to validate number input and handle conversion
const validateNumberInput = (item, field) => {
  // Get the input field value
  const inputField = `${field}_input`
  const value = item[inputField]

  // Allow empty values
  if (!value) {
    item[field] = null
    return
  }

  // Only allow digits, dot, and single minus at start
  const sanitizedValue = value
    .replace(/[^\d.-]/g, '')
    .replace(/--/g, '-')
    .replace(/\.+/g, '.')

  // Only allow a proper number format
  const isValid = /^-?\d*\.?\d*$/.test(sanitizedValue)

  if (isValid) {
    item[inputField] = sanitizedValue
    item[field] = parseFloat(sanitizedValue) || 0
  } else {
    // Revert to the numeric value if invalid
    item[inputField] = item[field] ? item[field].toString() : ''
  }

  // Mark that changes have been made
  checkForChanges()
}

// Initialize input fields on data load
const initializeInputFields = () => {
  transferData.value.forEach((item) => {
    // Set up input fields with string values for the UI
    item.to_center_input = item.to_center !== null ? item.to_center.toString() : ''
    item.from_center_input = item.from_center !== null ? item.from_center.toString() : ''
    item.encumbrance_input = item.encumbrance !== null ? item.encumbrance.toString() : ''
    item.available_budget_input =
      item.available_budget !== null ? item.available_budget.toString() : ''
    item.actual_input = item.actual !== null ? item.actual.toString() : ''
    item.approved_budget_input =
      item.approved_budget !== null ? item.approved_budget.toString() : ''
  })
}

// Add new row function
const addNewRow = () => {
  const newRow = {
    transaction: transactionId.value,
    cost_center_code: '',
    cost_center_name: '',
    account_code: '',
    account_name: '',
    approved_budget: 0,
    approved_budget_input: '',
    available_budget: 0,
    available_budget_input: '',
    from_center: 0,
    from_center_input: '',
    to_center: 0,
    to_center_input: '',
    encumbrance: 0,
    encumbrance_input: '',
    actual: 0,
    actual_input: '',
    done: 1,
  }

  transferData.value.push(newRow)

  // Mark that changes have been made
  changesMade.value = true
}

// Create transfer function
const createTransfer = async () => {
  try {
    // Only include rows with both cost_center_code and account_code
    const validRows = transferData.value.filter(
      (item) => item.cost_center_code && item.account_code,
    )
    if (!validRows.length) {
      alert(isArabic.value ? 'لا توجد بيانات صالحة للإرسال' : 'No valid rows to send')
      return
    }

    // Prepare data for API
    const dataToSend = validRows.map((item) => ({
      transaction: transactionId.value,
      cost_center_code: item.cost_center_code,
      cost_center_name: item.cost_center_name,
      account_code: item.account_code,
      account_name: item.account_name,
      approved_budget: parseFloat(item.approved_budget) || 0,
      available_budget: parseFloat(item.available_budget) || 0,
      from_center: parseFloat(item.from_center) || 0,
      to_center: parseFloat(item.to_center) || 0,
      encumbrance: parseFloat(item.encumbrance) || 0,
      actual: parseFloat(item.actual) || 0,
      done: 1,
    }))

    // Pass the auth token as second argument to the API call
    await transferService.createTransfer(dataToSend, authStore.token)
    alert(isArabic.value ? 'تم إنشاء النقل بنجاح' : 'Transfer created successfully')
    await loadData()

    // After successful save, reset the changesMade flag
    changesMade.value = false

    // Store a new snapshot of the current state
    originalData.value = JSON.parse(JSON.stringify(transferData.value))
  } catch (err) {
    alert(isArabic.value ? 'فشل في إنشاء النقل' : 'Failed to create transfer')
    console.error('Error creating transfer:', err)
  }
}

// Delete row function
const deleteRow = (index) => {
  if (transferData.value.length > 1) {
    // Just remove from local array without API call
    transferData.value.splice(index, 1)

    // Mark that changes have been made
    changesMade.value = true
  } else {
    alert(isArabic.value ? 'يجب أن يكون هناك صف واحد على الأقل' : 'At least one row must exist')
  }
}

// Function to check for changes in the data
const checkForChanges = () => {
  // If there's no original data yet, we can't compare
  if (!originalData.value || originalData.value.length === 0) {
    changesMade.value = transferData.value.length > 0
    return
  }

  // If row counts differ, changes were made
  if (originalData.value.length !== transferData.value.length) {
    changesMade.value = true
    return
  }

  // Check if any row data has changed
  for (let i = 0; i < transferData.value.length; i++) {
    const current = transferData.value[i]
    // If this is a new row without a transfer_id, mark as changed
    if (!current.transfer_id) {
      changesMade.value = true
      return
    }

    // Find corresponding original row
    const original = originalData.value.find((o) => o.transfer_id === current.transfer_id)
    if (!original) {
      changesMade.value = true
      return
    }

    // Check numeric fields for changes
    const numericFields = [
      'approved_budget',
      'available_budget',
      'from_center',
      'to_center',
      'encumbrance',
      'actual',
    ]
    for (const field of numericFields) {
      if (parseFloat(original[field] || 0) !== parseFloat(current[field] || 0)) {
        changesMade.value = true
        return
      }
    }

    // Check string fields for changes
    const stringFields = ['cost_center_code', 'cost_center_name', 'account_code', 'account_name']
    for (const field of stringFields) {
      if (original[field] !== current[field]) {
        changesMade.value = true
        return
      }
    }
  }

  // If we got here, no changes were found
  changesMade.value = false
}

// Add watchers for all the fields that could change
watch(
  () => transferData.value,
  () => {
    checkForChanges()
  },
  { deep: true },
)

// Existing methods
const loadData = async () => {
  loading.value = true
  error.value = false

  try {
    const response = await transferService.getTransferDetails(transactionId.value)

    // Check if the response has the new structure with summary and transfers
    if (response && response.summary && response.transfers) {
      // Store the summary data separately
      apiSummary.value = response.summary
      // Set transferData to the transfers array
      transferData.value = response.transfers
    } else {
      // Fallback to old structure for backward compatibility
      transferData.value = response
      apiSummary.value = null
    }

    initializeInputFields() // Initialize input fields after data load
    // Store a deep copy of the original data for future comparisons
    originalData.value = JSON.parse(JSON.stringify(transferData.value))

    // Reset changes flag after loading data
    changesMade.value = false
  } catch (err) {
    error.value = true
    console.error('Failed to load transfer data:', err)
  } finally {
    loading.value = false
  }
}

// Method to show tooltip for a specific row
const showTooltip = (index) => {
  activeTooltipIndex.value = index
}

// Method to hide tooltip
const hideTooltip = () => {
  activeTooltipIndex.value = null
}

const formatNumber = (value) => {
  if (value === null || value === undefined) return null
  return new Intl.NumberFormat(isArabic.value ? 'ar-SA' : 'en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

const submitRequest = async () => {
  try {
    await transferService.submitTransferRequest(transactionId.value)
    alert(isArabic.value ? 'تم تقديم الطلب بنجاح' : 'Request submitted successfully')
    router.push('/')
  } catch (err) {
    alert(isArabic.value ? 'فشل في تقديم الطلب' : 'Failed to submit request')
  }
}

const reopenRequest = async () => {
  try {
    await transferService.reopenTransferRequest(transactionId.value)
    alert(isArabic.value ? 'تم إعادة فتح الطلب بنجاح' : 'Request reopened successfully')
    await loadData()
  } catch (err) {
    alert(isArabic.value ? 'فشل في إعادة فتح الطلب' : 'Failed to reopen request')
  }
}

const uploadFile = () => {
  fileInput.value.click()
}

const handleFileUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  const formData = new FormData()
  formData.append('file', file)

  try {
    // Implement file upload API call here
    alert(isArabic.value ? `تم رفع الملف: ${file.name}` : `File uploaded: ${file.name}`)
    await loadData() // Reload data after successful upload
  } catch (err) {
    alert(isArabic.value ? 'فشل في رفع الملف' : 'Failed to upload file')
  }

  // Clear the file input for future uploads
  event.target.value = null
}

const generateReport = async () => {
  try {
    const blob = await transferService.generateReport(transactionId.value)

    // Create download link and trigger download
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `transfer-report-${transactionId.value}.pdf`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  } catch (err) {
    alert(isArabic.value ? 'فشل في إنشاء التقرير' : 'Failed to generate report')
  }
}

// Watch for route changes
watch(
  () => route.params.id,
  (newId) => {
    if (newId) {
      transactionId.value = parseInt(newId, 10)
      loadData()
    }
  },
  { immediate: true },
)

// Initial data load
onMounted(() => {
  transactionId.value = parseInt(route.params.id, 10)
  if (transactionId.value) {
    loadData()
    fetchCostCenterEntities() // Fetch cost center entities on mount
    fetchAccountEntities() // Fetch account entities on mount
  } else {
    // If no transaction ID, start with an empty form
    transferData.value = []
    addNewRow()
    fetchCostCenterEntities()
    fetchAccountEntities()
  }
})

// Replace tooltip state with modal state
const showErrorModal = ref(false)
const currentErrors = ref([])

// Method to show error details in modal
const showErrorDetails = (errors) => {
  currentErrors.value = errors
  showErrorModal.value = true
}

// Method to hide error modal
const hideErrorModal = () => {
  showErrorModal.value = false
}

// Remove the old tooltip methods
// const showTooltip = (index) => {
//   activeTooltipIndex.value = index
// }
// const hideTooltip = () => {
//   activeTooltipIndex.value = null
// }
</script>

<style src="@/styles/CostCenterTransferRequest.css" scoped></style>
