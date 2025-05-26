<template>
  <div v-if="show" class="rejection-modal-overlay" @click="closeModal">
    <div class="rejection-modal-container" :class="{ 'dark-mode': isDarkMode }" @click.stop>
      <!-- Modal header -->
      <div class="rejection-modal-header">
        <h2>{{ isArabic ? 'تقارير الرفض' : 'Rejection Reports' }}</h2>
        <button class="close-modal" @click="closeModal">
          <span class="close-icon">&times;</span>
        </button>
      </div>

      <!-- Modal body -->
      <div class="rejection-modal-body">
        <div v-if="loading" class="loading-container">
          <div class="loading-spinner"></div>
          <p>{{ isArabic ? 'جاري التحميل...' : 'Loading...' }}</p>
        </div>

        <div v-else-if="error" class="error-container">
          <div class="error-icon">!</div>
          <p>{{ error }}</p>
        </div>

        <div v-else-if="reports.length === 0" class="no-reports">
          <div class="info-icon">i</div>
          <p>{{ isArabic ? 'لا توجد تقارير رفض' : 'No rejection reports found' }}</p>
        </div>

        <div v-else class="reports-list">
          <transition-group name="fade" tag="div">
            <div v-for="(report, index) in reports" :key="index" class="report-card">
              <div class="report-header">
                <div class="report-title">
                  <span class="report-icon">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                      <line x1="16" y1="13" x2="8" y2="13"></line>
                      <line x1="16" y1="17" x2="8" y2="17"></line>
                      <polyline points="10 9 9 9 8 9"></polyline>
                    </svg>
                  </span>
                  <span class="report-number"
                    >{{ isArabic ? 'تقرير رفض' : 'Rejection Report' }} #{{ index + 1 }}</span
                  >
                </div>
                <div class="report-date">{{ formatDate(report.created_at) }}</div>
              </div>

              <div class="report-content">
                <div class="report-field">
                  <span class="field-label">{{ isArabic ? 'رفض بواسطة' : 'Rejected by' }}:</span>
                  <span class="field-value">{{ report['rejected by'] }}</span>
                </div>

                <div class="report-field reason">
                  <span class="field-label">{{ isArabic ? 'السبب' : 'Reason' }}:</span>
                  <div class="reason-text">{{ report.reason_text }}</div>
                </div>
              </div>

              <div class="report-footer">
                <div class="transaction-id">
                  {{ isArabic ? 'رقم المعاملة' : 'Transaction ID' }}: {{ report.transaction_id }}
                </div>
              </div>
            </div>
          </transition-group>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useThemeStore } from '@/stores/themeStore'
import transferService from '@/services/TransferService'

// Define props
const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  transactionId: {
    type: Number,
    default: 0,
  },
})

// Define emits
const emit = defineEmits(['update:show'])

// Define data
import type { RejectionReport } from '@/services/TransferService'
const reports = ref<RejectionReport[]>([])
const loading = ref(false)
const error = ref('')
const themeStore = useThemeStore()

// Computed properties
const isDarkMode = computed(() => themeStore.darkMode)
const isArabic = computed(() => themeStore.language === 'ar')

// Watch for changes in show prop to load data
watch(
  () => props.show,
  async (newVal) => {
    if (newVal && props.transactionId) {
      await loadRejectionReports()
    }
  },
)

// Watch for changes in transactionId to reload data if modal is shown
watch(
  () => props.transactionId,
  async (newVal) => {
    if (props.show && newVal) {
      await loadRejectionReports()
    }
  },
)

// Format date method
function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString()
}

// Close modal method
function closeModal() {
  emit('update:show', false)
}

// Load rejection reports
async function loadRejectionReports() {
  if (!props.transactionId) return

  loading.value = true
  error.value = ''
  reports.value = []

  try {
    const data = await transferService.getRejectionReports(props.transactionId)
    reports.value = data || []
  } catch (err) {
    error.value = isArabic.value
      ? 'حدث خطأ أثناء تحميل تقارير الرفض'
      : 'An error occurred while loading rejection reports'
    console.error('Error loading rejection reports:', err)
  } finally {
    loading.value = false
  }
}

// Load initial data if modal is shown
onMounted(async () => {
  if (props.show && props.transactionId) {
    await loadRejectionReports()
  }
})
</script>

<style scoped>
/* Base modal styles */
.rejection-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.2s ease;
}

.rejection-modal-container {
  position: relative;
  width: 90%;
  max-width: 700px;
  max-height: 80vh;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  animation: modalAppear 0.3s ease-out;
  overflow: hidden;
}

/* Dark mode specific styles */
.dark-mode.rejection-modal-container {
  background: #292933;
  color: #e5e5e5;
}

/* Header styles */
.rejection-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: #f5f5f7;
  border-bottom: 1px solid #e0e0e5;
}

.dark-mode .rejection-modal-header {
  background: #34343e;
  border-bottom-color: #45454d;
}

.rejection-modal-header h2 {
  font-size: 1.25rem;
  margin: 0;
  color: #333333;
  font-weight: 500;
}

.dark-mode .rejection-modal-header h2 {
  color: #ffffff;
}

.close-modal {
  background: transparent;
  border: none;
  color: #666;
  font-size: 22px;
  cursor: pointer;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.close-modal:hover {
  background: rgba(0, 0, 0, 0.05);
  color: #333;
}

.dark-mode .close-modal {
  color: #aaa;
}

.dark-mode .close-modal:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

/* Body styles */
.rejection-modal-body {
  padding: 20px;
  max-height: calc(80vh - 70px);
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #d1d5db #f3f4f6;
}

.rejection-modal-body::-webkit-scrollbar {
  width: 6px;
}

.rejection-modal-body::-webkit-scrollbar-track {
  background: #f3f4f6;
  border-radius: 3px;
}

.rejection-modal-body::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}

.dark-mode .rejection-modal-body::-webkit-scrollbar-track {
  background: #333340;
}

.dark-mode .rejection-modal-body::-webkit-scrollbar-thumb {
  background: #4d4d5a;
}

/* Loading styles */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e5e7eb;
  border-radius: 50%;
  border-top-color: #6d1a36;
  animation: spin 1s infinite linear;
  margin-bottom: 15px;
}

.loading-container p {
  color: #4b5563;
}

.dark-mode .loading-spinner {
  border: 3px solid #3f3f5f;
  border-top-color: #7d2a46;
}

.dark-mode .loading-container p {
  color: #d1d5db;
}

/* Error styles */
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px 0;
}

.error-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  font-size: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 15px;
  border: 2px solid rgba(239, 68, 68, 0.2);
}

.error-container p {
  color: #ef4444;
  text-align: center;
  font-size: 0.95rem;
}

.dark-mode .error-icon {
  background: rgba(248, 113, 113, 0.1);
  color: #f87171;
  border-color: rgba(248, 113, 113, 0.2);
}

.dark-mode .error-container p {
  color: #f87171;
}

/* No reports style */
.no-reports {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
}

.info-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  font-size: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 15px;
  border: 2px solid rgba(59, 130, 246, 0.2);
}

.no-reports p {
  color: #4b5563;
  text-align: center;
  font-size: 0.95rem;
}

.dark-mode .info-icon {
  background: rgba(96, 165, 250, 0.1);
  color: #60a5fa;
  border-color: rgba(96, 165, 250, 0.2);
}

.dark-mode .no-reports p {
  color: #d1d5db;
}

/* Report card styles */
.reports-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.report-card {
  background: #ffffff;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  animation: scaleIn 0.3s ease;
}

.report-header {
  background: #f9fafb;
  padding: 12px 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e5e7eb;
}

.report-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.report-icon {
  display: flex;
  align-items: center;
  color: #6d1a36;
}

.report-number {
  font-weight: 500;
  color: #374151;
}

.report-date {
  font-size: 0.85rem;
  color: #6b7280;
}

.report-content {
  padding: 15px;
}

.report-field {
  margin-bottom: 15px;
  display: flex;
  gap: 10px;
}

.report-field.reason {
  flex-direction: column;
  gap: 5px;
}

.field-label {
  font-weight: 500;
  color: #4b5563;
  min-width: 90px;
}

.field-value {
  color: #1f2937;
}

.reason-text {
  background: #f9fafb;
  padding: 12px 15px;
  border-radius: 6px;
  color: #4b5563;
  font-style: italic;
  border-left: 3px solid #6d1a36;
}

.report-footer {
  padding: 10px 15px;
  background: #f9fafb;
  border-top: 1px solid #e5e7eb;
}

.transaction-id {
  font-size: 0.85rem;
  color: #6b7280;
}

/* Dark mode adjustments */
.dark-mode .report-card {
  background: #1f1f2e;
  border-color: #3f3f5f;
}

.dark-mode .report-header {
  background: #2c2c3f;
  border-bottom-color: #3f3f5f;
}

.dark-mode .report-number {
  color: #e5e5e5;
}

.dark-mode .report-date {
  color: #a1a1aa;
}

.dark-mode .field-label {
  color: #a1a1aa;
}

.dark-mode .field-value {
  color: #e5e5e5;
}

.dark-mode .reason-text {
  background: #2c2c3f;
  color: #d1d5db;
  border-left-color: #7d2a46;
}

.dark-mode .report-footer {
  background: #2c2c3f;
  border-top-color: #3f3f5f;
}

.dark-mode .transaction-id {
  color: #a1a1aa;
}

/* Animations */
@keyframes modalAppear {
  0% {
    transform: scale(0.9);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes fadeIn {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes scaleIn {
  0% {
    transform: translateY(20px);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .rejection-modal-container {
    width: 95%;
    max-height: 85vh;
  }

  .rejection-modal-header h2 {
    font-size: 1.3rem;
  }

  .field-label {
    min-width: 70px;
  }
}

@media (max-width: 480px) {
  .rejection-modal-header {
    padding: 12px 15px;
  }

  .rejection-modal-body {
    padding: 15px;
  }

  .rejection-modal-header h2 {
    font-size: 1.1rem;
  }

  .report-field {
    flex-direction: column;
    gap: 5px;
  }

  .field-label {
    min-width: auto;
  }
}

/* RTL Support for Arabic */
[dir='rtl'] .close-modal {
  right: auto;
  left: 15px;
}

[dir='rtl'] .reason-text {
  border-left: none;
  border-right: 3px solid #6d1a36;
}

[dir='rtl'] .dark-mode .reason-text {
  border-right-color: #7d2a46;
}

[dir='rtl'] .report-title {
  flex-direction: row-reverse;
}
</style>
