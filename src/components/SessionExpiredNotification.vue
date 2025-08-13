<template>
  <div v-if="authStore.sessionExpired" class="session-expired-overlay" @click="redirectToLogin">
    <div class="session-expired-modal" @click.stop>
      <div class="session-expired-header">
        <h2>{{ isArabic ? 'انتهت جلستك' : 'Session Expired' }}</h2>
      </div>
      <div class="session-expired-body">
        <p>
          {{
            isArabic
              ? 'لقد انتهت صلاحية جلستك. يرجى تسجيل الدخول مرة أخرى للمتابعة.'
              : 'Your session has expired. Please log in again to continue.'
          }}
        </p>
      </div>
      <div class="session-expired-footer">
        <button class="login-btn" @click="redirectToLogin">
          {{ isArabic ? 'تسجيل الدخول' : 'Log In' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useThemeStore } from '@/stores/themeStore'

const router = useRouter()
const authStore = useAuthStore()
const themeStore = useThemeStore()

const isArabic = computed(() => themeStore.language === 'ar')

function redirectToLogin() {
  authStore.resetSessionExpiredFlag()
  router.push('/login')
}
</script>

<style scoped>
.session-expired-overlay {
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

.session-expired-modal {
  background-color: white;
  width: 90%;
  max-width: 400px;
  border-radius: 12px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  animation: slideIn 0.3s ease;
}

.session-expired-header {
  padding: 1.25rem;
  border-bottom: 1px solid #e2e8f0;
  background: linear-gradient(90deg, #6d1a36, #4a0d20);
  color: white;
}

.session-expired-header h2 {
  margin: 0;
  font-size: 1.25rem;
  text-align: center;
}

.session-expired-body {
  padding: 2rem 1.5rem;
  text-align: center;
  font-size: 1.1rem;
}

.session-expired-footer {
  padding: 1rem 1.5rem 1.5rem;
  display: flex;
  justify-content: center;
}

.login-btn {
  background: linear-gradient(135deg, #6d1a36, #4a0d20);
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.login-btn:hover {
  background: linear-gradient(135deg, #7d2a46, #5a1d30);
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.login-btn:active {
  transform: translateY(0);
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
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>
