<template>
  <div v-if="authStore.sessionExpired" class="session-expired-overlay" @click="redirectToLogin">
    <div class="session-expired-modal" @click.stop>
      <div class="session-expired-header">
        <div class="icon-container">
          <svg class="expired-icon" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8Z"
            />
          </svg>
        </div>
        <h2>{{ isArabic ? 'انتهت صلاحية الجلسة' : 'Session Expired' }}</h2>
      </div>
      <div class="session-expired-body">
        <p>
          {{
            isArabic
              ? 'لقد انتهت صلاحية جلستك لأسباب أمنية. يرجى تسجيل الدخول مرة أخرى للمتابعة.'
              : 'Your session has expired for security reasons. Please sign in again to continue using the application.'
          }}
        </p>
      </div>
      <div class="session-expired-footer">
        <button class="login-btn" @click="redirectToLogin">
          {{ isArabic ? 'تسجيل الدخول' : 'Go to Login' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useThemeStore } from '@/stores/themeStore'

const router = useRouter()
const authStore = useAuthStore()
const themeStore = useThemeStore()

const isArabic = computed(() => themeStore.language === 'ar')

function redirectToLogin() {
  console.log('Redirecting to login page...')

  try {
    // Clear the session expired flag
    authStore.resetSessionExpiredFlag()

    // Navigate to login page using Vue Router
    router
      .push('/login')
      .then(() => {
        console.log('Successfully navigated to login page')
      })
      .catch((error) => {
        console.error('Router navigation error:', error)
        // Fallback to window location if router fails
        window.location.href = '/login'
      })
  } catch (error) {
    console.error('Error during login redirect:', error)
    // Fallback to window location
    window.location.href = '/login'
  }
}
</script>

<style scoped>
.session-expired-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

.session-expired-modal {
  background-color: white;
  width: 90%;
  max-width: 450px;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  animation: slideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.session-expired-header {
  padding: 2rem 1.5rem 1.5rem;
  background: linear-gradient(135deg, #6d1a36, #4a0d20);
  color: white;
  text-align: center;
  position: relative;
}

.icon-container {
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
}

.expired-icon {
  width: 48px;
  height: 48px;
  color: rgba(255, 255, 255, 0.9);
  animation: pulse 2s ease-in-out infinite;
}

.session-expired-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  letter-spacing: -0.025em;
}

.session-expired-body {
  padding: 2rem 2rem 1.5rem;
  text-align: center;
  background-color: #fafafa;
}

.session-expired-body p {
  margin: 0;
  font-size: 1rem;
  line-height: 1.6;
  color: #4a5568;
  font-weight: 400;
}

.session-expired-footer {
  padding: 1rem 2rem 2rem;
  display: flex;
  justify-content: center;
  background-color: #fafafa;
}

.login-btn {
  background: linear-gradient(135deg, #6d1a36, #4a0d20);
  color: white;
  border: none;
  padding: 0.875rem 2.5rem;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  letter-spacing: 0.025em;
  min-width: 140px;
  box-shadow: 0 8px 20px rgba(109, 26, 54, 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.login-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.login-btn:hover {
  background: linear-gradient(135deg, #7d2a46, #5a1d30);
  transform: translateY(-3px);
  box-shadow: 0 12px 28px rgba(109, 26, 54, 0.4);
}

.login-btn:hover::before {
  left: 100%;
}

.login-btn:active {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(109, 26, 54, 0.3);
}

.login-btn:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(109, 26, 54, 0.3);
}

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
    transform: translateY(-30px) scale(0.95);
    opacity: 0;
  }
  to {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 0.9;
  }
  50% {
    transform: scale(1.05);
    opacity: 1;
  }
}

/* RTL support */
.rtl .session-expired-modal {
  direction: rtl;
}

.rtl .session-expired-body p {
  text-align: center;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .session-expired-modal {
    background-color: #1a202c;
    border: 1px solid #2d3748;
  }

  .session-expired-body {
    background-color: #1a202c;
  }

  .session-expired-body p {
    color: #cbd5e0;
  }

  .session-expired-footer {
    background-color: #1a202c;
  }
}
</style>
