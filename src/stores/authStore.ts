import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

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

  // Computed
  const isAuthenticated = computed(() => !!token.value)

  // Actions
  function setAuth(auth: AuthState) {
    token.value = auth.token
    user.value = auth.user

    // Store in localStorage for persistence
    localStorage.setItem('token', auth.token || '')
    localStorage.setItem('user', JSON.stringify(auth.user))
  }

  async function logout() {
    // Clear auth data
    token.value = null
    user.value = null

    // Remove from localStorage
    localStorage.removeItem('token')
    localStorage.removeItem('user')

    // Could add API call to invalidate token on server if needed
    // await fetch('http://localhost:8000/api/auth/logout/', {...})
  }

  return {
    token,
    user,
    isAuthenticated,
    setAuth,
    logout,
  }
})
