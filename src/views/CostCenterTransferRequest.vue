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

          <!-- Add status indicator -->
          <span class="status-indicator" :class="statusClass">
            {{ formattedStatus }}
          </span>
        </div>
        <button
          class="btn-header-create"
          @click="createTransfer"
          :disabled="!isSaveButtonEnabled"
          :class="{ 'btn-disabled': !isSaveButtonEnabled }"
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
              <th v-if="!isFromEnhancementsPage">{{ isArabic ? 'من' : 'From' }}</th>
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
                <button
                  class="btn-delete-row"
                  @click="deleteRow(index)"
                  title="Delete Row"
                  :disabled="!isScreenEditable"
                  :class="{ 'btn-disabled': !isScreenEditable }"
                >
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
                  :readonly="!isScreenEditable"
                  :class="{ 'readonly-input': !isScreenEditable }"
                />
              </td>
              <td v-if="!isFromEnhancementsPage" class="number-cell">
                <input
                  type="text"
                  v-model="item.from_center_input"
                  class="number-input"
                  @input="validateNumberInput(item, 'from_center')"
                  :placeholder="isArabic ? 'من' : 'From'"
                  :readonly="!isScreenEditable"
                  :class="{ 'readonly-input': !isScreenEditable }"
                />
              </td>
              <td class="number-cell">
                <!-- Display-only for Encumbrance -->
                <div class="name-display">
                  {{ formatNumber(item.encumbrance) || '-' }}
                </div>
              </td>
              <td class="number-cell">
                <!-- Display-only for Available Budget -->
                <div class="name-display">
                  {{ formatNumber(item.available_budget) || '-' }}
                </div>
              </td>
              <td class="number-cell">
                <!-- Display-only for Actual -->
                <div class="name-display">
                  {{ formatNumber(item.actual) || '-' }}
                </div>
              </td>
              <td class="number-cell">
                <!-- Display-only for Approved Budget -->
                <div class="name-display">
                  {{ formatNumber(item.approved_budget) || '-' }}
                </div>
              </td>
              <td class="name-display">
                {{ item.account_name || getAccountName(item.account_code) || '-' }}
              </td>
              <td>
                <select
                  v-model="item.account_code"
                  class="account-select"
                  @change="updateAccountName(item, $event)"
                  :disabled="!isScreenEditable"
                  :class="{ 'readonly-input': !isScreenEditable }"
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
                  :disabled="!isScreenEditable"
                  :class="{ 'readonly-input': !isScreenEditable }"
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
              <td v-if="!isFromEnhancementsPage" class="number-cell">
                {{ formatNumber(summaryData.fromSum) || '-' }}
              </td>
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
                <button
                  class="btn-add-row"
                  @click="addNewRow"
                  :disabled="!isScreenEditable"
                  :class="{ 'btn-disabled': !isScreenEditable }"
                >
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
        <button
          class="btn-action btn-submit"
          @click="submitRequest"
          :disabled="!isSubmitButtonEnabled"
          :class="{ 'btn-disabled': !isSubmitButtonEnabled }"
        >
          <span class="btn-icon">→</span>
          {{ isArabic ? 'تقديم' : 'Submit' }}
        </button>
        <button
          class="btn-action btn-upload"
          @click="uploadFile"
          :disabled="!isUploadButtonEnabled"
          :class="{ 'btn-disabled': !isUploadButtonEnabled }"
        >
          <span class="btn-icon">↑</span>
          {{ isArabic ? 'رفع ملف المناقلة' : 'Upload Transfer File' }}
        </button>
        <button
          class="btn-action btn-reopen"
          @click="reopenRequest"
          :disabled="!isReopenButtonEnabled"
          :class="{ 'btn-disabled': !isReopenButtonEnabled }"
        >
          <span class="btn-icon">↻</span>
          {{ isArabic ? 'إعادة فتح الطلب' : 'Re-open Request' }}
        </button>
        <button class="btn-action btn-report" @click="generateReport">
          <span class="btn-icon">📄</span>
          {{ isArabic ? 'تقرير' : 'Report' }}
        </button>
      </div>

      <!-- Use the new File Upload Modal component without apiBaseUrl prop -->
      <FileUploadModal
        :show="showFileModal"
        :is-arabic="isArabic"
        :transaction-id="transactionId"
        :auth-token="authStore.token"
        @close="closeFileModal"
        @upload-success="handleUploadSuccess"
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
    <!-- Add the FuturisticPopup component at the end of the template -->
    <FuturisticPopup
      v-model:show="showPopup"
      :type="popupType"
      :message="popupMessage"
      :duration="popupDuration"
      @complete="handlePopupComplete"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useThemeStore } from '@/stores/themeStore'
import { useAuthStore } from '@/stores/authStore'
import axios from 'axios'
import transferService from '@/services/transferService'
import FileUploadModal from '@/components/FileUploadModal.vue'
import { useNavigationStore } from '@/stores/navigationStore'
import FuturisticPopup from '@/components/FuturisticPopup.vue'

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

// Add new ref for current status
const currentStatus = ref('not yet sent for approval') // Default value

// Add a computed property to check if navigation is from EnhancementsPage
const navigationStore = useNavigationStore()
const isFromEnhancementsPage = computed(() => {
  // Check both the navigation store and URL query parameter
  return route.query.source === 'EnhancementsPage'
})

// Add new helper computed property to check for validation errors
const hasValidationErrors = computed(() => {
  return transferData.value.some(
    (item) => item.validation_errors && item.validation_errors.length > 0,
  )
})

// Computed properties to control UI based on status
const isScreenEditable = computed(() => {
  return (
    currentStatus.value === 'is rejected' || currentStatus.value === 'not yet sent for approval'
  )
})

const isSaveButtonEnabled = computed(() => {
  return (
    (currentStatus.value === 'is rejected' ||
      currentStatus.value === 'not yet sent for approval') &&
    changesMade.value
  )
})

const isSubmitButtonEnabled = computed(() => {
  // Disable if there are validation errors or the balance is false
  if ((apiSummary.value && apiSummary.value.balanced === false) || hasValidationErrors.value) {
    return false
  }
  return currentStatus.value === 'not yet sent for approval'
})

const isReopenButtonEnabled = computed(() => {
  // Disable if there are validation errors or the balance is false
  if ((apiSummary.value && apiSummary.value.balanced === false) || hasValidationErrors.value) {
    return false
  }
  return currentStatus.value === 'is rejected'
})

const isUploadButtonEnabled = computed(() => {
  return currentStatus.value === 'not yet sent for approval'
})

// Format status for display
const formattedStatus = computed(() => {
  const status = currentStatus.value

  if (isArabic.value) {
    switch (status) {
      case 'approved':
        return 'معتمد'
      case 'is rejected':
        return 'مرفوض'
      case 'watting for approval':
        return 'في انتظار الموافقة'
      case 'not yet sent for approval':
        return 'لم يتم الإرسال للموافقة'
      default:
        return status
    }
  } else {
    switch (status) {
      case 'watting for approval':
        return 'Waiting for approval'
      default:
        return status.charAt(0).toUpperCase() + status.slice(1)
    }
  }
})

// Add status class for styling
const statusClass = computed(() => {
  switch (currentStatus.value) {
    case 'approved':
      return 'status-approved'
    case 'is rejected':
      return 'status-rejected'
    case 'watting for approval':
      return 'status-waiting'
    case 'not yet sent for approval':
      return 'status-not-sent'
    default:
      return ''
  }
})

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

  // Track that cost center was the last field changed
  item.lastChangedField = 'cost_center_code'

  // Try to fetch financial data if both codes are available
  fetchPivotFundDetails(item)

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

  // Track that account was the last field changed
  item.lastChangedField = 'account_code'

  // Try to fetch financial data if both codes are available
  fetchPivotFundDetails(item)

  checkForChanges()
}

// Method to validate number input and handle conversion
const validateNumberInput = (item, field) => {
  // Get the input field value
  const inputField = `${field}_input`
  const value = item[inputField]

  // If coming from EnhancementsPage and this is from_center field, set to null
  if (field === 'from_center' && isFromEnhancementsPage.value) {
    item[field] = null
    return
  }

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

    // Handle from_center differently based on source page
    if (isFromEnhancementsPage.value) {
      item.from_center = null
      item.from_center_input = ''
    } else {
      item.from_center_input = item.from_center !== null ? item.from_center.toString() : ''
    }

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
    available_budget: 0,
    from_center: isFromEnhancementsPage.value ? null : 0,
    from_center_input: '',
    to_center: 0,
    to_center_input: '',
    encumbrance: 0,
    actual: 0,
    done: 1,
    financialDataFromApi: false,
    lastChangedField: null, // Track which dropdown was changed last
  }

  transferData.value.push(newRow)

  // Mark that changes have been made
  changesMade.value = true
}

// Helper function for FuturisticPopup notifications
const showNotification = (title, icon = 'success', willNavigate = false) => {
  popupType.value = icon
  popupMessage.value = title
  popupDuration.value = willNavigate ? 1500 : 3000
  pendingNavigation.value = willNavigate
  showPopup.value = true

  // Return a promise that resolves when the notification is complete (for compatibility)
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ dismiss: 'timer' })
    }, popupDuration.value)
  })
}

// Handle popup completion (for navigation)
const handlePopupComplete = () => {
  if (pendingNavigation.value) {
    router.push('/')
    pendingNavigation.value = false
  }
}

// Create transfer function
const createTransfer = async () => {
  try {
    // Only include rows with both cost_center_code and account_code
    const validRows = transferData.value.filter(
      (item) => item.cost_center_code && item.account_code,
    )
    if (!validRows.length) {
      showNotification(
        isArabic.value ? 'لا توجد بيانات صالحة للإرسال' : 'No valid rows to send',
        'error',
      )
      return
    }

    // Prepare data for API
    const dataToSend = validRows.map((item) => {
      const rowData = {
        transaction: transactionId.value,
        cost_center_code: item.cost_center_code,
        cost_center_name: item.cost_center_name,
        account_code: item.account_code,
        account_name: item.account_name,
        approved_budget: parseFloat(item.approved_budget) || 0,
        available_budget: parseFloat(item.available_budget) || 0,
        to_center: parseFloat(item.to_center) || 0,
        encumbrance: parseFloat(item.encumbrance) || 0,
        actual: parseFloat(item.actual) || 0,
        done: 1,
      }

      // Only add from_center if not from EnhancementsPage
      if (!isFromEnhancementsPage.value) {
        console.log('from_center:', item.from_center)
        rowData.from_center = parseFloat(item.from_center) || 0
      }

      return rowData
    })

    // Pass the auth token as second argument to the API call
    await transferService.createTransfer(dataToSend, authStore.token)
    showNotification(isArabic.value ? 'تم إنشاء النقل بنجاح' : 'Transfer created successfully')
    await loadData()

    // After successful save, reset the changesMade flag
    changesMade.value = false

    // Store a new snapshot of the current state
    originalData.value = JSON.parse(JSON.stringify(transferData.value))
  } catch (err) {
    showNotification(isArabic.value ? 'فشل في إنشاء النقل' : 'Failed to create transfer', 'error')
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
    showNotification(
      isArabic.value ? 'يجب أن يكون هناك صف واحد على الأقل' : 'At least one row must exist',
      'warning',
    )
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
    if (response && response.summary) {
      // Store the summary data separately
      apiSummary.value = response.summary

      // Extract status from summary or status object
      if (response.summary.status) {
        currentStatus.value = response.summary.status
      } else if (response.status && response.status.status) {
        currentStatus.value = response.status.status
      } else {
        currentStatus.value = 'not yet sent for approval' // Default
      }

      // Set transferData to the transfers array
      transferData.value = response.transfers
    } else {
      // Fallback to old structure for backward compatibility
      transferData.value = response
      apiSummary.value = null
      currentStatus.value = 'not yet sent for approval' // Default
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
    const notification = await showNotification(
      isArabic.value ? 'تم تقديم الطلب بنجاح' : 'Request submitted successfully',
      'success',
      true,
    )

    // Navigation is now handled by the handlePopupComplete method
  } catch (err) {
    showNotification(isArabic.value ? 'فشل في تقديم الطلب' : 'Failed to submit request', 'error')
  }
}

const reopenRequest = async () => {
  try {
    await transferService.reopenTransferRequest(transactionId.value)
    showNotification(isArabic.value ? 'تم إعادة فتح الطلب بنجاح' : 'Request reopened successfully')
    await loadData()
  } catch (err) {
    showNotification(
      isArabic.value ? 'فشل في إعادة فتح الطلب' : 'Failed to reopen request',
      'error',
    )
  }
}

const generateReport = async () => {
  try {
    const blob = await transferService.generateReport(transactionId.value)

    // Create download link and trigger download
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    // Changed: call setAttribute on the link element
    link.setAttribute('download', `transfer-report-${transactionId.value}.pdf`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)

    showNotification(isArabic.value ? 'تم إنشاء التقرير بنجاح' : 'Report generated successfully')
  } catch (err) {
    showNotification(isArabic.value ? 'فشل في إنشاء التقرير' : 'Failed to generate report', 'error')
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

  // Clean up on unmount
  return () => {
    navigationStore.clearNavigationSource()
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

// File upload modal state
const showFileModal = ref(false)

// Open file upload modal
const uploadFile = () => {
  showFileModal.value = true
}

// Close file upload modal
const closeFileModal = () => {
  showFileModal.value = false
}

// Handle successful file upload
const handleUploadSuccess = () => {
  // Reload data to reflect changes from the uploaded file
  loadData()
}

// Add these new methods after the existing methods in the script setup section
const fetchPivotFundDetails = async (item) => {
  // Only fetch if both cost center and account codes are set
  if (!item.cost_center_code || !item.account_code) {
    return
  }

  try {
    const response = await transferService.getPivotFundDetails(
      item.cost_center_code,
      item.account_code,
    )

    if (response && response.data) {
      // Update financial fields with retrieved data
      const data = response.data

      // Update numeric values
      item.actual = parseFloat(data.actual) || 0
      item.available_budget = parseFloat(data.fund) || 0
      item.approved_budget = parseFloat(data.budget) || 0
      item.encumbrance = parseFloat(data.encumbrance) || 0

      // No longer need to update input fields as they've been removed
      // Set flag to indicate data came from API
      item.financialDataFromApi = true

      // Mark that changes have been made
      checkForChanges()
    }
  } catch (error) {
    // Check if the error is a 404 (Not Found)
    if (error.response && error.response.status === 404) {
      // Alert the user with the specific IDs that failed
      showNotification(
        isArabic.value
          ? `لا توجد بيانات لهذا التحديد. المركز: ${item.cost_center_code}, الحساب: ${item.account_code}`
          : `This doesn't have data for Cost Center: ${item.cost_center_code}, Account: ${item.account_code}`,
        'warning',
      )

      // Reset the last changed selection
      // We determine which one was last changed based on the component's context
      if (item.lastChangedField === 'account_code') {
        item.account_code = ''
        item.account_name = ''
      } else {
        item.cost_center_code = ''
        item.cost_center_name = ''
      }

      // Reset financial values
      item.actual = 0
      item.available_budget = 0
      item.approved_budget = 0
      item.encumbrance = 0
      item.financialDataFromApi = false
    } else {
      console.error('Failed to fetch pivot fund details:', error)
    }
  }
}
</script>

<style src="@/styles/CostCenterTransferRequest.css" scoped></style>

<style>
/* Add to your existing styles */
.readonly-input {
  background-color: #f0f0f0;
  cursor: not-allowed;
  border-color: #ddd;
  color: #666;
}

.dark-mode .readonly-input {
  background-color: #444;
  border-color: #555;
  color: #aaa;
}

/* New style for API data display */
.api-value-display {
  padding: 6px 10px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  background-color: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-weight: 500;
  color: #555;
}

.dark-mode .api-value-display {
  background-color: #333;
  border-color: #444;
  color: #ddd;
}

/* Status indicator styles */
.status-indicator {
  display: inline-block;
  margin-left: 10px;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 500;
  color: white;
}

.status-approved {
  background-color: #28a745;
}

.status-rejected {
  background-color: #dc3545;
}

.status-waiting {
  background-color: #ffc107;
  color: #212529;
}

.status-not-sent {
  background-color: #6c757d;
}

/* Button disabled state */
.btn-disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
