<template>
  <div v-if="modelValue" class="modal-overlay" @click="closeModal">
    <div class="oracle-modal-container" :class="{ 'dark-mode': isDarkMode }" @click.stop>
      <div class="modal-header">
        <h2>{{ isArabic ? 'حالة نظام الأوراكل' : 'Oracle ERP Status' }}</h2>
        <button class="close-modal" @click="closeModal">×</button>
      </div>
      <div class="modal-body oracle-pipeline-body">
        <!-- Waiting for ERP connection message -->
        <div class="waiting-for-erp">
          <div class="waiting-icon">
            <i class="fas fa-sync-alt fa-spin"></i>
          </div>
          <div class="waiting-message">
            {{ isArabic ? 'في انتظار الاتصال بنظام ERP...' : 'Waiting to connect to ERP...' }}
          </div>
          <div class="waiting-description">
            {{
              isArabic
                ? 'جاري محاولة الاتصال بنظام أوراكل للمؤسسة'
                : 'Attempting to establish connection with Oracle Enterprise System'
            }}
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
})

// Define emits
const emit = defineEmits(['update:modelValue'])

// Theme & Language
const themeStore = useThemeStore()
const isArabic = computed(() => themeStore.language === 'ar')
const isDarkMode = computed(() => themeStore.darkMode)

// Methods
function closeModal() {
  emit('update:modelValue', false)
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
.oracle-modal-container {
  background-color: white;
  width: 95%;
  max-width: 500px;
  border-radius: 16px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  animation: slideIn 0.3s ease;
  border-top: 4px solid #2563eb;
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

/* Oracle Waiting Styles */
.oracle-pipeline-body {
  padding: 2rem;
  overflow-x: auto;
}

/* Waiting for ERP styling */
.waiting-for-erp {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 2rem;
  min-height: 150px;
}

.waiting-icon {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background-color: rgba(37, 99, 235, 0.15);
  color: #2563eb;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.8rem;
  margin-bottom: 1.5rem;
  animation: pulse 2s infinite;
}

.waiting-message {
  font-size: 1.4rem;
  font-weight: 500;
  color: #2563eb;
  margin-bottom: 0.75rem;
}

.waiting-description {
  font-size: 0.95rem;
  color: #6b7280;
  max-width: 300px;
  line-height: 1.5;
}

/* Dark Mode Styles */
.dark-mode.oracle-modal-container {
  background-color: #1a1a2e;
  border: 1px solid #3f3f5f;
  border-top: 4px solid #3b82f6;
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

.dark-mode .waiting-icon {
  background-color: rgba(59, 130, 246, 0.2);
  color: #3b82f6;
}

.dark-mode .waiting-message {
  color: #3b82f6;
}

.dark-mode .waiting-description {
  color: #d1d5db;
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

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.4);
    transform: scale(1);
  }
  70% {
    box-shadow: 0 0 0 15px rgba(37, 99, 235, 0);
    transform: scale(1.05);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(37, 99, 235, 0);
    transform: scale(1);
  }
}

.dark-mode @keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4);
  }
  70% {
    box-shadow: 0 0 0 15px rgba(59, 130, 246, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
  }
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .waiting-icon {
    width: 80px;
    height: 80px;
    font-size: 2.2rem;
  }

  .waiting-message {
    font-size: 1.2rem;
  }
}
</style>
