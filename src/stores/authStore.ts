import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { API_BASE_URL, ENDPOINTS } from '@/config/api'

interface User {
  id?: number
  username: string
  email?: string
  role?: string
  [key: string]: any
}

interface AuthState {
  token: string | null
  user: User | null
}

export const useAuthStore = defineStore('auth', () => {
  // State
  const token = ref<string | null>(localStorage.getItem('token'))
  const userStr = localStorage.getItem('user')
  const user = ref<User | null>(userStr && userStr !== 'undefined' ? JSON.parse(userStr) : null)
  const sessionExpired = ref(false)

  // Computed
  const isAuthenticated = computed(() => !!token.value)

  // Actions
  function setAuth(auth: AuthState) {
    token.value = auth.token
    user.value = auth.user
    sessionExpired.value = false

    // Store in localStorage for persistence
    localStorage.setItem('token', auth.token || '')
    localStorage.setItem('user', JSON.stringify(auth.user))
  }

  async function logout() {
    // Clear auth data
    token.value = null
    user.value = null
    sessionExpired.value = false

    // Remove from localStorage
    localStorage.removeItem('token')
    localStorage.removeItem('user')

    // Could add API call to invalidate token on server if needed
    // await fetch(`${API_BASE_URL}${ENDPOINTS.AUTH.LOGOUT}`, {...})
  }

  // New method to handle session expiry
  function handleSessionExpiry() {
    // Clear auth data
    token.value = null
    user.value = null
    sessionExpired.value = true

    // Remove from localStorage
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  // Helper to reset the session expired flag
  function resetSessionExpiredFlag() {
    sessionExpired.value = false
  }

  return {
    token,
    user,
    isAuthenticated,
    sessionExpired,
    setAuth,
    logout,
    handleSessionExpiry,
    resetSessionExpiredFlag,
  }
})
