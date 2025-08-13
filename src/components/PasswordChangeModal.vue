<template>
  <div v-if="isVisible" class="modal-overlay" @click="closeModal">
    <div class="modal-container" @click.stop>
      <div class="modal-header">
        <h2>{{ isArabic ? 'تغيير كلمة المرور' : 'Change Password' }}</h2>
        <button class="close-btn" @click="closeModal">
          <XIcon :size="20" />
        </button>
      </div>

      <form @submit.prevent="handlePasswordChange" class="password-form">
        <div class="form-group">
          <label for="currentPassword">
            {{ isArabic ? 'كلمة المرور الحالية' : 'Current Password' }}
          </label>
          <div class="input-wrapper">
            <input
              id="currentPassword"
              v-model="currentPassword"
              :type="showCurrentPassword ? 'text' : 'password'"
              :placeholder="isArabic ? 'أدخل كلمة المرور الحالية' : 'Enter current password'"
              required
              :class="{ error: currentPasswordError }"
            />
            <button
              type="button"
              class="toggle-password"
              @click="showCurrentPassword = !showCurrentPassword"
            >
              <EyeIcon v-if="!showCurrentPassword" :size="16" />
              <EyeOffIcon v-else :size="16" />
            </button>
          </div>
          <span v-if="currentPasswordError" class="error-text">{{ currentPasswordError }}</span>
        </div>

        <div class="form-group">
          <label for="newPassword">
            {{ isArabic ? 'كلمة المرور الجديدة' : 'New Password' }}
          </label>
          <div class="input-wrapper">
            <input
              id="newPassword"
              v-model="newPassword"
              :type="showNewPassword ? 'text' : 'password'"
              :placeholder="isArabic ? 'أدخل كلمة المرور الجديدة' : 'Enter new password'"
              required
              :class="{ error: newPasswordError }"
            />
            <button
              type="button"
              class="toggle-password"
              @click="showNewPassword = !showNewPassword"
            >
              <EyeIcon v-if="!showNewPassword" :size="16" />
              <EyeOffIcon v-else :size="16" />
            </button>
          </div>
          <span v-if="newPasswordError" class="error-text">{{ newPasswordError }}</span>
          <div class="password-requirements">
            <p>{{ isArabic ? 'متطلبات كلمة المرور:' : 'Password requirements:' }}</p>
            <ul>
              <li :class="{ valid: hasMinLength }">
                {{ isArabic ? 'على الأقل 8 أحرف' : 'At least 8 characters' }}
              </li>
              <li :class="{ valid: hasUppercase }">
                {{
                  isArabic ? 'حرف كبير واحد على الأقل (A-Z)' : 'At least one uppercase letter (A-Z)'
                }}
              </li>
              <li :class="{ valid: hasLowercase }">
                {{
                  isArabic ? 'حرف صغير واحد على الأقل (a-z)' : 'At least one lowercase letter (a-z)'
                }}
              </li>
              <li :class="{ valid: hasDigit }">
                {{ isArabic ? 'رقم واحد على الأقل (0-9)' : 'At least one digit (0-9)' }}
              </li>
              <li :class="{ valid: hasSpecialChar }">
                {{
                  isArabic
                    ? 'رمز خاص واحد على الأقل (!@#$%^&*...)'
                    : 'At least one special character (!@#$%^&*...)'
                }}
              </li>
            </ul>
          </div>
        </div>

        <div class="form-group">
          <label for="confirmPassword">
            {{ isArabic ? 'تأكيد كلمة المرور الجديدة' : 'Confirm New Password' }}
          </label>
          <div class="input-wrapper">
            <input
              id="confirmPassword"
              v-model="confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              :placeholder="isArabic ? 'أعد إدخال كلمة المرور الجديدة' : 'Re-enter new password'"
              required
              :class="{ error: confirmPasswordError }"
            />
            <button
              type="button"
              class="toggle-password"
              @click="showConfirmPassword = !showConfirmPassword"
            >
              <EyeIcon v-if="!showConfirmPassword" :size="16" />
              <EyeOffIcon v-else :size="16" />
            </button>
          </div>
          <span v-if="confirmPasswordError" class="error-text">{{ confirmPasswordError }}</span>
        </div>

        <div v-if="generalError" class="error-message">{{ generalError }}</div>
        <div v-if="successMessage" class="success-message">{{ successMessage }}</div>

        <div class="form-actions">
          <button type="button" class="cancel-btn" @click="closeModal">
            {{ isArabic ? 'إلغاء' : 'Cancel' }}
          </button>
          <button type="submit" class="submit-btn" :disabled="!isFormValid || isLoading">
            <span v-if="isLoading" class="loader"></span>
            <span v-else>{{ isArabic ? 'تغيير كلمة المرور' : 'Change Password' }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useThemeStore } from '@/stores/themeStore'
import { useAuthStore } from '@/stores/authStore'
import { EyeIcon, EyeOffIcon, XIcon } from 'lucide-vue-next'

interface Props {
  isVisible: boolean
}

interface Emits {
  (e: 'close'): void
  (e: 'success'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const themeStore = useThemeStore()
const authStore = useAuthStore()

const isArabic = computed(() => themeStore.language === 'ar')

// Form state
const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)

// Error state
const currentPasswordError = ref('')
const newPasswordError = ref('')
const confirmPasswordError = ref('')
const generalError = ref('')
const successMessage = ref('')
const isLoading = ref(false)

// Password validation
const hasMinLength = computed(() => newPassword.value.length >= 8)
const hasUppercase = computed(() => /[A-Z]/.test(newPassword.value))
const hasLowercase = computed(() => /[a-z]/.test(newPassword.value))
const hasDigit = computed(() => /\d/.test(newPassword.value))
const hasSpecialChar = computed(() => /[!@#$%^&*(),.?":{}|<>]/.test(newPassword.value))

const isPasswordValid = computed(
  () =>
    hasMinLength.value &&
    hasUppercase.value &&
    hasLowercase.value &&
    hasDigit.value &&
    hasSpecialChar.value,
)

const isFormValid = computed(
  () =>
    currentPassword.value.trim() !== '' &&
    newPassword.value.trim() !== '' &&
    confirmPassword.value.trim() !== '' &&
    isPasswordValid.value &&
    newPassword.value === confirmPassword.value,
)

// Watch for password confirmation
watch([newPassword, confirmPassword], () => {
  if (confirmPassword.value && newPassword.value !== confirmPassword.value) {
    confirmPasswordError.value = isArabic.value
      ? 'كلمات المرور غير متطابقة'
      : 'Passwords do not match'
  } else {
    confirmPasswordError.value = ''
  }
})

// Clear errors when form is reopened
watch(
  () => props.isVisible,
  (newValue) => {
    if (newValue) {
      resetForm()
    }
  },
)

function resetForm() {
  currentPassword.value = ''
  newPassword.value = ''
  confirmPassword.value = ''
  currentPasswordError.value = ''
  newPasswordError.value = ''
  confirmPasswordError.value = ''
  generalError.value = ''
  successMessage.value = ''
  showCurrentPassword.value = false
  showNewPassword.value = false
  showConfirmPassword.value = false
}

function closeModal() {
  resetForm()
  emit('close')
}

async function handlePasswordChange() {
  // Reset errors
  currentPasswordError.value = ''
  newPasswordError.value = ''
  confirmPasswordError.value = ''
  generalError.value = ''
  successMessage.value = ''

  // Validate form
  if (!currentPassword.value.trim()) {
    currentPasswordError.value = isArabic.value
      ? 'كلمة المرور الحالية مطلوبة'
      : 'Current password is required'
    return
  }

  if (!isPasswordValid.value) {
    newPasswordError.value = isArabic.value
      ? 'كلمة المرور لا تلبي المتطلبات'
      : 'Password does not meet requirements'
    return
  }

  if (newPassword.value !== confirmPassword.value) {
    confirmPasswordError.value = isArabic.value
      ? 'كلمات المرور غير متطابقة'
      : 'Passwords do not match'
    return
  }

  isLoading.value = true

  try {
    const result = await authStore.changePassword(currentPassword.value, newPassword.value)

    if (result.success) {
      successMessage.value = result.message
      setTimeout(() => {
        emit('success')
        closeModal()
      }, 2000)
    } else {
      generalError.value = result.message
    }
  } catch (error) {
    console.error('Password change error:', error)
    generalError.value = isArabic.value
      ? 'حدث خطأ أثناء تغيير كلمة المرور'
      : 'An error occurred while changing password'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

.modal-container {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: background-color 0.2s;
}

.close-btn:hover {
  background-color: #f3f4f6;
}

.password-form {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #374151;
}

.input-wrapper {
  position: relative;
}

.input-wrapper input {
  width: 100%;
  padding: 0.75rem;
  padding-right: 3rem;
  border: 2px solid #d1d5db;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.input-wrapper input:focus {
  outline: none;
  border-color: #e14b6a;
}

.input-wrapper input.error {
  border-color: #dc2626;
}

.toggle-password {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: #6b7280;
  padding: 0.25rem;
}

.toggle-password:hover {
  color: #374151;
}

.error-text {
  color: #dc2626;
  font-size: 0.875rem;
  margin-top: 0.25rem;
  display: block;
}

.password-requirements {
  margin-top: 0.75rem;
  padding: 1rem;
  background-color: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.password-requirements p {
  margin: 0 0 0.5rem 0;
  font-weight: 500;
  color: #374151;
}

.password-requirements ul {
  margin: 0;
  padding-left: 1.25rem;
  list-style: none;
}

.password-requirements li {
  margin-bottom: 0.25rem;
  color: #6b7280;
  position: relative;
}

.password-requirements li::before {
  content: '✗';
  position: absolute;
  left: -1.25rem;
  color: #dc2626;
}

.password-requirements li.valid {
  color: #059669;
}

.password-requirements li.valid::before {
  content: '✓';
  color: #059669;
}

.error-message {
  color: #dc2626;
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  padding: 0.75rem;
  margin-bottom: 1rem;
  font-size: 0.875rem;
}

.success-message {
  color: #059669;
  background-color: #ecfdf5;
  border: 1px solid #a7f3d0;
  border-radius: 8px;
  padding: 0.75rem;
  margin-bottom: 1rem;
  font-size: 0.875rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
}

.cancel-btn {
  padding: 0.75rem 1.5rem;
  background: white;
  border: 2px solid #d1d5db;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-btn:hover {
  background-color: #f9fafb;
  border-color: #9ca3af;
}

.submit-btn {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #e14b6a, #8a2a44);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.submit-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #d63e5a, #7a2439);
  transform: translateY(-1px);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.loader {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .modal-container {
    background: #1f2937;
  }

  .modal-header h2 {
    color: #f9fafb;
  }

  .modal-header {
    border-bottom-color: #374151;
  }

  .close-btn:hover {
    background-color: #374151;
  }

  .form-group label {
    color: #d1d5db;
  }

  .input-wrapper input {
    background: #374151;
    border-color: #4b5563;
    color: #f9fafb;
  }

  .input-wrapper input::placeholder {
    color: #9ca3af;
  }

  .password-requirements {
    background-color: #374151;
    border-color: #4b5563;
  }

  .password-requirements p {
    color: #d1d5db;
  }

  .cancel-btn {
    background: #374151;
    border-color: #4b5563;
    color: #f9fafb;
  }

  .cancel-btn:hover {
    background-color: #4b5563;
  }
}
</style>
