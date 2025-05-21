<template>
  <div v-if="modelValue" class="modal-overlay" @click="closeModal">
    <div class="modal-container" :class="{ 'dark-mode': isDarkMode }" @click.stop>
      <div class="modal-header">
        <h2>{{ isArabic ? 'تعديل المناقلة' : 'Edit Transfer' }}</h2>
        <button class="close-modal" @click="closeModal">×</button>
      </div>

      <div class="modal-body">
        <!-- Time Period Field -->
        <div class="form-group">
          <label for="timePeriod" class="required">
            {{ isArabic ? 'الفترة الزمنية' : 'Time Period' }}
          </label>
          <div class="select-wrapper">
            <select id="timePeriod" v-model="editRequest.timePeriod" required>
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
        <button class="btn-primary submit-btn" @click="submitForm">
          {{ isArabic ? 'حفظ التغييرات' : 'Save Changes' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useThemeStore } from '@/stores/themeStore'
import { useAuthStore } from '@/stores/authStore'
import { QuillEditor } from '@vueup/vue-quill'
import axios from 'axios'
import Swal from 'sweetalert2'

// Define component props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  transferData: {
    type: Object,
    required: true,
    default: () => ({}),
  },
})

// Define emits
const emit = defineEmits(['update:modelValue', 'submit'])

// API configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

// Get auth store for token
const authStore = useAuthStore()

// Track editor state
const editorContent = ref('')
const editorError = ref(false)
const editRequest = ref({
  timePeriod: '',
  transferId: null,
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

// Methods
function closeModal() {
  emit('update:modelValue', false)
}

// Watch for transferData changes and update form fields
watch(
  () => props.transferData,
  (newData) => {
    if (newData && Object.keys(newData).length > 0) {
      editRequest.value.timePeriod = newData.transaction_date || ''
      editRequest.value.transferId = newData.transaction_id
      editorContent.value = newData.notes || '<p>Enter your reason here...</p>'
    }
  },
  { immediate: true, deep: true },
)

// Watch for modal opening
watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen && props.transferData) {
      editRequest.value.timePeriod = props.transferData.transaction_date || ''
      editRequest.value.transferId = props.transferData.transaction_id
      editorContent.value = props.transferData.notes || '<p>Enter your reason here...</p>'
    }
  },
)

async function submitForm() {
  // Validate fields
  const isDefaultContent =
    editorContent.value === '<p>Enter your reason here...</p>' ||
    editorContent.value === '<p><br></p>' ||
    editorContent.value === ''

  if (!editRequest.value.timePeriod || isDefaultContent) {
    if (isDefaultContent) {
      editorError.value = true
    }

    Swal.fire({
      title: isArabic.value ? 'تنبيه' : 'Warning',
      text: isArabic.value ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill all required fields',
      icon: 'warning',
      background: isDarkMode.value ? '#1a1a2e' : '#fff',
      color: isDarkMode.value ? '#e2e2e2' : '#1a202c',
      confirmButtonText: isArabic.value ? 'حسناً' : 'OK',
      confirmButtonColor: '#6d1a36',
      showClass: {
        popup: 'animate__animated animate__fadeInDown animate__faster',
      },
      hideClass: {
        popup: 'animate__animated animate__fadeOutUp animate__faster',
      },
    })
    return
  }

  // Reset error state
  editorError.value = false

  try {
    // Prepare API payload with type:"FAR" instead of "AFR"
    const payload = {
      transaction_date: editRequest.value.timePeriod,
      notes: editorContent.value,
      type: 'FAR', // Changed from 'AFR' to 'FAR'
    }

    // Make API call to update the transfer
    const response = await axios.put(
      `${API_BASE_URL}/api/budget/transfers/${editRequest.value.transferId}/update/`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${authStore.token}`,
          'Content-Type': 'application/json',
        },
      },
    )

    // Success notification
    Swal.fire({
      title: isArabic.value ? 'تم بنجاح' : 'Success',
      text: isArabic.value
        ? 'تم تحديث طلب المناقلة بنجاح'
        : 'Transfer request updated successfully',
      icon: 'success',
      background: isDarkMode.value ? '#1a1a2e' : '#fff',
      color: isDarkMode.value ? '#e2e2e2' : '#1a202c',
      confirmButtonText: isArabic.value ? 'حسناً' : 'OK',
      confirmButtonColor: '#6d1a36',
      timer: 3000,
      timerProgressBar: true,
      showClass: {
        popup: 'animate__animated animate__fadeInDown animate__faster',
      },
      hideClass: {
        popup: 'animate__animated animate__fadeOutUp animate__faster',
      },
    })

    // Emit the submit event with the response data
    emit('submit', response.data)

    // Close the modal
    closeModal()
  } catch (error) {
    console.error('Error updating transfer request:', error)

    Swal.fire({
      title: isArabic.value ? 'خطأ' : 'Error',
      text: isArabic.value ? 'حدث خطأ أثناء تحديث الطلب' : 'Error updating request',
      icon: 'error',
      background: isDarkMode.value ? '#1a1a2e' : '#fff',
      color: isDarkMode.value ? '#e2e2e2' : '#1a202c',
      confirmButtonText: isArabic.value ? 'حسناً' : 'OK',
      confirmButtonColor: '#6d1a36',
      showClass: {
        popup: 'animate__animated animate__fadeInDown animate__faster',
      },
      hideClass: {
        popup: 'animate__animated animate__fadeOutUp animate__faster',
      },
    })
  }
}
</script>

<style scoped>
/* The same CSS as in NewRequestModal.vue */
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

.submit-btn {
  min-width: 100px;
}

/* Dark mode modal styles */
.dark-mode {
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

.dark-mode .btn-secondary {
  background-color: #2c2c44;
  color: #e2e2e2;
  border-color: #3f3f5f;
}

.dark-mode .btn-secondary:hover {
  background-color: #3f3f5f;
}

.dark-mode .btn-primary {
  background: linear-gradient(135deg, #7d2a46, #5a1d30);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
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
