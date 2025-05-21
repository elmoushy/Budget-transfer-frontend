<template>
  <div v-if="show" class="modal-overlay" @click="closeModal">
    <div class="file-modal-container" :class="{ 'dark-mode': isDarkMode }" @click.stop>
      <div class="modal-header">
        <h2>{{ isArabic ? 'إدارة المرفقات' : 'Manage Attachments' }}</h2>
        <button class="close-modal" @click="closeModal">×</button>
      </div>
      <div class="modal-body file-modal-body">
        <!-- File upload form -->
        <div class="file-upload-section">
          <h3>{{ isArabic ? 'تحميل ملف جديد' : 'Upload New File' }}</h3>
          <div
            class="file-drop-zone"
            :class="{ 'file-drop-active': isDragging }"
            @dragover.prevent="isDragging = true"
            @dragleave="isDragging = false"
            @drop.prevent="handleFileDrop"
          >
            <input
              type="file"
              ref="fileInput"
              @change="handleFileSelect"
              class="file-input"
              :accept="allowedFileTypes.join(',')"
            />
            <div class="drop-zone-content">
              <UploadCloudIcon size="48" />
              <p>{{ isArabic ? 'اسحب وأفلت الملف هنا أو' : 'Drag and drop files here or' }}</p>
              <button class="btn-secondary" @click="$refs.fileInput.click()">
                {{ isArabic ? 'اختر ملفًا' : 'Browse files' }}
              </button>
              <p class="file-types">
                {{ isArabic ? 'الملفات المسموح بها' : 'Allowed files' }}: .xlsx, .pdf, .doc, .docx
              </p>
            </div>
            <div v-if="selectedFile" class="selected-file">
              <FileIcon size="18" />
              <span>{{ selectedFile.name }}</span>
              <button class="clear-file" @click.prevent="clearSelectedFile">×</button>
            </div>
            <div v-if="fileError" class="file-error">{{ fileError }}</div>
          </div>
          <button
            class="btn-primary upload-btn"
            :disabled="!selectedFile || uploading"
            @click="uploadFile"
          >
            <span v-if="!uploading">
              {{ isArabic ? 'تحميل الملف' : 'Upload File' }}
            </span>
            <span v-else>
              {{ isArabic ? 'جاري التحميل...' : 'Uploading...' }}
            </span>
          </button>
        </div>

        <!-- File list -->
        <div class="file-list-section">
          <h3>{{ isArabic ? 'المرفقات الحالية' : 'Current Attachments' }}</h3>
          <div v-if="loadingFiles" class="loading-files">
            {{ isArabic ? 'جاري تحميل المرفقات...' : 'Loading attachments...' }}
          </div>
          <div v-else-if="files.length === 0" class="no-files">
            {{ isArabic ? 'لا توجد مرفقات لهذه المعاملة' : 'No attachments for this transaction' }}
          </div>
          <ul v-else class="file-list">
            <li v-for="file in files" :key="file.attachment_id" class="file-item">
              <div class="file-info">
                <FileIcon size="18" />
                <span class="file-name">{{ file.file_name }}</span>
                <span class="file-size">{{ formatFileSize(file.file_size) }}</span>
                <span class="file-date">{{ formatDate(file.upload_date) }}</span>
              </div>
              <div class="file-actions">
                <button @click="downloadAttachment(file)" class="icon-btn" title="Download">
                  <DownloadIcon size="18" />
                </button>
                <!-- Add delete button if needed -->
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, defineProps, defineEmits } from 'vue'
import { FileIcon, DownloadIcon, UploadCloudIcon } from 'lucide-vue-next'
import { useThemeStore } from '@/stores/themeStore'
import transferService from '@/services/transferService'
import Swal from 'sweetalert2'
import '@/assets/css/AttachmentModal.css'

// Define props and emits
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

const emit = defineEmits(['update:show', 'files-updated'])

// Theme and language setup
const themeStore = useThemeStore()
const isDarkMode = ref(false)
const isArabic = ref(false)

// File handling refs
const files = ref([])
const loadingFiles = ref(false)
const selectedFile = ref(null)
const fileInput = ref(null)
const isDragging = ref(false)
const uploading = ref(false)
const fileError = ref('')
const allowedFileTypes = ref(['.xlsx', '.pdf', '.doc', '.docx', '.xls'])

// Watch for theme and language changes
watch(
  () => themeStore.darkMode,
  (value) => {
    isDarkMode.value = value
  },
  { immediate: true },
)

watch(
  () => themeStore.language,
  (value) => {
    isArabic.value = value === 'ar'
  },
  { immediate: true },
)

// Watch for transaction ID changes to load files
watch(
  () => props.transactionId,
  (newId) => {
    if (newId && props.show) {
      loadFiles()
    }
  },
)

// Format the date
function formatDate(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString()
}

// Format file size
function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

// Close the modal
function closeModal() {
  emit('update:show', false)
  clearSelectedFile()
}

// Load files for the current transaction
async function loadFiles() {
  if (!props.transactionId) return
  loadingFiles.value = true

  try {
    const response = await transferService.listFiles(props.transactionId)
    if (response && response.attachments) {
      files.value = response.attachments
    } else {
      files.value = []
    }
  } catch (error) {
    console.error('Error loading files:', error)
    files.value = []
  } finally {
    loadingFiles.value = false
  }
}

// Handle file selection
function handleFileSelect(event) {
  const file = event.target.files[0]
  if (file) {
    validateAndSetFile(file)
  }
}

// Handle file drop
function handleFileDrop(event) {
  isDragging.value = false
  const file = event.dataTransfer.files[0]
  if (file) {
    validateAndSetFile(file)
  }
}

// Validate and set the selected file
function validateAndSetFile(file) {
  // Validate file size (e.g., max 5MB)
  const maxSize = 5 * 1024 * 1024 // 5MB in bytes
  if (file.size > maxSize) {
    fileError.value = isArabic.value
      ? 'حجم الملف كبير جدًا. الحد الأقصى هو 5 ميغابايت.'
      : 'File is too large. Maximum size is 5MB.'
    return
  }

  // Validate file type
  const fileExtension = '.' + file.name.split('.').pop().toLowerCase()
  if (!allowedFileTypes.value.includes(fileExtension)) {
    fileError.value = isArabic.value
      ? 'نوع الملف غير مدعوم. الأنواع المدعومة هي: .xlsx، .pdf، .doc، .docx'
      : 'File type not allowed. Allowed types are: .xlsx, .pdf, .doc, .docx'
    return
  }

  // Clear any previous errors
  fileError.value = ''
  selectedFile.value = file
}

// Clear the selected file
function clearSelectedFile() {
  selectedFile.value = null
  fileError.value = ''
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

// Upload a file
async function uploadFile() {
  if (!selectedFile.value || !props.transactionId) return

  uploading.value = true
  try {
    await transferService.uploadFile(selectedFile.value, props.transactionId)
    clearSelectedFile()
    loadFiles() // Refresh the file list
    emit('files-updated')

    // Replace alert with SweetAlert2
    Swal.fire({
      title: isArabic.value ? 'تم بنجاح!' : 'Success!',
      text: isArabic.value ? 'تم تحميل الملف بنجاح' : 'File uploaded successfully',
      icon: 'success',
      background: isDarkMode.value ? '#333' : '#fff',
      color: isDarkMode.value ? '#fff' : '#333',
      confirmButtonText: isArabic.value ? 'حسنًا' : 'OK',
      timer: 3000,
      timerProgressBar: true,
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
    })
  } catch (error) {
    console.error('Error uploading file:', error)
    fileError.value = isArabic.value
      ? 'حدث خطأ أثناء تحميل الملف. يرجى المحاولة مرة أخرى.'
      : 'Error uploading file. Please try again.'
  } finally {
    uploading.value = false
  }
}

// Download attachment
function downloadAttachment(file) {
  // decode base64
  const binaryString = atob(file.file_data)
  const len = binaryString.length
  const bytes = new Uint8Array(len)
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }
  // create blob and trigger download
  const blob = new Blob([bytes], { type: file.file_type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = file.file_name
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
</script>
