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
          <span class="btn-icon" v-if="!isSaving">✓</span>
          <span class="btn-icon loading-spinner" v-if="isSaving"></span>
          {{ isSaving ? (isArabic ? 'جاري الحفظ...' : 'Saving...') : isArabic ? 'حفظ' : 'Save' }}
        </button>
      </div>
      <!-- Show status info if in view-only mode -->
      <div class="view-status-info" v-if="route.query.viewOnly === 'true'">
        <span class="view-only-badge">{{ isArabic ? 'عرض فقط' : 'View Only' }}</span>
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
              <th class="action-column" v-if="!route.query.viewOnly"></th>
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
              v-for="(item, index) in currentData"
              :key="(item.transfer_id || item.contract_id || index) as string"
              class="data-row"
              :class="{
                'row-error': item.validation_errors && item.validation_errors.length > 0,
                'row-valid': !item.validation_errors || item.validation_errors.length === 0,
              }"
            >
              <td class="action-column" v-if="!route.query.viewOnly">
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
                <div v-if="route.query.viewOnly === 'true'" class="name-display">
                  {{ formatNumber(item.to_center_input) || '-' }}
                </div>
                <input
                  v-else
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
                <div v-if="route.query.viewOnly === 'true'" class="name-display">
                  {{ formatNumber(item.from_center_input) || '-' }}
                </div>
                <input
                  v-else
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
                <div v-if="route.query.viewOnly === 'true'" class="name-display">
                  {{ item.account_code || '-' }}
                </div>
                <SearchableDropdown
                  v-else
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
                />
              </td>
              <td class="name-display">
                {{ item.cost_center_name || getCostCenterName(item.cost_center_code) || '-' }}
              </td>
              <td class="dropdown-cell">
                <div v-if="route.query.viewOnly === 'true'" class="name-display">
                  {{ item.cost_center_code || '-' }}
                </div>
                <SearchableDropdown
                  v-else
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
                />
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="summary-row">
              <td v-if="!route.query.viewOnly"></td>
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
        {{ isArabic ? `المجموع ${currentData.length}` : `Total ${currentData.length}` }}
      </div>

      <!-- Action buttons - hidden in view-only mode -->
      <div class="action-buttons-modern" v-if="!route.query.viewOnly" :class="{ rtl: isRTL }">
        <button
          class="btn-modern btn-submit"
          @click="submitRequest"
          :disabled="!isSubmitButtonEnabled"
          :class="{ 'btn-disabled': !isSubmitButtonEnabled, rtl: isRTL }"
          :title="
            !isSubmitButtonEnabled
              ? !currentData || currentData.length === 0
                ? isArabic
                  ? 'لا توجد بيانات للتقديم'
                  : 'No data to submit'
                : changesMade
                  ? isArabic
                    ? 'يجب حفظ التغييرات أولاً'
                    : 'Please save changes first'
                  : isArabic
                    ? 'غير متاح للتقديم'
                    : 'Not available for submission'
              : isArabic
                ? 'تقديم الطلب'
                : 'Submit request'
          "
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
          :title="
            !isReopenButtonEnabled && changesMade
              ? isArabic
                ? 'يجب حفظ التغييرات أولاً'
                : 'Please save changes first'
              : isArabic
                ? 'إعادة فتح الطلب'
                : 'Reopen request'
          "
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

    <!-- Toast (auto-dismiss) -->
    <Teleport to="body">
      <transition name="fade">
        <div v-if="toast.show" class="toast" :class="`toast--${toast.type}`" role="alert">
          {{ toast.message }}
        </div>
      </transition>
    </Teleport>

    <!-- Dialog/Popup (needs confirm or timed) -->
    <FuturisticPopup
      v-model:show="dialog.show"
      :type="dialog.type"
      :title="dialog.title"
      :message="dialog.message"
      :timer="dialog.timer"
      :showConfirmButton="dialog.needConfirm"
      :confirmButtonText="isArabic ? 'موافق' : 'OK'"
      @confirm="handleDialogConfirm"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useThemeStore } from '@/stores/themeStore'
import { useAuthStore } from '@/stores/authStore'
import axios from 'axios'
import transferService from '@/services/TransferService'
import contractService from '@/services/contractService'
import FileUploadModal from '@/components/FileUploadModal.vue'
import { useNavigationStore } from '@/stores/navigationStore'
import SearchableDropdown from '@/components/SearchableDropdown.vue'
// Add import for TransferReport
import TransferReport from '@/components/TransferReport.vue'
import FuturisticPopup from '@/components/FuturisticPopup.vue'

// Extended contract service interface to include missing methods
interface ContractResponse {
  summary?:
    | ApiSummary
    | {
        status?: string
        [key: string]: unknown
      }
  status?: {
    status?: string
    [key: string]: unknown
  }
  transfers?: TransferItem[]
  [key: string]: unknown
}

interface ExtendedContractService {
  getContractDetails: (id: number) => Promise<ContractResponse>
  createContract: (data: unknown, token: string) => Promise<unknown>
  submitContractRequest: (id: number) => Promise<unknown>
  reopenContractRequest: (id: number) => Promise<unknown>
  generateReport: (id: number) => Promise<Blob>
}

const extendedContractService = contractService as unknown as ExtendedContractService

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
interface TransferRowData {
  transaction: string | number | null
  cost_center_code: string | undefined
  cost_center_name: string | undefined
  account_code: string | undefined
  account_name: string | undefined
  approved_budget: number
  available_budget: number
  to_center: number
  encumbrance: number
  actual: number
  done: number
  from_center?: number
  [key: string]: unknown // Index signature for compatibility
}

// State variables
const transactionId = ref<number | null>(null)
const transferData = ref<TransferItem[]>([])
const contractData = ref<TransferItem[]>([]) // Add contract data for contract mode
const loading = ref(true)
const error = ref(false)

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

// Add loading state for save button
const isSaving = ref(false)

// Add a computed property to check if navigation is from EnhancementsPage
const navigationStore = useNavigationStore()
const isFromEnhancementsPage = computed(() => {
  // Check both the navigation store and URL query parameter
  return route.query.source === 'EnhancementsPage'
})

// Add computed property to determine if we're in contract mode
const isContractMode = computed(() => {
  return route.path.startsWith('/contracts/')
})

// Get the appropriate data array based on mode
const currentData = computed(() => {
  return isContractMode.value ? contractData.value : transferData.value
})

// Summary data computed property - works with both modes
const summaryData = computed(() => {
  const data = currentData.value
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

// Check for validation errors - works with both modes
const hasValidationErrors = computed(() => {
  return currentData.value.some(
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
    changesMade.value &&
    !isSaving.value
  )
})

const isSubmitButtonEnabled = computed(() => {
  // Disable if there are no rows
  if (!currentData.value || currentData.value.length === 0) {
    return false
  }
  // Disable if there are validation errors or the balance is false
  if ((apiSummary.value && apiSummary.value.balanced === false) || hasValidationErrors.value) {
    return false
  }
  // Disable if there are unsaved changes - user must save first
  if (changesMade.value) {
    return false
  }
  return currentStatus.value === 'not yet sent for approval'
})

const isReopenButtonEnabled = computed(() => {
  // Disable if there are validation errors or the balance is false
  if ((apiSummary.value && apiSummary.value.balanced === false) || hasValidationErrors.value) {
    return false
  }
  // Disable if there are unsaved changes - user must save first
  if (changesMade.value) {
    return false
  }
  return currentStatus.value === 'is rejected'
})

const isUploadButtonEnabled = computed(() => {
  return (
    currentStatus.value === 'is rejected' || currentStatus.value === 'not yet sent for approval'
  )
})

// Theme and language
const isDarkMode = computed(() => themeStore.darkMode)
const isArabic = computed(() => themeStore.language === 'ar')
const isRTL = computed(() => themeStore.language === 'ar')

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

const getAccountName = (code: string | undefined) => {
  if (!code) return ''
  const account = accountEntities.value.find((a) => a.account === code)
  return account ? account.alias_default : ''
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

  if (isContractMode.value) {
    contractData.value.push(newRow)
  } else {
    transferData.value.push(newRow)
  }

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
  if (isSaving.value) return // Prevent multiple clicks

  isSaving.value = true // Set loading state

  try {
    // Get the appropriate data array
    const dataArray = isContractMode.value ? contractData.value : transferData.value

    // Only include rows with both cost_center_code and account_code
    const validRows = dataArray.filter((item) => item.cost_center_code && item.account_code)
    if (!validRows.length) {
      if (isContractMode.value) {
        await showDialog(
          isArabic.value ? 'لا توجد بيانات صالحة للإرسال' : 'No valid rows to send',
          'warning',
        )
      } else {
        showToast(
          isArabic.value ? 'لا توجد بيانات صالحة للإرسال' : 'No valid rows to send',
          'warning',
        )
      }
      return
    }

    // Prepare data for API
    const dataToSend = validRows.map((item) => {
      const rowData: TransferRowData = {
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

    if (isContractMode.value) {
      // Pass the auth token as second argument to the API call
      await extendedContractService.createContract(dataToSend, authStore.token!)

      await showDialog(
        isArabic.value ? 'تم إنشاء العقد بنجاح' : 'Contract created successfully',
        'success',
        { timer: 3000 },
      )
    } else {
      // For transfer mode, call the specific endpoint you mentioned
      const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'
      await axios.post(`${BASE_URL}/api/adjd-transfers/create/`, dataToSend, {
        headers: {
          Authorization: `Bearer ${authStore.token}`,
          'Content-Type': 'application/json',
        },
      })

      showToast(
        isArabic.value ? 'تم إنشاء النقل بنجاح' : 'Transfer created successfully',
        'success',
      )
    }

    await loadData()

    // After successful save, reset the changesMade flag
    changesMade.value = false

    // Store a new snapshot of the current state
    if (isContractMode.value) {
      originalData.value = JSON.parse(JSON.stringify(contractData.value))
    } else {
      originalData.value = JSON.parse(JSON.stringify(transferData.value))
    }
  } catch (err: unknown) {
    // Enhanced error alert with emoji
    const error = err as Error & { response?: { data?: { message?: string } } }
    const errorMessage = isArabic.value
      ? 'فشل في إنشاء النقل: ' + (error?.response?.data?.message || error?.message || '')
      : 'Failed to create transfer: ' + (error?.response?.data?.message || error?.message || '')

    if (isContractMode.value) {
      await showDialog(errorMessage, 'error')
    } else {
      showToast(errorMessage, 'error')
    }
    console.error('Error creating transfer:', err)
  } finally {
    isSaving.value = false // Reset loading state
  }
}

// Delete row function
const deleteRow = (index: number) => {
  const dataArray = isContractMode.value ? contractData.value : transferData.value

  if (dataArray.length > 1) {
    // Just remove from local array without API call
    dataArray.splice(index, 1)

    // Mark that changes have been made
    changesMade.value = true
  } else {
    if (isContractMode.value) {
      showDialog(
        isArabic.value ? 'يجب أن يكون هناك صف واحد على الأقل' : 'At least one row must exist',
        'warning',
      )
    } else {
      showToast(
        isArabic.value ? 'يجب أن يكون هناك صف واحد على الأقل' : 'At least one row must exist',
        'warning',
      )
    }
  }
}

// Function to check for changes in the data
const checkForChanges = () => {
  // Get the appropriate data array
  const dataArray = isContractMode.value ? contractData.value : transferData.value

  // If there's no original data yet, we can't compare
  if (!originalData.value || originalData.value.length === 0) {
    changesMade.value = dataArray.length > 0
    return
  }

  // If row counts differ, changes were made
  if (originalData.value.length !== dataArray.length) {
    changesMade.value = true
    return
  }

  // Check if any row data has changed
  for (let i = 0; i < dataArray.length; i++) {
    const current = dataArray[i]
    // Check for different ID fields based on mode
    const idField = isContractMode.value ? 'contract_id' : 'transfer_id'

    // If this is a new row without an ID, mark as changed
    if (!current[idField]) {
      changesMade.value = true
      return
    }

    // Find corresponding original row with proper typing
    const original = originalData.value.find((o: TransferItem) => o[idField] === current[idField])
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
  () => [transferData.value, contractData.value],
  () => {
    checkForChanges()
  },
  { deep: true },
)

// Add watchers for dropdown changes to update related fields
watch(
  () => currentData.value.map((item) => item.account_code),
  (newCodes, oldCodes) => {
    if (newCodes && oldCodes) {
      newCodes.forEach((newCode, index) => {
        if (newCode !== oldCodes[index] && newCode) {
          const item = currentData.value[index]
          if (item) {
            item.account_name = getAccountName(newCode)
            item.lastChangedField = 'account_code'
            fetchPivotFundDetails(item)
          }
        }
      })
    }
  },
  { deep: true },
)

watch(
  () => currentData.value.map((item) => item.cost_center_code),
  (newCodes, oldCodes) => {
    if (newCodes && oldCodes) {
      newCodes.forEach((newCode, index) => {
        if (newCode !== oldCodes[index] && newCode) {
          const item = currentData.value[index]
          if (item) {
            item.cost_center_name = getCostCenterName(newCode)
            item.lastChangedField = 'cost_center_code'
            fetchPivotFundDetails(item)
          }
        }
      })
    }
  },
  { deep: true },
)

// Existing methods
const loadData = async () => {
  loading.value = true
  error.value = false

  try {
    let response

    if (isContractMode.value) {
      // Load contract data
      const contractResponse = await extendedContractService.getContractDetails(
        transactionId.value!,
      )

      // Check if the response has the new structure with summary and contracts
      if (contractResponse && contractResponse.summary) {
        // Store the summary data separately
        apiSummary.value = contractResponse.summary as ApiSummary

        // Extract status from summary or status object
        if (contractResponse.summary.status) {
          currentStatus.value = contractResponse.summary.status
        } else if (contractResponse.status && contractResponse.status.status) {
          currentStatus.value = contractResponse.status.status
        } else {
          currentStatus.value = 'not yet sent for approval' // Default
        }

        // Set contractData to the transfers array
        contractData.value = contractResponse.transfers || []
      } else {
        // Fallback to old structure for backward compatibility
        contractData.value = contractResponse as unknown as TransferItem[]
        apiSummary.value = null
        currentStatus.value = 'not yet sent for approval' // Default
      }

      // Initialize input fields for contracts
      contractData.value.forEach((item) => {
        item.to_center_input =
          item.to_center !== null && item.to_center !== undefined ? item.to_center.toString() : ''
        item.from_center_input =
          item.from_center !== null && item.from_center !== undefined
            ? item.from_center.toString()
            : ''
        item.encumbrance_input =
          item.encumbrance !== null && item.encumbrance !== undefined
            ? item.encumbrance.toString()
            : ''
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

      // Store a deep copy of the original data for future comparisons
      originalData.value = JSON.parse(JSON.stringify(contractData.value))
    } else {
      // Load transfer data (existing logic)
      response = await transferService.getTransferDetails(transactionId.value!)

      // Since ApiResponse extends T, we can access properties directly
      if (response && (response as { summary?: ApiSummary }).summary) {
        // Store the summary data separately
        const responseWithSummary = response as { summary: ApiSummary; transfers?: TransferItem[] }
        apiSummary.value = responseWithSummary.summary

        // Extract status from summary
        const summary = responseWithSummary.summary
        if (summary?.status) {
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
    }

    // Reset changes flag after loading data
    changesMade.value = false
  } catch (err) {
    error.value = true
    console.error(`Failed to load ${isContractMode.value ? 'contract' : 'transfer'} data:`, err)
  } finally {
    loading.value = false
  }
}

const formatNumber = (value: number | string | null | undefined): string | null => {
  if (value === null || value === undefined) return null
  return new Intl.NumberFormat(isArabic.value ? 'ar-SA' : 'en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value))
}

const submitRequest = async () => {
  // Check if there are no rows
  if (!currentData.value || currentData.value.length === 0) {
    if (isContractMode.value) {
      await showDialog(isArabic.value ? 'لا توجد بيانات للتقديم' : 'No data to submit', 'warning')
    } else {
      showToast(isArabic.value ? 'لا توجد بيانات للتقديم' : 'No data to submit', 'warning')
    }
    return
  }

  // Check if there are unsaved changes
  if (changesMade.value) {
    if (isContractMode.value) {
      await showDialog(
        isArabic.value
          ? 'يجب حفظ التغييرات أولاً قبل التقديم'
          : 'Please save your changes before submitting',
        'warning',
      )
    } else {
      showToast(
        isArabic.value
          ? 'يجب حفظ التغييرات أولاً قبل التقديم'
          : 'Please save your changes before submitting',
        'warning',
      )
    }
    return
  }

  try {
    if (isContractMode.value) {
      await extendedContractService.submitContractRequest(transactionId.value!)
      await showDialog(
        isArabic.value ? 'تم تقديم الطلب بنجاح' : 'Request submitted successfully',
        'success',
        { timer: 1500 },
      )
      router.push('/contracts')
    } else {
      await transferService.submitTransferRequest(transactionId.value!)
      await showDialog(
        isArabic.value ? 'تم تقديم الطلب بنجاح' : 'Request submitted successfully',
        'success',
        { timer: 1500 },
      )
      router.push('/')
    }
  } catch {
    if (isContractMode.value) {
      await showDialog(isArabic.value ? 'فشل في تقديم الطلب' : 'Failed to submit request', 'error')
    } else {
      showToast(isArabic.value ? 'فشل في تقديم الطلب' : 'Failed to submit request', 'error')
    }
  }
}

const reopenRequest = async () => {
  // Check if there are unsaved changes
  if (changesMade.value) {
    if (isContractMode.value) {
      await showDialog(
        isArabic.value
          ? 'يجب حفظ التغييرات أولاً قبل إعادة فتح الطلب'
          : 'Please save your changes before reopening the request',
        'warning',
      )
    } else {
      showToast(
        isArabic.value
          ? 'يجب حفظ التغييرات أولاً قبل إعادة فتح الطلب'
          : 'Please save your changes before reopening the request',
        'warning',
      )
    }
    return
  }

  try {
    if (isContractMode.value) {
      await extendedContractService.reopenContractRequest(transactionId.value!)
      await showDialog(
        isArabic.value ? 'تم إعادة فتح الطلب بنجاح' : 'Request reopened successfully',
        'success',
        { timer: 3000 },
      )
    } else {
      await transferService.reopenTransferRequest(transactionId.value!)
      showToast(
        isArabic.value ? 'تم إعادة فتح الطلب بنجاح' : 'Request reopened successfully',
        'success',
      )
    }
    await loadData()
  } catch {
    if (isContractMode.value) {
      await showDialog(
        isArabic.value ? 'فشل في إعادة فتح الطلب' : 'Failed to reopen request',
        'error',
      )
    } else {
      showToast(isArabic.value ? 'فشل في إعادة فتح الطلب' : 'Failed to reopen request', 'error')
    }
  }
}

// Update generateReport method to handle both modes
const generateReport = async () => {
  if (isContractMode.value) {
    try {
      const blob = await extendedContractService.generateReport(transactionId.value!)

      // Create download link and trigger download
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `contract-report-${transactionId.value}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)

      // Show success message
      await showDialog(
        isArabic.value ? 'تم إنشاء التقرير بنجاح' : 'Report generated successfully',
        'success',
        { timer: 3000 },
      )
    } catch {
      await showDialog(
        isArabic.value ? 'فشل في إنشاء التقرير' : 'Failed to generate report',
        'error',
      )
    }
  } else {
    showReportModal.value = true
  }
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
      showToast(
        isArabic.value
          ? `لا توجد بيانات مالية لهذا التحديد. المركز: ${item.cost_center_code}, الحساب: ${item.account_code}`
          : `No financial data found for Cost Center: ${item.cost_center_code}, Account: ${item.account_code}`,
        'warning',
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
      showToast(
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

// Add state variable to control report modal visibility
const showReportModal = ref(false)

// Unified Toast and Dialog System
// Toast (auto-dismiss notifications)
const toast = reactive({
  show: false,
  message: '',
  type: 'success' as 'success' | 'error' | 'warning' | 'info',
  timerId: null as number | null,
})

function showToast(message: string, type: typeof toast.type = 'success', duration = 3000) {
  if (toast.timerId) clearTimeout(toast.timerId)
  toast.message = message
  toast.type = type
  toast.show = true
  toast.timerId = window.setTimeout(() => (toast.show = false), duration)
}

// Dialog (Promise-based confirmations)
const dialog = reactive<{
  show: boolean
  type: string
  title: string
  message: string
  timer: number
  needConfirm: boolean
  resolve: (() => void) | null
}>({
  show: false,
  type: 'info',
  title: '',
  message: '',
  timer: 0,
  needConfirm: true,
  resolve: null,
})

function showDialog(
  message: string,
  type: 'success' | 'error' | 'warning' | 'info' = 'info',
  opts: { title?: string; timer?: number; confirm?: boolean } = {},
) {
  return new Promise<void>((resolve) => {
    dialog.type = type
    dialog.title =
      opts.title ??
      (type === 'success'
        ? isArabic.value
          ? 'نجاح!'
          : 'Success!'
        : type === 'error'
          ? isArabic.value
            ? 'خطأ!'
            : 'Error!'
          : type === 'warning'
            ? isArabic.value
              ? 'تحذير!'
              : 'Warning!'
            : isArabic.value
              ? 'تنبيه!'
              : 'Notice!')
    dialog.message = message
    dialog.timer = opts.timer ?? 0
    dialog.needConfirm = opts.confirm ?? dialog.timer === 0
    dialog.resolve = resolve
    dialog.show = true

    if (dialog.timer > 0) {
      setTimeout(() => {
        if (dialog.show) {
          dialog.show = false
          dialog.resolve?.()
          dialog.resolve = null
        }
      }, dialog.timer)
    }
  })
}

// Handle dialog confirm event
const handleDialogConfirm = () => {
  if (dialog.resolve) {
    dialog.resolve()
    dialog.resolve = null
  }
}
</script>

<style src="@/styles/CostCenterTransferRequest.css" scoped></style>

<style>
/* Toast Styles */
.toast {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  padding: 16px 24px;
  border-radius: 8px;
  color: white;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  max-width: 400px;
  word-wrap: break-word;
}

.toast--success {
  background-color: #28a745;
}

.toast--error {
  background-color: #dc3545;
}

.toast--warning {
  background-color: #ffc107;
  color: #212529;
}

.toast--info {
  background-color: #17a2b8;
}

/* Toast Animation */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.fade-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

/* RTL Toast Position */
.rtl .toast {
  right: auto;
  left: 20px;
}

.rtl .fade-enter-from,
.rtl .fade-leave-to {
  transform: translateX(-100%);
}

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

/* View-only mode styles */
.view-status-info {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: auto;
}

.view-only-badge {
  padding: 8px 16px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
  border: 1px solid rgba(99, 102, 241, 0.2);
}

.dark-mode .view-only-badge {
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  box-shadow: 0 2px 8px rgba(79, 70, 229, 0.4);
  border: 1px solid rgba(79, 70, 229, 0.3);
}

.rtl .view-status-info {
  margin-left: 0;
  margin-right: auto;
}
</style>
