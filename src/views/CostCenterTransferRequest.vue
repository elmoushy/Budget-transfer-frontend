<template>
  <div class="transfer-request-page" :class="{ 'dark-mode': isDarkMode, rtl: isRTL }">
    <div class="page-header">
      <!-- Replaced title with error message when unbalanced -->
      <div v-if="apiSummary && !apiSummary.balanced" class="balance-error-message">
        <span class="error-text">
          {{
            isArabic
              ? 'الميزان غير متوازن. يرجى مراجعة قيم التحويل.'
              : 'Unbalanced transfer. Please review your transfer values.'
          }}
        </span>
      </div>
      <!-- Only show action buttons if not in view-only mode -->
      <div class="header-actions" v-if="!route.query.viewOnly">
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
      <!-- Show status info if in view-only mode -->
      <div class="view-status-info" v-if="route.query.viewOnly === 'true'">
        <span class="status-badge" :class="statusClass">{{ formattedStatus }}</span>
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
              <td class="dropdown-cell">
                <SearchableDropdown
                  v-model="item.account_code"
                  :options="
                    accountEntities.map((account) => ({
                      value: account.account,
                      label: account.alias_default
                        ? `${account.account} - ${account.alias_default}`
                        : account.account,
                    }))
                  "
                  :placeholder="
                    accountEntitiesLoading
                      ? isArabic
                        ? 'جاري التحميل...'
                        : 'Loading...'
                      : isArabic
                        ? 'اختر رقم الحساب'
                        : 'Select Account'
                  "
                  :disabled="!isScreenEditable || accountEntitiesLoading"
                  :is-dark-mode="isDarkMode"
                  :is-rtl="isRTL"
                  :search-placeholder="isArabic ? 'البحث في الحسابات...' : 'Search accounts...'"
                  :no-results-text="isArabic ? 'لا توجد نتائج' : 'No results found'"
                  @change="(value) => updateAccountName(item, { target: { value } })"
                />
              </td>
              <td class="name-display">
                {{ item.cost_center_name || getCostCenterName(item.cost_center_code) || '-' }}
              </td>
              <td class="dropdown-cell">
                <SearchableDropdown
                  v-model="item.cost_center_code"
                  :options="
                    costCenterEntities.map((entity) => ({
                      value: entity.entity,
                      label: entity.alias_default
                        ? `${entity.entity} - ${entity.alias_default}`
                        : entity.entity,
                    }))
                  "
                  :placeholder="
                    costCenterEntitiesLoading
                      ? isArabic
                        ? 'جاري التحميل...'
                        : 'Loading...'
                      : isArabic
                        ? 'اختر رقم البند'
                        : 'Select Cost Center'
                  "
                  :disabled="!isScreenEditable || costCenterEntitiesLoading"
                  :is-dark-mode="isDarkMode"
                  :is-rtl="isRTL"
                  :search-placeholder="
                    isArabic ? 'البحث في مراكز التكلفة...' : 'Search cost centers...'
                  "
                  :no-results-text="isArabic ? 'لا توجد نتائج' : 'No results found'"
                  @change="(value) => updateCostCenterName(item, { target: { value } })"
                />
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
            <tr v-if="!route.query.viewOnly">
              <td colspan="11" class="add-row-cell">
                <button
                  class="btn-modern btn-add-row-modern"
                  @click="addNewRow"
                  :disabled="!isScreenEditable"
                  :class="{ 'btn-disabled': !isScreenEditable }"
                >
                  <span class="btn-icon-modern">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                  </span>
                  <span class="btn-text">{{ isArabic ? 'إضافة صف جديد' : 'Add New Row' }}</span>
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

      <!-- Action buttons - hidden in view-only mode -->
      <div class="action-buttons-modern" v-if="!route.query.viewOnly" :class="{ rtl: isRTL }">
        <button
          class="btn-modern btn-submit"
          @click="submitRequest"
          :disabled="!isSubmitButtonEnabled"
          :class="{ 'btn-disabled': !isSubmitButtonEnabled, rtl: isRTL }"
        >
          <span class="btn-icon-modern" :class="{ rtl: isRTL }">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              :style="{ transform: isRTL ? 'scaleX(-1)' : 'none' }"
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
          </span>
          <span class="btn-text">{{ isArabic ? 'تقديم' : 'Submit' }}</span>
        </button>

        <button
          v-if="!route.query.viewOnly"
          class="btn-modern btn-upload"
          @click="uploadFile"
          :disabled="!isUploadButtonEnabled"
          :class="{ 'btn-disabled': !isUploadButtonEnabled, rtl: isRTL }"
        >
          <span class="btn-icon-modern" :class="{ rtl: isRTL }">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7,10 12,15 17,10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          </span>
          <span class="btn-text">{{ isArabic ? 'رفع ملف المناقلة' : 'Upload Transfer File' }}</span>
        </button>

        <button
          v-if="!route.query.viewOnly"
          class="btn-modern btn-reopen"
          @click="reopenRequest"
          :disabled="!isReopenButtonEnabled"
          :class="{ 'btn-disabled': !isReopenButtonEnabled, rtl: isRTL }"
        >
          <span class="btn-icon-modern" :class="{ rtl: isRTL }">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              :style="{ transform: isRTL ? 'scaleX(-1)' : 'none' }"
            >
              <path d="M1 4v6h6" />
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
            </svg>
          </span>
          <span class="btn-text">{{ isArabic ? 'إعادة فتح الطلب' : 'Re-open Request' }}</span>
        </button>

        <button class="btn-modern btn-report" @click="generateReport" :class="{ rtl: isRTL }">
          <span class="btn-icon-modern" :class="{ rtl: isRTL }">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14,2 14,8 20,8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10,9 9,9 8,9" />
            </svg>
          </span>
          <span class="btn-text">{{ isArabic ? 'تقرير' : 'Report' }}</span>
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

      <!-- Add TransferReport Component -->
      <TransferReport
        :show="showReportModal"
        :transaction-id="transactionId"
        @close="closeReportModal"
      />
    </div>

    <!-- Enhanced Error Details Modal -->
    <Teleport to="body">
      <Transition name="modal-fade" appear>
        <div v-if="showErrorModal" class="enhanced-error-modal-overlay" @click="hideErrorModal">
          <div class="enhanced-error-modal-backdrop"></div>
          <Transition name="modal-slide" appear>
            <div
              class="enhanced-error-modal-container"
              @click.stop
              tabindex="-1"
              role="dialog"
              aria-labelledby="error-modal-title"
              aria-describedby="error-modal-description"
              aria-modal="true"
            >
              <div class="enhanced-error-modal-content">
                <!-- Header with icon and gradient -->
                <div class="enhanced-error-modal-header">
                  <div class="error-header-icon">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      class="error-icon-svg"
                    >
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="15" y1="9" x2="9" y2="15"></line>
                      <line x1="9" y1="9" x2="15" y2="15"></line>
                    </svg>
                  </div>
                  <div class="error-header-content">
                    <h3 class="error-modal-title">
                      {{ isArabic ? 'أخطاء التحقق من صحة البيانات' : 'Data Validation Errors' }}
                    </h3>
                    <p class="error-modal-subtitle">
                      {{
                        isArabic
                          ? `تم العثور على ${currentErrors.length} أخطاء تحتاج إلى إصلاح`
                          : `Found ${currentErrors.length} errors that need to be fixed`
                      }}
                    </p>
                  </div>
                  <button
                    class="enhanced-error-modal-close"
                    @click="hideErrorModal"
                    :aria-label="isArabic ? 'إغلاق' : 'Close'"
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>

                <!-- Enhanced Error List -->
                <div class="enhanced-error-modal-body">
                  <div class="error-summary-stats">
                    <div class="error-stat-item">
                      <span class="error-stat-number">{{ currentErrors.length }}</span>
                      <span class="error-stat-label">
                        {{ isArabic ? 'أخطاء' : 'Errors' }}
                      </span>
                    </div>
                  </div>

                  <div class="error-list-container">
                    <TransitionGroup name="error-item" tag="div" class="enhanced-error-list">
                      <div
                        v-for="(error, errorIndex) in currentErrors"
                        :key="`error-${errorIndex}`"
                        class="enhanced-error-item"
                        :style="{ animationDelay: `${errorIndex * 100}ms` }"
                      >
                        <div class="error-item-icon">
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                          >
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="8" x2="12" y2="12"></line>
                            <line x1="12" y1="16" x2="12.01" y2="16"></line>
                          </svg>
                        </div>
                        <div class="error-item-content">
                          <span class="error-item-text">{{ error }}</span>
                          <div class="error-item-type">
                            {{ getErrorType(error) }}
                          </div>
                        </div>
                      </div>
                    </TransitionGroup>
                  </div>
                </div>

                <!-- Enhanced Footer -->
                <div class="enhanced-error-modal-footer">
                  <div class="error-help-text">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <circle cx="12" cy="12" r="10"></circle>
                      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                      <line x1="12" y1="17" x2="12.01" y2="17"></line>
                    </svg>
                    <span>
                      {{
                        isArabic
                          ? 'قم بإصلاح هذه الأخطاء قبل المتابعة'
                          : 'Please fix these errors before proceeding'
                      }}
                    </span>
                  </div>
                  <button class="enhanced-error-modal-action-btn" @click="hideErrorModal">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                    <span>{{ isArabic ? 'فهمت' : 'Got it' }}</span>
                  </button>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useThemeStore } from '@/stores/themeStore'
import { useAuthStore } from '@/stores/authStore'
import axios from 'axios'
import transferService from '@/services/TransferService'
import FileUploadModal from '@/components/FileUploadModal.vue'
import { useNavigationStore } from '@/stores/navigationStore'
import SearchableDropdown from '@/components/SearchableDropdown.vue'
// Add import for TransferReport
import TransferReport from '@/components/TransferReport.vue'

// Component setup
const route = useRoute()
const router = useRouter()
const themeStore = useThemeStore()
const authStore = useAuthStore()

// Import types
import type {
  TransferItem,
  ApiSummary,
  CostCenterEntity,
  AccountEntity,
} from '@/types/CostCenterTransferRequest'

// Add type definitions for error handling
interface ErrorCategory {
  name: string
  count: number
  icon: string
}

interface AlertState {
  show: boolean
  message: string
  type: string
  timer: number | null
}

interface DropdownChangeEvent {
  target: { value: string }
}

// State variables
const transactionId = ref<number | null>(null)
const transferData = ref<TransferItem[]>([])
const loading = ref(true)
const error = ref(false)
const activeTooltipIndex = ref<number | null>(null)

// Types are now imported
const costCenterEntities = ref<CostCenterEntity[]>([])
const costCenterEntitiesLoading = ref(false)
const costCenterEntitiesError = ref(false)

// Add new state for account entities
const accountEntities = ref<AccountEntity[]>([])
const accountEntitiesLoading = ref(false)
const accountEntitiesError = ref(false)

// New ref to store the original data snapshot
const originalData = ref<TransferItem[]>([])

// Add a new ref to track if changes have been made
const changesMade = ref(false)

// Add a new ref for the summary data from the API
const apiSummary = ref<ApiSummary | null>(null)

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
  // If viewOnly parameter is present in the URL, make the screen read-only
  if (route.query.viewOnly === 'true') {
    return false
  }
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
  return (
    currentStatus.value === 'is rejected' || currentStatus.value === 'not yet sent for approval'
  )
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
    toSum: data.reduce((sum, item) => sum + (parseFloat(String(item.to_center || 0)) || 0), 0),
    fromSum: data.reduce((sum, item) => sum + (parseFloat(String(item.from_center || 0)) || 0), 0),
    encumbranceSum: data.reduce(
      (sum, item) => sum + (parseFloat(String(item.encumbrance || 0)) || 0),
      0,
    ),
    availableBudgetSum: data.reduce(
      (sum, item) => sum + (parseFloat(String(item.available_budget || 0)) || 0),
      0,
    ),
    actualSum: data.reduce((sum, item) => sum + (parseFloat(String(item.actual || 0)) || 0), 0),
    approvedBudgetSum: data.reduce(
      (sum, item) => sum + (parseFloat(String(item.approved_budget || 0)) || 0),
      0,
    ),
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

const getCostCenterName = (code: string | undefined) => {
  if (!code) return ''
  const entity = costCenterEntities.value.find((e) => e.entity === code)
  return entity ? entity.alias_default : ''
}

const updateCostCenterName = (item: TransferItem, event: string | DropdownChangeEvent) => {
  // Handle both direct value from SearchableDropdown and event from select
  const code = typeof event === 'string' ? event : event.target.value
  item.cost_center_code = code
  item.cost_center_name = getCostCenterName(code)

  // Track that cost center was the last field changed
  item.lastChangedField = 'cost_center_code'

  // Try to fetch financial data if both codes are available
  fetchPivotFundDetails(item)

  checkForChanges()
}

const getAccountName = (code: string | undefined) => {
  if (!code) return ''
  const account = accountEntities.value.find((a) => a.account === code)
  return account ? account.alias_default : ''
}

const updateAccountName = (item: TransferItem, event: string | DropdownChangeEvent) => {
  // Handle both direct value from SearchableDropdown and event from select
  const code = typeof event === 'string' ? event : event.target.value
  item.account_code = code
  item.account_name = getAccountName(code)

  // Track that account was the last field changed
  item.lastChangedField = 'account_code'

  // Try to fetch financial data if both codes are available
  fetchPivotFundDetails(item)

  checkForChanges()
}

// Method to validate number input and handle conversion
const validateNumberInput = (item: TransferItem, field: string) => {
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
  const sanitizedValue = (value || '')
    .toString()
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
    item.to_center_input =
      item.to_center !== null && item.to_center !== undefined ? item.to_center.toString() : ''

    // Handle from_center differently based on source page
    if (isFromEnhancementsPage.value) {
      item.from_center = null
      item.from_center_input = ''
    } else {
      item.from_center_input =
        item.from_center !== null && item.from_center !== undefined
          ? item.from_center.toString()
          : ''
    }

    item.encumbrance_input =
      item.encumbrance !== null && item.encumbrance !== undefined ? item.encumbrance.toString() : ''
    item.available_budget_input =
      item.available_budget !== null && item.available_budget !== undefined
        ? item.available_budget.toString()
        : ''
    item.actual_input =
      item.actual !== null && item.actual !== undefined ? item.actual.toString() : ''
    item.approved_budget_input =
      item.approved_budget !== null && item.approved_budget !== undefined
        ? item.approved_budget.toString()
        : ''
  })
}

// Add new row function
const addNewRow = () => {
  const newRow = {
    transaction: transactionId.value || undefined,
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

// Helper function for safe number conversion
const toSafeNumber = (value: unknown): number => {
  if (value === null || value === undefined) return 0
  if (typeof value === 'number') return value
  const parsed = parseFloat(String(value))
  return isNaN(parsed) ? 0 : parsed
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
    const dataToSend = validRows.map((item) => {
      const rowData: any = {
        transaction: transactionId.value,
        cost_center_code: item.cost_center_code,
        cost_center_name: item.cost_center_name,
        account_code: item.account_code,
        account_name: item.account_name,
        approved_budget: toSafeNumber(item.approved_budget),
        available_budget: toSafeNumber(item.available_budget),
        to_center: toSafeNumber(item.to_center),
        encumbrance: toSafeNumber(item.encumbrance),
        actual: toSafeNumber(item.actual),
        done: 1,
      }

      // Only add from_center if not from EnhancementsPage
      if (!isFromEnhancementsPage.value) {
        console.log('from_center:', item.from_center)
        rowData.from_center = toSafeNumber(item.from_center)
      }

      return rowData
    })

    // Pass the auth token as second argument to the API call
    await transferService.createTransfer(dataToSend)

    // Create styled alert message with emoji and formatting
    const successPrefix = '✅ '
    const successMessage = isArabic.value ? 'تم إنشاء النقل بنجاح' : 'Transfer created successfully'
    alert(successPrefix + successMessage)

    await loadData()

    // After successful save, reset the changesMade flag
    changesMade.value = false

    // Store a new snapshot of the current state
    originalData.value = JSON.parse(JSON.stringify(transferData.value))
  } catch (err: unknown) {
    // Enhanced error alert with emoji
    const errorPrefix = '❌ '
    const error = err as any
    const errorMessage = isArabic.value
      ? 'فشل في إنشاء النقل: ' + (error?.response?.data?.message || error?.message || '')
      : 'Failed to create transfer: ' + (error?.response?.data?.message || error?.message || '')
    alert(errorPrefix + errorMessage)
    console.error('Error creating transfer:', err)
  }
}

// Delete row function
const deleteRow = (index: number) => {
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

    // Find corresponding original row with proper typing
    const original = originalData.value.find(
      (o: TransferItem) => o.transfer_id === current.transfer_id,
    )
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
    ] as const
    for (const field of numericFields) {
      const originalValue = parseFloat(String(original[field] || 0))
      const currentValue = parseFloat(String(current[field] || 0))
      if (originalValue !== currentValue) {
        changesMade.value = true
        return
      }
    }

    // Check string fields for changes
    const stringFields = [
      'cost_center_code',
      'cost_center_name',
      'account_code',
      'account_name',
    ] as const
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
    const response = await transferService.getTransferDetails(transactionId.value!)

    // Since ApiResponse extends T, we can access properties directly
    if (response && (response as { summary?: ApiSummary }).summary) {
      // Store the summary data separately
      const responseWithSummary = response as { summary: ApiSummary; transfers?: TransferItem[] }
      apiSummary.value = responseWithSummary.summary

      // Extract status from summary
      const summary = responseWithSummary.summary
      if (summary.status) {
        currentStatus.value = summary.status
      } else {
        currentStatus.value = 'not yet sent for approval' // Default
      }

      // Set transferData to the transfers array
      transferData.value = responseWithSummary.transfers || []
    } else {
      // Fallback to treating response as transfers array
      transferData.value = Array.isArray(response) ? response : []
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
const showTooltip = (index: number) => {
  activeTooltipIndex.value = index
}

// Method to hide tooltip
const hideTooltip = () => {
  activeTooltipIndex.value = null
}

const formatNumber = (value: number | string | null | undefined): string | null => {
  if (value === null || value === undefined) return null
  return new Intl.NumberFormat(isArabic.value ? 'ar-SA' : 'en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value))
}

const alertState = ref<AlertState>({
  show: false,
  message: '',
  type: 'success', // 'success' or 'error'
  timer: null,
})

const showAlert = (message: string, type = 'success') => {
  // Clear any existing timer
  if (alertState.value.timer) {
    clearTimeout(alertState.value.timer)
  }

  // Set alert properties
  alertState.value.message = message
  alertState.value.type = type
  alertState.value.show = true

  // Auto-hide after 4 seconds
  alertState.value.timer = setTimeout(() => {
    alertState.value.show = false
  }, 4000)
}

const submitRequest = async () => {
  try {
    await transferService.submitTransferRequest(transactionId.value!)
    showAlert(isArabic.value ? 'تم تقديم الطلب بنجاح' : 'Request submitted successfully')
    // Delay navigation to allow alert to be seen
    setTimeout(() => {
      router.push('/')
    }, 1500)
  } catch {
    showAlert(isArabic.value ? 'فشل في تقديم الطلب' : 'Failed to submit request', 'error')
  }
}

const reopenRequest = async () => {
  try {
    await transferService.reopenTransferRequest(transactionId.value!)
    showAlert(isArabic.value ? 'تم إعادة فتح الطلب بنجاح' : 'Request reopened successfully')
    await loadData()
  } catch {
    showAlert(isArabic.value ? 'فشل في إعادة فتح الطلب' : 'Failed to reopen request', 'error')
  }
}

// Update generateReport method to show the modal instead of making API call
const generateReport = () => {
  showReportModal.value = true
}

// Add method to close the report modal
const closeReportModal = () => {
  showReportModal.value = false
}

// Watch for route changes
watch(
  () => route.params.id,
  (newId) => {
    if (newId) {
      const id = Array.isArray(newId) ? newId[0] : newId
      transactionId.value = parseInt(id, 10)
      loadData()
    }
  },
  { immediate: true },
)

// Initial data load
onMounted(() => {
  const id = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id
  transactionId.value = parseInt(id, 10)
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
const currentErrors = ref<string[]>([])

// Method to show error details in modal
const showErrorDetails = (errors: string[]) => {
  currentErrors.value = errors
  showErrorModal.value = true
  // Add keyboard navigation
  document.addEventListener('keydown', handleErrorModalKeydown)
  // Focus the modal for accessibility
  nextTick(() => {
    const modal = document.querySelector('.enhanced-error-modal-container') as HTMLElement
    if (modal) {
      modal.focus()
    }
  })
}

// Enhanced error modal with keyboard navigation and accessibility
const hideErrorModal = () => {
  showErrorModal.value = false
  currentErrors.value = []
  // Remove event listeners
  document.removeEventListener('keydown', handleErrorModalKeydown)
}

const handleErrorModalKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    hideErrorModal()
  } else if (
    event.key === 'Enter' &&
    (event.target as HTMLElement)?.classList.contains('enhanced-error-modal-action-btn')
  ) {
    hideErrorModal()
  }
}

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

// Enhanced error modal methods
const getErrorType = (error: string): string => {
  if (error.toLowerCase().includes('required') || error.toLowerCase().includes('مطلوب')) {
    return isArabic.value ? 'حقل مطلوب' : 'Required Field'
  } else if (error.toLowerCase().includes('invalid') || error.toLowerCase().includes('غير صحيح')) {
    return isArabic.value ? 'قيمة غير صحيحة' : 'Invalid Value'
  } else if (error.toLowerCase().includes('format') || error.toLowerCase().includes('تنسيق')) {
    return isArabic.value ? 'خطأ في التنسيق' : 'Format Error'
  } else if (error.toLowerCase().includes('budget') || error.toLowerCase().includes('ميزانية')) {
    return isArabic.value ? 'خطأ في الميزانية' : 'Budget Error'
  }
  return isArabic.value ? 'خطأ عام' : 'General Error'
}

const errorCategories = computed((): ErrorCategory[] => {
  const categories: Record<string, ErrorCategory> = {}

  currentErrors.value.forEach((error) => {
    const type = getErrorType(error)
    if (!categories[type]) {
      categories[type] = { name: type, count: 0, icon: '⚠️' }
    }
    categories[type].count++
  })

  // Set appropriate icons
  Object.keys(categories).forEach((key) => {
    const category = categories[key]
    if (key.includes('Required') || key.includes('مطلوب')) {
      category.icon = '📋'
    } else if (key.includes('Invalid') || key.includes('غير صحيح')) {
      category.icon = '❌'
    } else if (key.includes('Format') || key.includes('تنسيق')) {
      category.icon = '📝'
    } else if (key.includes('Budget') || key.includes('ميزانية')) {
      category.icon = '💰'
    }
  })

  return Object.values(categories)
})

// Add these new methods after the existing methods in the script setup section
const fetchPivotFundDetails = async (item: TransferItem) => {
  // Only fetch if both cost center and account codes are set
  if (!item.cost_center_code || !item.account_code) {
    return
  }

  try {
    const response = await transferService.getPivotFundDetails(
      item.cost_center_code,
      item.account_code,
    )

    // Check if the response contains "Pivot fund not found" message
    if (response && (response as { message?: string }).message === 'Pivot fund not found.') {
      // Reset financial values but keep the cost center and account selections
      item.actual = 0
      item.available_budget = 0
      item.approved_budget = 0
      item.encumbrance = 0
      item.financialDataFromApi = false

      // Alert the user about the missing data
      alert(
        isArabic.value
          ? `لا توجد بيانات مالية لهذا التحديد. المركز: ${item.cost_center_code}, الحساب: ${item.account_code}`
          : `No financial data found for Cost Center: ${item.cost_center_code}, Account: ${item.account_code}`,
      )

      // Mark that changes have been made
      checkForChanges()
    } else if (response && (response as { data?: Record<string, unknown> }).data) {
      // Update financial fields with retrieved data
      const data = (response as { data: Record<string, unknown> }).data

      // Update numeric values using safe conversion mapping API fields to component fields
      item.actual = toSafeNumber(data.actual)
      item.available_budget = toSafeNumber(data.fund) // API returns 'fund' for available budget
      item.approved_budget = toSafeNumber(data.budget) // API returns 'budget' for approved budget
      item.encumbrance = toSafeNumber(data.encumbrance)

      // Set flag to indicate data came from API
      item.financialDataFromApi = true

      // Mark that changes have been made
      checkForChanges()
    }
  } catch (error: unknown) {
    // Check if the error is a 404 (Not Found)
    const err = error as { response?: { status?: number } }
    if (err.response && err.response.status === 404) {
      // Alert the user with the specific IDs that failed
      alert(
        isArabic.value
          ? `لا توجد بيانات لهذا التحديد. المركز: ${item.cost_center_code}, الحساب: ${item.account_code}`
          : `This doesn't have data for Cost Center: ${item.cost_center_code}, Account: ${item.account_code}`,
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

// Add state variable to control report modal visibility
const showReportModal = ref(false)
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

/* Remove red borders/outlines from buttons */
.btn-modern,
.btn-header-create,
.btn-retry,
.btn-delete-row,
.btn-add-row-modern {
  border: none !important;
  outline: none !important;
  box-shadow: none !important;
}

.btn-modern:focus,
.btn-header-create:focus,
.btn-retry:focus,
.btn-delete-row:focus,
.btn-add-row-modern:focus {
  border: none !important;
  outline: none !important;
  box-shadow: none !important;
}

.btn-modern:active,
.btn-header-create:active,
.btn-retry:active,
.btn-delete-row:active,
.btn-add-row-modern:active {
  border: none !important;
  outline: none !important;
  box-shadow: none !important;
}

/* Remove any border-right specifically */
.btn-modern::after,
.btn-header-create::after,
.btn-retry::after,
.btn-delete-row::after,
.btn-add-row-modern::after {
  border-right: none !important;
}

/* Comprehensive removal of pseudo-element red lines */
.btn-modern::before,
.btn-modern::after,
.btn-header-create::before,
.btn-header-create::after,
.btn-retry::before,
.btn-retry::after,
.btn-delete-row::before,
.btn-delete-row::after,
.btn-add-row-modern::before,
.btn-add-row-modern::after {
  content: none !important;
  border: none !important;
  background: none !important;
}

/* Force remove all borders from btn-icon-modern */
.btn-icon-modern {
  border: none !important;
  outline: none !important;
  box-shadow: none !important;
  border-top: none !important;
  border-right: none !important;
  border-bottom: none !important;
  border-left: none !important;
  border-inline: none !important;
  border-block: none !important;
  border-inline-start: none !important;
  border-inline-end: none !important;
  border-block-start: none !important;
  border-block-end: none !important;
}

.btn-icon-modern:focus,
.btn-icon-modern:active,
.btn-icon-modern:hover {
  border: none !important;
  outline: none !important;
  box-shadow: none !important;
  border-top: none !important;
  border-right: none !important;
  border-bottom: none !important;
  border-left: none !important;
  border-inline: none !important;
  border-block: none !important;
  border-inline-start: none !important;
  border-inline-end: none !important;
  border-block-start: none !important;
  border-block-end: none !important;
}

.btn-icon-modern::before,
.btn-icon-modern::after {
  content: none !important;
  border: none !important;
  background: none !important;
  border-top: none !important;
  border-right: none !important;
  border-bottom: none !important;
  border-left: none !important;
}

/* Remove any logical border on RTL */
.rtl .btn-modern,
.rtl .btn-header-create,
.rtl .btn-retry,
.rtl .btn-delete-row,
.rtl .btn-add-row-modern {
  border-inline-start: none !important;
}

/* Force remove all borders from action-buttons-modern */
.action-buttons-modern {
  border: none !important;
  outline: none !important;
  box-shadow: none !important;
  border-top: none !important;
  border-right: none !important;
  border-bottom: none !important;
  border-left: none !important;
  border-inline: none !important;
  border-block: none !important;
  border-inline-start: none !important;
  border-inline-end: none !important;
  border-block-start: none !important;
  border-block-end: none !important;
}

.action-buttons-modern:focus,
.action-buttons-modern:active,
.action-buttons-modern:hover {
  border: none !important;
  outline: none !important;
  box-shadow: none !important;
  border-top: none !important;
  border-right: none !important;
  border-bottom: none !important;
  border-left: none !important;
  border-inline: none !important;
  border-block: none !important;
  border-inline-start: none !important;
  border-inline-end: none !important;
  border-block-start: none !important;
  border-block-end: none !important;
}

.action-buttons-modern::before,
.action-buttons-modern::after {
  content: none !important;
  border: none !important;
  background: none !important;
  border-top: none !important;
  border-right: none !important;
  border-bottom: none !important;
  border-left: none !important;
}

/* RTL specific border removal for action-buttons-modern */
.rtl .action-buttons-modern {
  border-inline-start: none !important;
  border-inline-end: none !important;
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

/* SearchableDropdown custom styling for this component */
.searchable-dropdown {
  width: 100%;
}

/* Style for cells that contain dropdowns */
.dropdown-cell {
  min-width: 200px;
  max-width: 280px;
}

.searchable-dropdown .dropdown-trigger {
  padding: 8px 12px;
  border-radius: 6px;
  min-height: 38px;
  font-size: 14px;
}

/* Match dropdown style with table inputs */
.searchable-dropdown .value-text,
.searchable-dropdown .placeholder-text {
  font-size: 14px;
}

/* Ensure dropdown panels have proper z-index to appear above the table */
.dropdown-panel-portal {
  z-index: 999999 !important;
}

/* Improve dropdown panel styling */
.searchable-dropdown .dropdown-panel-portal .options-container {
  max-height: 250px;
}

/* Improve search input styling */
.searchable-dropdown .search-input {
  font-size: 14px;
}

.dark-mode .searchable-dropdown {
  --text-color: #f9fafb;
  --placeholder-color: #9ca3af;
  --border-color: #4b5563;
  --background-color: #374151;
  --hover-background: #4b5563;
}

/* Maintain consistent dropdown panel width */
.dropdown-panel-portal {
  min-width: 280px;
}

/* Ensure the dropdown panel is visible above other elements */
.dropdown-overlay {
  z-index: 999998;
}

/* Style for disabled dropdowns to match other inputs */
.searchable-dropdown.disabled .dropdown-trigger {
  background-color: #f0f0f0;
  cursor: not-allowed;
  border-color: #ddd;
  color: #666;
  opacity: 0.6;
}

.dark-mode .searchable-dropdown.disabled .dropdown-trigger {
  background-color: #444;
  border-color: #555;
  color: #aaa;
}

/* Specific button styles */
.btn-submit {
  background-color: #4caf50;
  color: white;
}

.btn-submit:hover:not(:disabled) {
  background-color: #45a049;
  transform: translateY(-2px);
}

/* View-only mode status display */
.view-status-info {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-right: 1rem;
}

.view-status-info .status-badge {
  font-size: 0.9rem;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  display: inline-block;
}

/* End of view-only styles */

.btn-upload {
  background-color: #2196f3;
  color: white;
}

.btn-upload:hover:not(:disabled) {
  background-color: #1e88e5;
  transform: translateY(-2px);
}

.btn-reopen {
  background-color: #ff9800;
  color: white;
}

.btn-reopen:hover:not(:disabled) {
  background-color: #fb8c00;
  transform: translateY(-2px);
}

.btn-report {
  background-color: #673ab7;
  color: white;
}

.btn-report:hover:not(:disabled) {
  background-color: #5e35b1;
  transform: translateY(-2px);
}

/* RTL styles */
.rtl {
  direction: rtl;
  text-align: right;
}

.rtl .btn-icon-modern {
  margin-right: 8px;
  margin-left: 0;
}

.rtl .btn-text {
  margin-right: 0;
  margin-left: 8px;
}

.rtl .action-buttons-modern {
  display: flex;
  flex-direction: row-reverse;
  align-items: center;
  justify-content: flex-start;
}

.rtl .dropdown-cell {
  text-align: right;
}

.rtl .number-cell {
  text-align: left;
}

.rtl .transfer-table {
  direction: rtl;
}

.rtl .transfer-table th,
.rtl .transfer-table td {
  text-align: right;
}

.rtl .transfer-table .action-column {
  text-align: center;
}

/* End RTL styles */
</style>
