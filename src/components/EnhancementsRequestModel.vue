<template>
  <div v-if="modelValue" class="modal-overlay" @click="closeModal">
    <div class="modal-container" :class="{ 'dark-mode': isDarkMode }" @click.stop>
      <div class="modal-header">
        <h2>{{ isArabic ? 'طلب تعزيز جديد' : 'New Enhancement Request' }}</h2>
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

        <!-- Reason for Enhancement Field (renamed from Transfer) -->
        <div class="form-group">
          <label for="enhancementReason" class="required">
            {{ isArabic ? 'سبب التعزيز' : 'Reason for Enhancement' }}
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
import axios from 'axios'
import { useAuthStore } from '@/stores/authStore'
import FuturisticPopup from '@/components/FuturisticPopup.vue'

// Define component props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
})

// Define emits
const emit = defineEmits(['update:modelValue', 'submit'])

// API configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

// Get auth store for token
const authStore = useAuthStore()

// Track editor state
const editorContent = ref('<p>Enter your reason here...</p>')
const editorError = ref(false)
const newRequest = ref({
  timePeriod: '',
  enhancementReason: '',
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

// Functions to show custom notifications - replace SweetAlert with FuturisticPopup
function showValidationError() {
  popupType.value = 'warning'
  popupTitle.value = isArabic.value ? 'تحقق من البيانات' : 'Validation Error'
  popupMessage.value = isArabic.value
    ? 'يرجى ملء جميع الحقول المطلوبة'
    : 'Please fill all required fields'
  showPopup.value = true
}

function showErrorNotification(error: any) {
  console.error('Error creating enhancement request:', error)

  popupType.value = 'error'
  popupTitle.value = isArabic.value ? 'خطأ!' : 'Error!'
  popupMessage.value = isArabic.value ? 'حدث خطأ أثناء إنشاء الطلب' : 'Error creating request'
  showPopup.value = true
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
    enhancementReason: '',
  }
  editorContent.value = '<p></p>'
  editorError.value = false
}

async function submitForm() {
  // Validate fields
  const isDefaultContent =
    editorContent.value === '<p></p>' ||
    editorContent.value === '<p><br></p>' ||
    editorContent.value === ''

  if (!newRequest.value.timePeriod || isDefaultContent) {
    // Show error for editor if it's empty or has default content
    if (isDefaultContent) {
      editorError.value = true
    }

    showValidationError()
    return
  }

  // Reset error state
  editorError.value = false

  try {
    // Prepare API payload
    const payload = {
      transaction_date: newRequest.value.timePeriod,
      notes: editorContent.value,
      type: 'AFR',
    }

    // Make API call to create new enhancement
    const response = await axios.post(`${API_BASE_URL}/api/budget/transfers/create/`, payload, {
      headers: {
        Authorization: `Bearer ${authStore.token}`,
        'Content-Type': 'application/json',
      },
    })

    // Emit the submit event with the response data
    emit('submit', response.data)

    // Close the modal
    closeModal()
  } catch (error) {
    showErrorNotification(error)
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
/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(10, 10, 20, 0.6);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
  animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.modal-container {
  background-color: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  width: 95%;
  max-width: 600px;
  border-radius: 16px;
  box-shadow:
    0 15px 40px rgba(0, 0, 0, 0.15),
    0 0 0 1px rgba(255, 255, 255, 0.2);
  overflow: hidden;
  transform-style: preserve-3d;
  perspective: 1000px;
  animation: slideIn 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid rgba(226, 232, 240, 0.3);
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  background: linear-gradient(
    to right,
    rgba(255, 255, 255, 0),
    rgba(255, 255, 255, 0.1),
    rgba(255, 255, 255, 0)
  );
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
    rgba(190, 190, 255, 0),
    rgba(190, 190, 255, 0.5),
    rgba(190, 190, 255, 0)
  );
}

.modal-header h2 {
  margin: 0;
  font-size: 1.35rem;
  font-weight: 600;
  letter-spacing: -0.02em;
  background: linear-gradient(135deg, #1a1a2e, #4a0d20);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  text-shadow: 0 0 20px rgba(255, 255, 255, 0.2);
}

.close-modal {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
  overflow: hidden;
  color: #6b7280;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.close-modal::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.2) 0%, transparent 70%);
  opacity: 0;
  transform: scale(0.5);
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.close-modal:hover {
  background-color: rgba(239, 68, 68, 0.15);
  color: #ef4444;
  transform: rotate(90deg) scale(1.1);
  box-shadow: 0 0 15px rgba(239, 68, 68, 0.2);
}

.close-modal:hover::before {
  opacity: 1;
  transform: scale(1.5);
}

.modal-body {
  padding: 1.75rem;
  background: rgba(255, 255, 255, 0.03);
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
    rgba(94, 234, 212, 0.05) 0%,
    rgba(94, 234, 212, 0.02) 30%,
    transparent 70%
  );
  pointer-events: none;
  z-index: 1;
}

.modal-footer {
  padding: 1.25rem 1.75rem;
  border-top: 1px solid rgba(226, 232, 240, 0.3);
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  position: relative;
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0), rgba(255, 255, 255, 0.05));
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
    0 0 0 1px rgba(109, 26, 54, 0.4),
    0 0 20px rgba(109, 26, 54, 0.1);
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
    0 0 0 1px rgba(109, 26, 54, 0.6),
    0 0 25px rgba(109, 26, 54, 0.15);
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
  color: #6d1a36;
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
  background: linear-gradient(135deg, #6d1a36, #4a0d20);
  color: #fff;
  border: none;
  padding: 0.7rem 1.4rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow:
    0 4px 12px rgba(109, 26, 54, 0.25),
    0 0 0 1px rgba(109, 26, 54, 0.5);
  position: relative;
  overflow: hidden;
  letter-spacing: 0.01em;
}

.btn-primary::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.2) 50%,
    transparent 100%
  );
  transition: all 0.6s ease;
}

.btn-primary:hover {
  background: linear-gradient(135deg, #7d2a46, #5a1d30);
  transform: translateY(-3px);
  box-shadow:
    0 6px 15px rgba(109, 26, 54, 0.3),
    0 0 0 1px rgba(109, 26, 54, 0.6);
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
.dark-mode {
  background-color: rgba(26, 26, 46, 0.9);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  border: 1px solid rgba(63, 63, 95, 0.3);
  box-shadow:
    0 15px 40px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(63, 63, 95, 0.6),
    inset 0 0 50px rgba(0, 0, 0, 0.1);
}

.dark-mode .modal-header {
  border-bottom: none;
  background: linear-gradient(
    to right,
    rgba(60, 60, 80, 0),
    rgba(60, 60, 80, 0.1),
    rgba(60, 60, 80, 0)
  );
}

.dark-mode .modal-header h2 {
  background: linear-gradient(90deg, #5eead4, #c4b5fd);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  text-shadow: 0 0 20px rgba(94, 234, 212, 0.3);
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
    0 0 0 1px rgba(94, 234, 212, 0.5),
    0 0 20px rgba(94, 234, 212, 0.2);
}

.dark-mode .select-wrapper select {
  background-color: rgba(44, 44, 68, 0.8);
  color: #e2e2e2;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.2);
}

.dark-mode .select-wrapper select:focus {
  box-shadow:
    0 0 0 1px rgba(94, 234, 212, 0.6),
    0 0 25px rgba(94, 234, 212, 0.2);
}

.dark-mode .select-arrow {
  color: #a0a0b8;
}

.dark-mode .select-wrapper:hover .select-arrow {
  color: #5eead4;
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
  background: linear-gradient(135deg, #7d2a46, #5a1d30);
  box-shadow:
    0 4px 8px rgba(0, 0, 0, 0.3),
    0 0 20px rgba(125, 42, 70, 0.2);
  position: relative;
  overflow: hidden;
}

.dark-mode .btn-primary::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0) 50%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.dark-mode .btn-primary:hover::before {
  opacity: 1;
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
