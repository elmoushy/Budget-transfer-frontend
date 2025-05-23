<template>
  <div v-if="modelValue" class="modal-overlay" @click="closeModal">
    <div class="approval-modal-container" :class="{ 'dark-mode': isDarkMode }" @click.stop>
      <div class="modal-header">
        <h2>{{ isArabic ? 'سير عملية الموافقة' : 'Approval Pipeline' }}</h2>
        <button class="close-modal" @click="closeModal">×</button>
      </div>
      <div class="modal-body approval-pipeline-body">
        <!-- Special case: Waiting to submit -->
        <div v-if="isWaitingToSubmit" class="waiting-to-submit">
          <div class="waiting-icon">
            <i class="fas fa-clock"></i>
          </div>
          <div class="waiting-message">
            {{ isArabic ? 'في انتظار التقديم' : 'Waiting to submit' }}
          </div>
        </div>

        <!-- Normal approval pipeline flow -->
        <div v-else class="approval-steps">
          <!-- Step 1 -->
          <div
            class="step-card"
            :class="{
              approved: approvalData?.approvel_1_date,
              pending: !approvalData?.approvel_1_date,
              rejected: isRejectedAtLevel(1),
              rtl: isArabic,
            }"
          >
            <div class="step-icon">
              <i
                :class="isRejectedAtLevel(1) ? 'fas fa-times-circle' : 'fas fa-clipboard-check'"
              ></i>
            </div>
            <div class="step-content">
              <div class="step-title">
                {{ isArabic ? 'قسم التخطيط والموازنة' : 'Planning & Budget' }}
              </div>
              <div class="step-approver">{{ approvalData?.approvel_1 || '-' }}</div>
              <div class="step-date" v-if="approvalData?.approvel_1_date">
                {{ formatApprovalDate(approvalData.approvel_1_date) }}
              </div>
              <div class="step-status" v-else-if="!isRejectedAtLevel(1)">
                {{ isArabic ? 'قيد الانتظار' : 'Pending' }}
              </div>
              <div class="step-status rejected-text" v-else>
                {{ isArabic ? 'مرفوض' : 'Rejected' }}
              </div>
            </div>
          </div>

          <div class="step-arrow" :class="{ 'rtl-arrow': isArabic }"></div>

          <!-- Step 2 -->
          <div
            class="step-card"
            :class="{
              approved: approvalData?.approvel_2_date && !isRejectedAtLevel(2),
              pending: !approvalData?.approvel_2_date && !isRejectedAtLevel(2),
              rejected: isRejectedAtLevel(2),
              rtl: isArabic,
            }"
          >
            <div class="step-icon">
              <i
                :class="isRejectedAtLevel(2) ? 'fas fa-times-circle' : 'fas fa-file-invoice-dollar'"
              ></i>
            </div>
            <div class="step-content">
              <div class="step-title">
                {{ isArabic ? 'مدير إدارة المالية' : 'Finance Director' }}
              </div>
              <div class="step-approver">{{ approvalData?.approvel_2 || '-' }}</div>
              <div class="step-date" v-if="approvalData?.approvel_2_date">
                {{ formatApprovalDate(approvalData.approvel_2_date) }}
              </div>
              <div class="step-status" v-else-if="!isRejectedAtLevel(2)">
                {{ isArabic ? 'قيد الانتظار' : 'Pending' }}
              </div>
              <div class="step-status rejected-text" v-else>
                {{ isArabic ? 'مرفوض' : 'Rejected' }}
              </div>
            </div>
          </div>

          <div class="step-arrow" :class="{ 'rtl-arrow': isArabic }"></div>

          <!-- Step 3 -->
          <div
            class="step-card"
            :class="{
              approved: approvalData?.approvel_3_date && !isRejectedAtLevel(3),
              pending: !approvalData?.approvel_3_date && !isRejectedAtLevel(3),
              rejected: isRejectedAtLevel(3),
              rtl: isArabic,
            }"
          >
            <div class="step-icon">
              <i :class="isRejectedAtLevel(3) ? 'fas fa-times-circle' : 'fas fa-chart-line'"></i>
            </div>
            <div class="step-content">
              <div class="step-title">
                {{ isArabic ? 'المدير المالي التنفيذي' : 'CFO' }}
              </div>
              <div class="step-approver">{{ approvalData?.approvel_3 || '-' }}</div>
              <div class="step-date" v-if="approvalData?.approvel_3_date">
                {{ formatApprovalDate(approvalData.approvel_3_date) }}
              </div>
              <div class="step-status" v-else-if="!isRejectedAtLevel(3)">
                {{ isArabic ? 'قيد الانتظار' : 'Pending' }}
              </div>
              <div class="step-status rejected-text" v-else>
                {{ isArabic ? 'مرفوض' : 'Rejected' }}
              </div>
            </div>
          </div>

          <div class="step-arrow" :class="{ 'rtl-arrow': isArabic }"></div>

          <!-- Step 4 -->
          <div
            class="step-card"
            :class="{
              approved: approvalData?.approvel_4_date && !isRejectedAtLevel(4),
              pending: !approvalData?.approvel_4_date && !isRejectedAtLevel(4),
              rejected: isRejectedAtLevel(4),
              rtl: isArabic,
            }"
          >
            <div class="step-icon">
              <i :class="isRejectedAtLevel(4) ? 'fas fa-times-circle' : 'fas fa-check-double'"></i>
            </div>
            <div class="step-content">
              <div class="step-title">
                {{ isArabic ? 'المدير العام' : 'General Manager' }}
              </div>
              <div class="step-approver">{{ approvalData?.approvel_4 || '-' }}</div>
              <div class="step-date" v-if="approvalData?.approvel_4_date">
                {{ formatApprovalDate(approvalData.approvel_4_date) }}
              </div>
              <div class="step-status" v-else-if="!isRejectedAtLevel(4)">
                {{ isArabic ? 'قيد الانتظار' : 'Pending' }}
              </div>
              <div class="step-status rejected-text" v-else>
                {{ isArabic ? 'مرفوض' : 'Rejected' }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useThemeStore } from '@/stores/themeStore'

// Define component props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  approvalData: {
    type: Object,
    required: true,
    default: () => ({}),
  },
})

// Define emits
const emit = defineEmits(['update:modelValue'])

// Theme & Language
const themeStore = useThemeStore()
const isArabic = computed(() => themeStore.language === 'ar')
const isDarkMode = computed(() => themeStore.darkMode)

// Special case detection
const isWaitingToSubmit = computed(() => {
  return (
    !props.approvalData?.approvel_1 &&
    !props.approvalData?.approvel_2 &&
    !props.approvalData?.approvel_3 &&
    !props.approvalData?.approvel_4 &&
    !props.approvalData?.approvel_1_date &&
    !props.approvalData?.approvel_2_date &&
    !props.approvalData?.approvel_3_date &&
    !props.approvalData?.approvel_4_date &&
    props.approvalData?.status_level === 1
  )
})

// Check if a specific level is rejected
function isRejectedAtLevel(level: number): boolean {
  // If status_level is -1, check if this is the level at which rejection happened
  if (props.approvalData?.status_level === -1) {
    // For levels 1-3, rejection at this level means:
    // - This level has a date (approved) and a name
    // - The next level does not have a date
    if (level < 4) {
      let thisLevelDate, thisLevelName, nextLevelDate

      if (level === 1) {
        thisLevelDate = props.approvalData?.approvel_1_date
        thisLevelName = props.approvalData?.approvel_1
        nextLevelDate = props.approvalData?.approvel_2_date
      } else if (level === 2) {
        thisLevelDate = props.approvalData?.approvel_2_date
        thisLevelName = props.approvalData?.approvel_2
        nextLevelDate = props.approvalData?.approvel_3_date
      } else {
        thisLevelDate = props.approvalData?.approvel_3_date
        thisLevelName = props.approvalData?.approvel_3
        nextLevelDate = props.approvalData?.approvel_4_date
      }

      return !!thisLevelDate && !!thisLevelName && !nextLevelDate
    }

    // For level 4, if it has a date and status_level is -1, it was rejected at this level
    if (level === 4) {
      return !!props.approvalData?.approvel_4_date
    }
  }

  return false
}

// Methods
function closeModal() {
  emit('update:modelValue', false)
}

// Function to format approval date
function formatApprovalDate(dateString: string): string {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString()
}
</script>

<style scoped>
/* Modal Overlay */
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

/* Modal Container */
.approval-modal-container {
  background-color: white;
  width: 95%;
  max-width: 900px;
  border-radius: 16px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  animation: slideIn 0.3s ease;
}

/* Modal Header */
.modal-header {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.25rem;
  color: #1a202c;
  font-weight: 600;
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

/* Modal Body */
.modal-body {
  padding: 2rem;
}

/* Approval Pipeline Modern Styles */
.approval-pipeline-body {
  padding: 2rem;
  overflow-x: auto;
}

.approval-steps {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  min-width: 700px;
}

/* Waiting to submit styling */
.waiting-to-submit {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 2rem;
  min-height: 150px;
}

.waiting-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: rgba(245, 158, 11, 0.15);
  color: #d97706;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.waiting-message {
  font-size: 1.25rem;
  font-weight: 500;
  color: #4b5563;
}

/* Step Card Styling */
.step-card {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 1rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  flex: 1;
  max-width: 220px;
  min-height: 100px;
  position: relative;
}

.step-card.rtl {
  flex-direction: row-reverse;
}

.step-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
}

.step-card.approved {
  background-color: rgba(236, 253, 245, 1);
  border-left: 4px solid #10b981;
}

.step-card.pending {
  background-color: rgba(254, 249, 238, 1);
  border-left: 4px solid #f59e0b;
}

.step-card.rejected {
  background-color: rgba(254, 226, 226, 1);
  border-left: 4px solid #dc2626;
}

.step-card.rtl.approved {
  border-left: none;
  border-right: 4px solid #10b981;
}

.step-card.rtl.pending {
  border-left: none;
  border-right: 4px solid #f59e0b;
}

.step-card.rtl.rejected {
  border-left: none;
  border-right: 4px solid #dc2626;
}

/* Step Icon */
.step-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1.25rem;
  flex-shrink: 0;
  font-size: 1.25rem;
}

.step-card.rtl .step-icon {
  margin-right: 0.75rem;
  margin-left: 0.25rem;
}

.approved .step-icon {
  background-color: rgba(16, 185, 129, 0.15);
  color: #059669;
}

.pending .step-icon {
  background-color: rgba(245, 158, 11, 0.15);
  color: #d97706;
}

.rejected .step-icon {
  background-color: rgba(220, 38, 38, 0.15);
  color: #b91c1c;
}

/* Step Content */
.step-content {
  flex-grow: 1;
}

.step-title {
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.25rem;
  font-size: 0.9rem;
}

.step-approver {
  font-weight: 500;
  color: #4b5563;
  font-size: 0.8rem;
}

.step-date {
  font-size: 0.75rem;
  color: #059669;
  margin-top: 0.25rem;
}

.step-status {
  font-size: 0.75rem;
  color: #d97706;
  font-style: italic;
  margin-top: 0.25rem;
}

.step-status.rejected-text {
  color: #dc2626;
}

/* Step Arrow */
.step-arrow {
  height: 2px;
  min-width: 30px;
  background-color: #d1d5db;
  position: relative;
  flex-shrink: 0;
}

.step-arrow::after {
  content: '';
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%) rotate(45deg);
  width: 8px;
  height: 8px;
  border-top: 2px solid #d1d5db;
  border-right: 2px solid #d1d5db;
}

.step-arrow.rtl-arrow::after {
  right: auto;
  left: 0;
  transform: translateY(-50%) rotate(-135deg);
}

/* Dark Mode Styles */
.dark-mode.approval-modal-container {
  background-color: #1a1a2e;
  border: 1px solid #3f3f5f;
}

.dark-mode .modal-header {
  border-bottom-color: #3f3f5f;
}

.dark-mode .modal-header h2 {
  color: #f3f4f6;
}

.dark-mode .close-modal {
  color: #f3f4f6;
}

.dark-mode .close-modal:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.dark-mode .step-card {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.dark-mode .step-card:hover {
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
}

.dark-mode .step-card.approved {
  background-color: rgba(16, 185, 129, 0.1);
  border-left-color: #34d399;
}

.dark-mode .step-card.pending {
  background-color: rgba(245, 158, 11, 0.1);
  border-left-color: #fbbf24;
}

.dark-mode .step-card.rejected {
  background-color: rgba(220, 38, 38, 0.1);
  border-left-color: #ef4444;
}

.dark-mode .step-card.rtl.approved {
  border-right-color: #34d399;
  border-left: none;
}

.dark-mode .step-card.rtl.pending {
  border-right-color: #fbbf24;
  border-left: none;
}

.dark-mode .step-card.rtl.rejected {
  border-right-color: #ef4444;
  border-left: none;
}

.dark-mode .step-title {
  color: #f3f4f6;
}

.dark-mode .step-approver {
  color: #d1d5db;
}

.dark-mode .approved .step-icon {
  background-color: rgba(16, 185, 129, 0.2);
  color: #34d399;
}

.dark-mode .pending .step-icon {
  background-color: rgba(245, 158, 11, 0.2);
  color: #fbbf24;
}

.dark-mode .rejected .step-icon {
  background-color: rgba(220, 38, 38, 0.2);
  color: #ef4444;
}

.dark-mode .step-date {
  color: #34d399;
}

.dark-mode .step-status {
  color: #fbbf24;
}

.dark-mode .step-status.rejected-text {
  color: #ef4444;
}

.dark-mode .waiting-icon {
  background-color: rgba(245, 158, 11, 0.2);
  color: #fbbf24;
}

.dark-mode .waiting-message {
  color: #d1d5db;
}

.dark-mode .step-arrow {
  background-color: #4b5563;
}

.dark-mode .step-arrow::after {
  border-top-color: #4b5563;
  border-right-color: #4b5563;
}

/* Animations */
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
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .approval-steps {
    padding: 0.5rem;
    overflow-x: auto;
  }
}
</style>
