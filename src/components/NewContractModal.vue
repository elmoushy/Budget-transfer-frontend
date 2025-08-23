<template>
  <div v-if="modelValue" class="modal-overlay" @click="closeModal">
    <div class="modal-container" :class="{ 'dark-mode': isDarkMode }" @click.stop>
      <div class="modal-header">
        <h2>{{ isArabic ? 'طلب عقد جديد' : 'New Contract Request' }}</h2>
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

        <!-- Reason for Contract Field -->
        <div class="form-group">
          <label for="contractReason" class="required">
            {{ isArabic ? 'سبب العقد' : 'Reason for Contract' }}
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
        <button class="btn-primary submit-btn" @click="submitForm">
          {{ isArabic ? 'إنشاء' : 'Create' }}
        </button>
      </div>
    </div>
  </div>

  <!-- Add FuturisticPopup component -->
  <FuturisticPopup
    v-model:show="showPopup"
    :type="popupType"
    :title="popupTitle"
    :message="popupMessage"
    :timer="3000"
  />
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useThemeStore } from '@/stores/themeStore'
import { QuillEditor } from '@vueup/vue-quill'
import FuturisticPopup from '@/components/FuturisticPopup.vue'
import apiService from '@/services/apiService'

// Define component props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
})

// Define emits
const emit = defineEmits(['update:modelValue', 'submit'])

// Track editor state
const editorContent = ref('')
const editorError = ref(false)
const newRequest = ref({
  timePeriod: '',
  contractReason: '',
})

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

// Theme & Language
const themeStore = useThemeStore()
const isArabic = computed(() => themeStore.language === 'ar')
const isDarkMode = computed(() => themeStore.darkMode)

// Add state for FuturisticPopup
const showPopup = ref(false)
const popupType = ref('info')
const popupTitle = ref('')
const popupMessage = ref('')

// Helper function for styled alerts - replace SweetAlert with FuturisticPopup
const showAlert = (message: string, type: 'error' | 'success' | 'warning' | 'info' = 'info') => {
  let title = ''
  if (type === 'error') {
    title = isArabic.value ? 'خطأ!' : 'Error!'
  } else if (type === 'success') {
    title = isArabic.value ? 'تم!' : 'Success!'
  } else if (type === 'warning') {
    title = isArabic.value ? 'تنبيه!' : 'Warning!'
  } else {
    title = isArabic.value ? 'معلومات' : 'Information'
  }

  popupTitle.value = title
  popupMessage.value = message
  popupType.value = type
  showPopup.value = true

  // Return a promise that resolves when the popup is closed
  return new Promise((resolve) => {
    const checkClosed = setInterval(() => {
      if (!showPopup.value) {
        clearInterval(checkClosed)
        resolve(true)
      }
    }, 100)
  })
}

// Methods
function closeModal() {
  // Reset form when closing
  resetForm()
  emit('update:modelValue', false)
}

function resetForm() {
  newRequest.value = {
    timePeriod: '',
    contractReason: '',
  }
  editorContent.value = ''
  editorError.value = false
}

async function submitForm() {
  // Validate fields
  const isDefaultContent =
    editorContent.value === '' ||
    editorContent.value === '<p><br></p>' ||
    editorContent.value === ''

  if (!newRequest.value.timePeriod || isDefaultContent) {
    // Show error for editor if it's empty or has default content
    if (isDefaultContent) {
      editorError.value = true
    }

    // Replace alert with showAlert function
    showAlert(
      isArabic.value ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill all required fields',
      'warning',
    )
    return
  }

  // Reset error state
  editorError.value = false

  try {
    // Prepare API payload with type:"FAD" for contracts
    const payload = {
      transaction_date: newRequest.value.timePeriod,
      notes: editorContent.value,
      type: 'FAD', // Changed to 'FAD' for contracts
    }

    // Make API call to create new contract using centralized API service
    const response = await apiService.transfers.createTransfer(payload)

    // Emit the submit event with the response data
    emit('submit', response)

    // Close the modal
    closeModal()

    // Show success message
    showAlert(
      isArabic.value ? 'تم إنشاء طلب العقد بنجاح' : 'Contract request created successfully',
      'success',
    )
  } catch (error) {
    console.error('Error creating contract request:', error)

    // Replace alert with showAlert function
    showAlert(isArabic.value ? 'حدث خطأ أثناء إنشاء الطلب' : 'Error creating request', 'error')
  }
}

// Reset the form when modal is opened
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue) {
      resetForm()
    }
  },
)
</script>

<style scoped>
@import 'animate.css';
/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(26, 20, 35, 0.7);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
  animation: fadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-container {
  background: linear-gradient(
    135deg,
    rgba(255, 246, 250, 0.95) 0%,
    rgba(248, 246, 248, 0.9) 25%,
    rgba(228, 201, 214, 0.85) 100%
  );
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  width: 95%;
  max-width: 600px;
  border-radius: 20px;
  box-shadow:
    0 20px 60px rgba(138, 42, 68, 0.2),
    0 8px 32px rgba(138, 42, 68, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.4),
    0 0 0 1px rgba(228, 201, 214, 0.3);
  overflow: hidden;
  transform-style: preserve-3d;
  perspective: 1000px;
  animation: slideIn 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  color: #1a1423;
}

.modal-header {
  padding: 1.75rem 2rem;
  border-bottom: 1px solid rgba(228, 201, 214, 0.4);
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  background: linear-gradient(135deg, rgba(255, 246, 250, 0.6) 0%, rgba(228, 201, 214, 0.3) 100%);
}

.modal-header::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 10%;
  width: 80%;
  height: 1px;
  background: linear-gradient(
    to right,
    rgba(138, 42, 68, 0),
    rgba(138, 42, 68, 0.4),
    rgba(138, 42, 68, 0)
  );
}

.modal-header h2 {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  background: linear-gradient(135deg, #6d1a36, #8a2a44, #e14b6a);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  text-shadow: 0 0 20px rgba(138, 42, 68, 0.3);
}

.close-modal {
  background: rgba(255, 246, 250, 0.4);
  border: 1px solid rgba(228, 201, 214, 0.3);
  font-size: 1.5rem;
  cursor: pointer;
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  color: #6b7280;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  box-shadow:
    0 2px 8px rgba(138, 42, 68, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

.close-modal::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, rgba(225, 75, 106, 0.2) 0%, transparent 70%);
  opacity: 0;
  transform: scale(0.5);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.close-modal:hover {
  background-color: rgba(239, 68, 68, 0.15);
  border-color: rgba(225, 75, 106, 0.4);
  color: #e14b6a;
  transform: rotate(90deg) scale(1.1);
  box-shadow:
    0 4px 16px rgba(225, 75, 106, 0.2),
    0 0 20px rgba(225, 75, 106, 0.1);
}

.close-modal:hover::before {
  opacity: 1;
  transform: scale(1.5);
}

.modal-body {
  padding: 2rem;
  background: linear-gradient(135deg, rgba(255, 246, 250, 0.1) 0%, rgba(228, 201, 214, 0.05) 100%);
  position: relative;
  overflow: hidden;
}

.modal-body::before {
  content: '';
  position: absolute;
  top: -100px;
  right: -100px;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(138, 42, 68, 0.08) 0%,
    rgba(225, 75, 106, 0.04) 30%,
    transparent 70%
  );
  pointer-events: none;
  z-index: 1;
}

.modal-footer {
  padding: 1.5rem 2rem;
  border-top: 1px solid rgba(228, 201, 214, 0.4);
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  position: relative;
  background: linear-gradient(135deg, rgba(255, 246, 250, 0.6) 0%, rgba(228, 201, 214, 0.2) 100%);
}

.form-group {
  margin-bottom: 2rem;
  position: relative;
}

.form-group label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: #4a5568;
  letter-spacing: 0.02em;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  background: linear-gradient(90deg, #4a5568, #64748b);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.required::after {
  content: ' *';
  color: #e53e3e;
  text-shadow: 0 0 5px rgba(229, 62, 62, 0.3);
}

.select-wrapper {
  position: relative;
  z-index: 1;
}

.select-wrapper::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 10px;
  pointer-events: none;
  box-shadow: 0 0 0 1px rgba(226, 232, 240, 0.7);
  transition: all 0.3s ease;
}

.select-wrapper:hover::after {
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.4),
    0 0 20px rgba(34, 197, 94, 0.1);
}

.select-wrapper select {
  width: 100%;
  padding: 0.85rem 1rem;
  padding-right: 2.5rem;
  font-size: 1rem;
  border: none;
  border-radius: 10px;
  background-color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.05);
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  cursor: pointer;
  font-family: 'Inter', 'Space Grotesk', sans-serif;
  letter-spacing: 0.01em;
  appearance: none;
  -webkit-appearance: none;
  transition: all 0.3s ease;
}

.select-wrapper select:focus {
  outline: none;
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.6),
    0 0 25px rgba(34, 197, 94, 0.15);
  transform: translateY(-2px);
}

.select-arrow {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: #64748b;
  font-size: 0.75rem;
  transition: all 0.3s ease;
  opacity: 0.7;
}

.select-wrapper:hover .select-arrow {
  color: #22c55e;
  opacity: 1;
  transform: translateY(-50%) translateY(-2px);
}

.btn-secondary {
  background-color: rgba(241, 245, 249, 0.8);
  color: #334155;
  border: none;
  padding: 0.7rem 1.4rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  box-shadow:
    0 2px 10px rgba(0, 0, 0, 0.05),
    0 0 0 1px rgba(226, 232, 240, 0.6);
  position: relative;
  overflow: hidden;
  letter-spacing: 0.01em;
}

.btn-secondary::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0) 60%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.btn-secondary:hover {
  background-color: rgba(226, 232, 240, 0.9);
  transform: translateY(-3px);
  box-shadow:
    0 4px 15px rgba(0, 0, 0, 0.08),
    0 0 0 1px rgba(226, 232, 240, 0.8);
}

.btn-secondary:hover::before {
  opacity: 1;
}

.btn-primary {
  background: linear-gradient(135deg, #8a2a44, #6d1a36);
  color: #fff;
  border: 1px solid rgba(138, 42, 68, 0.3);
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow:
    0 4px 16px rgba(138, 42, 68, 0.25),
    0 2px 8px rgba(138, 42, 68, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  position: relative;
  overflow: hidden;
  letter-spacing: 0.01em;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.btn-primary::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent 0%, rgba(225, 75, 106, 0.3) 50%, transparent 100%);
  transition: all 0.6s ease;
}

.btn-primary:hover {
  background: linear-gradient(135deg, #e14b6a, #8a2a44);
  transform: translateY(-2px);
  border-color: rgba(225, 75, 106, 0.4);
  box-shadow:
    0 6px 20px rgba(138, 42, 68, 0.3),
    0 4px 12px rgba(225, 75, 106, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.btn-primary:hover::before {
  left: 100%;
}

.btn-primary:active {
  transform: translateY(-1px);
}

.submit-btn {
  min-width: 120px;
  position: relative;
}

.submit-btn::after {
  content: '';
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  width: 0;
  height: 2px;
  background: rgba(255, 255, 255, 0.5);
  transition: width 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.submit-btn:hover::after {
  width: 15px;
}

/* Dark mode modal styles */
.dark-mode .modal-overlay {
  background-color: rgba(36, 23, 38, 0.8);
}

.dark-mode .modal-container {
  background: linear-gradient(
    135deg,
    rgba(36, 23, 38, 0.95) 0%,
    rgba(24, 19, 26, 0.9) 25%,
    rgba(81, 32, 60, 0.85) 100%
  );
  color: #f8e9f0;
  box-shadow:
    0 20px 60px rgba(167, 56, 92, 0.3),
    0 8px 32px rgba(167, 56, 92, 0.2),
    inset 0 1px 0 rgba(248, 233, 240, 0.15),
    0 0 0 1px rgba(81, 32, 60, 0.4);
}

.dark-mode .modal-header {
  border-bottom: 1px solid rgba(81, 32, 60, 0.4);
  background: linear-gradient(135deg, rgba(36, 23, 38, 0.6) 0%, rgba(81, 32, 60, 0.3) 100%);
}

.dark-mode .modal-header::after {
  background: linear-gradient(
    to right,
    rgba(167, 56, 92, 0),
    rgba(167, 56, 92, 0.6),
    rgba(167, 56, 92, 0)
  );
}

.dark-mode .modal-header h2 {
  background: linear-gradient(135deg, #e14b6a, #a7385c, #6d1a36);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  text-shadow: 0 0 20px rgba(225, 75, 106, 0.4);
}

.dark-mode .close-modal {
  background: rgba(36, 23, 38, 0.6);
  border: 1px solid rgba(81, 32, 60, 0.4);
  color: #f8e9f0;
  box-shadow:
    0 2px 8px rgba(167, 56, 92, 0.12),
    inset 0 1px 0 rgba(248, 233, 240, 0.1);
}

.dark-mode .close-modal:hover {
  background-color: rgba(239, 68, 68, 0.2);
  border-color: rgba(225, 75, 106, 0.5);
  color: #e14b6a;
  box-shadow:
    0 4px 16px rgba(225, 75, 106, 0.3),
    0 0 20px rgba(225, 75, 106, 0.2);
}

.dark-mode .modal-body {
  background: linear-gradient(135deg, rgba(36, 23, 38, 0.2) 0%, rgba(81, 32, 60, 0.1) 100%);
}

.dark-mode .modal-body::before {
  background: radial-gradient(
    circle,
    rgba(167, 56, 92, 0.12) 0%,
    rgba(225, 75, 106, 0.06) 30%,
    transparent 70%
  );
}

.dark-mode .modal-footer {
  border-top: 1px solid rgba(81, 32, 60, 0.4);
  background: linear-gradient(135deg, rgba(36, 23, 38, 0.6) 0%, rgba(81, 32, 60, 0.2) 100%);
}

.dark-mode .modal-footer {
  border-top-color: #3f3f5f;
}

.dark-mode .form-group label {
  color: #a0a0b8;
  background: linear-gradient(90deg, #a0a0b8, #d1d1e0);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.dark-mode .select-wrapper::after {
  box-shadow: 0 0 0 1px rgba(63, 63, 95, 0.7);
}

.dark-mode .select-wrapper:hover::after {
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.5),
    0 0 20px rgba(34, 197, 94, 0.2);
}

.dark-mode .select-wrapper select {
  background-color: rgba(44, 44, 68, 0.8);
  color: #e2e2e2;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.2);
}

.dark-mode .select-wrapper select:focus {
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.6),
    0 0 25px rgba(34, 197, 94, 0.2);
}

.dark-mode .select-arrow {
  color: #a0a0b8;
}

.dark-mode .select-wrapper:hover .select-arrow {
  color: #22c55e;
}

.dark-mode .btn-secondary {
  background-color: rgba(44, 44, 68, 0.7);
  color: #e2e2e2;
  border: 1px solid rgba(63, 63, 95, 0.5);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

.dark-mode .btn-secondary:hover {
  background-color: rgba(63, 63, 95, 0.7);
  box-shadow: 0 0 15px rgba(255, 255, 255, 0.1);
}

.dark-mode .btn-primary {
  background: linear-gradient(135deg, #a7385c, #6d1a36);
  border: 1px solid rgba(167, 56, 92, 0.4);
  box-shadow:
    0 4px 16px rgba(167, 56, 92, 0.3),
    0 2px 8px rgba(167, 56, 92, 0.15),
    inset 0 1px 0 rgba(248, 233, 240, 0.1);
}

.dark-mode .btn-primary::before {
  background: linear-gradient(90deg, transparent 0%, rgba(225, 75, 106, 0.4) 50%, transparent 100%);
}

.dark-mode .btn-primary:hover {
  background: linear-gradient(135deg, #e14b6a, #a7385c);
  border-color: rgba(225, 75, 106, 0.5);
  box-shadow:
    0 6px 20px rgba(167, 56, 92, 0.4),
    0 4px 12px rgba(225, 75, 106, 0.3),
    inset 0 1px 0 rgba(248, 233, 240, 0.15);
}

/* Error message styling */
.error-message {
  color: #e53e3e;
  font-size: 0.875rem;
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
  gap: 6px;
  animation: errorPulse 1.5s infinite;
}

.error-message::before {
  content: '⚠️';
  font-size: 0.75rem;
}

@keyframes errorPulse {
  0% {
    opacity: 0.7;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.7;
  }
}

/* Dark mode error message styling */
.dark-mode .error-message {
  color: #fc8181;
  text-shadow: 0 0 8px rgba(252, 129, 129, 0.4);
}

/* Modern Quill editor styles */
.transfer-editor {
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
}

.transfer-editor:focus-within {
  border-color: #22c55e;
  box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.2);
}

.editor-error {
  border-color: #e53e3e !important;
}

.dark-mode .transfer-editor {
  border-color: #3f3f5f;
}

.dark-mode .transfer-editor:focus-within {
  border-color: #22c55e;
  box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.2);
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

/* Add fade animations */
</style>
