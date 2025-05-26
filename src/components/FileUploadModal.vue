<template>
  <div v-if="show" class="file-modal-overlay" @click="closeModal">
    <div class="file-modal-content" @click.stop>
      <div class="file-modal-header">
        <h3>{{ isArabic ? 'رفع ملف المناقلة' : 'Upload Transfer File' }}</h3>
        <button class="file-modal-close" @click="closeModal">×</button>
      </div>
      <div class="file-modal-body">
        <div
          class="file-upload-area"
          @click="triggerFileInput"
          @drop.prevent="handleFileDrop"
          @dragover.prevent
          @dragenter.prevent="dragActive = true"
          @dragleave.prevent="dragActive = false"
          :class="{ 'drag-active': dragActive, 'has-file': selectedFile }"
        >
          <div v-if="selectedFile" class="selected-file-info">
            <div class="file-icon">
              <span class="file-icon-text">XLSX</span>
            </div>
            <div class="file-details">
              <span class="file-name">{{ selectedFile.name }}</span>
              <span class="file-size">{{ formatFileSize(selectedFile.size) }}</span>
            </div>
            <button class="remove-file-btn" @click.stop="removeSelectedFile">×</button>
          </div>
          <div v-else class="upload-placeholder">
            <div class="upload-icon">↑</div>
            <p>
              {{ isArabic ? 'اسحب وأفلت ملف Excel أو' : 'Drag & drop Excel file or' }}
              <span class="browse-text">{{ isArabic ? 'تصفح' : 'browse' }}</span>
            </p>
            <p class="file-format-note">
              {{ isArabic ? 'ملفات Excel (.xlsx, .xls) فقط' : 'Excel files (.xlsx, .xls) only' }}
            </p>
          </div>
        </div>

        <div class="upload-actions">
          <button
            class="btn-file-upload"
            @click="uploadFile"
            :disabled="!selectedFile || isUploading"
            :class="{ 'btn-disabled': !selectedFile || isUploading }"
          >
            <span v-if="isUploading" class="upload-spinner"></span>
            <span v-else class="btn-icon">↑</span>
            {{ isArabic ? 'رفع الملف' : 'Upload File' }}
          </button>
          <button class="btn-file-cancel" @click="closeModal">
            {{ isArabic ? 'إلغاء' : 'Cancel' }}
          </button>
        </div>

        <!-- Status message -->
        <div v-if="statusMessage.message" :class="['upload-status', statusMessage.type]">
          <span class="status-icon">{{ statusMessage.type === 'success' ? '✓' : '!' }}</span>
          <span class="status-message">{{ statusMessage.message }}</span>
        </div>
      </div>
    </div>
  </div>

  <!-- Hidden file input -->
  <input
    type="file"
    ref="fileInput"
    class="hidden-file-input"
    @change="handleFileSelection"
    accept=".xlsx,.xls"
  />
</template>

<script setup lang="js">
import { ref } from 'vue'
import transferService from '@/services/TransferService'

// Define props
const props = defineProps({
  show: Boolean,
  isArabic: Boolean,
  transactionId: Number,
  authToken: String,
})

// Define emits
const emit = defineEmits(['close', 'upload-success'])

// State variables
const fileInput = ref(null)
const selectedFile = ref(null)
const dragActive = ref(false)
const isUploading = ref(false)
const statusMessage = ref({ type: '', message: '' })

// Close the modal
const closeModal = () => {
  emit('close')
}

// Trigger file input click
const triggerFileInput = () => {
  if (!selectedFile.value) {
    fileInput.value.click()
  }
}

// Handle file selection from input
const handleFileSelection = (event) => {
  const file = event.target.files[0]
  if (file && isValidExcelFile(file)) {
    selectedFile.value = file
    statusMessage.value = { type: '', message: '' }
  } else if (file) {
    statusMessage.value = {
      type: 'error',
      message: props.isArabic
        ? 'يرجى تحديد ملف Excel صالح (.xlsx, .xls)'
        : 'Please select a valid Excel file (.xlsx, .xls)',
    }
  }
  // Reset the input so the same file can be selected again if needed
  event.target.value = ''
}

// Handle file drop
const handleFileDrop = (event) => {
  dragActive.value = false
  const file = event.dataTransfer.files[0]
  if (file && isValidExcelFile(file)) {
    selectedFile.value = file
    statusMessage.value = { type: '', message: '' }
  } else if (file) {
    statusMessage.value = {
      type: 'error',
      message: props.isArabic
        ? 'يرجى تحديد ملف Excel صالح (.xlsx, .xls)'
        : 'Please select a valid Excel file (.xlsx, .xls)',
    }
  }
}

// Check if file is a valid Excel file
const isValidExcelFile = (file) => {
  const validTypes = [
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ]
  const validExtensions = ['.xlsx', '.xls']

  const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'))
  return validTypes.includes(file.type) || validExtensions.includes(fileExtension)
}

// Format file size
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Remove selected file
const removeSelectedFile = () => {
  selectedFile.value = null
  statusMessage.value = { type: '', message: '' }
}

// Upload file to API
const uploadFile = async () => {
  if (!selectedFile.value || isUploading.value) return

  isUploading.value = true
  statusMessage.value = { type: '', message: '' }

  try {
    // Use transferService instead of direct axios call
    await transferService.uploadExcelFile(selectedFile.value, props.transactionId)

    // If successful - set success message
    statusMessage.value = {
      type: 'success',
      message: props.isArabic
        ? `تم رفع الملف بنجاح: ${selectedFile.value.name}`
        : `File uploaded successfully: ${selectedFile.value.name}`,
    }

    // Emit success event for data refresh
    emit('upload-success')

    // Immediately close the modal after successful upload
    emit('close')
  } catch (err) {
    console.error('Error uploading file:', err)

    // Set error message
    statusMessage.value = {
      type: 'error',
      message: props.isArabic
        ? 'فشل في رفع الملف. يرجى التحقق من تنسيق الملف والمحاولة مرة أخرى.'
        : 'Failed to upload file. Please check file format and try again.',
    }
  } finally {
    isUploading.value = false
  }
}
</script>

<style src="@/styles/FileUploadModal.css" scoped></style>
