import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { API_BASE_URL } from '@/config/api'
import axios from 'axios'

interface User {
  id: number
  username: string
  role: string
  can_transfer_budget: boolean
}

interface AuthState {
  token: string | null
  refreshToken: string | null
  user: User | null
  user_level?: number
}

export const useAuthStore = defineStore('auth', () => {
  // State
  const token = ref<string | null>(localStorage.getItem('token'))
  const refreshToken = ref<string | null>(localStorage.getItem('refreshToken'))
  const userStr = localStorage.getItem('user')
  const user = ref<User | null>(userStr && userStr !== 'undefined' ? JSON.parse(userStr) : null)
  const userLevelStr = localStorage.getItem('user_level')
  const userLevel = ref<number | null>(userLevelStr ? parseInt(userLevelStr) : null)
  const sessionExpired = ref(false)
  const isRefreshing = ref(false)

  // Computed
  const isAuthenticated = computed(() => !!token.value && !!user.value)

  // Actions
  function setAuth(auth: AuthState) {
    token.value = auth.token
    refreshToken.value = auth.refreshToken
    user.value = auth.user
    userLevel.value = auth.user_level || null
    sessionExpired.value = false

    // Store in localStorage for persistence
    if (auth.token) {
      localStorage.setItem('token', auth.token)
    }
    if (auth.refreshToken) {
      localStorage.setItem('refreshToken', auth.refreshToken)
    }
    if (auth.user) {
      localStorage.setItem('user', JSON.stringify(auth.user))
    }
    if (auth.user_level !== undefined) {
      localStorage.setItem('user_level', auth.user_level.toString())
    }
  }

  async function logout() {
    // Clear auth data
    token.value = null
    refreshToken.value = null
    user.value = null
    userLevel.value = null
    sessionExpired.value = false
    isRefreshing.value = false

    // Remove from localStorage
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    localStorage.removeItem('user_level')

    // Could add API call to invalidate token on server if needed
    // await fetch(`${API_BASE_URL}${ENDPOINTS.AUTH.LOGOUT}`, {...})
  }

  // New method to handle session expiry
  function handleSessionExpiry() {
    console.log('Session expired - clearing authentication state')

    // Clear all authentication data
    clearAuth()

    // Set the reactive flag to show the Vue component notification
    sessionExpired.value = true
  }

  // Helper function to clear authentication data
  function clearAuth() {
    token.value = null
    refreshToken.value = null
    user.value = null
    userLevel.value = null
    sessionExpired.value = false
    isRefreshing.value = false

    // Remove from localStorage
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    localStorage.removeItem('user_level')
  }

  // Helper to reset the session expired flag
  function resetSessionExpiredFlag() {
    sessionExpired.value = false
  }

  // Refresh access token using refresh token
  async function refreshAccessToken(): Promise<boolean> {
    if (!refreshToken.value || isRefreshing.value) {
      return false
    }

    isRefreshing.value = true

    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/token-refresh/`, {
        refresh: refreshToken.value,
      })

      if (response.status === 200) {
        // Update tokens
        token.value = response.data.access
        refreshToken.value = response.data.refresh

        localStorage.setItem('token', response.data.access)
        localStorage.setItem('refreshToken', response.data.refresh)

        isRefreshing.value = false
        return true
      }
    } catch (error) {
      console.error('Token refresh failed:', error)
      // Refresh token is invalid, user needs to log in again
      handleSessionExpiry()
    }

    isRefreshing.value = false
    return false
  }

  // Change user password
  async function changePassword(
    oldPassword: string,
    newPassword: string,
  ): Promise<{ success: boolean; message: string }> {
    if (!token.value) {
      return { success: false, message: 'Not authenticated' }
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/auth/change-password/`,
        {
          old_password: oldPassword,
          new_password: newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token.value}`,
          },
        },
      )

      if (response.status === 200) {
        return { success: true, message: response.data.message || 'Password changed successfully.' }
      }
    } catch (error: unknown) {
      console.error('Password change failed:', error)

      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 400) {
          // Validation errors
          const errorData = error.response.data
          if (errorData.old_password) {
            return { success: false, message: errorData.old_password[0] }
          }
          if (errorData.new_password) {
            return { success: false, message: errorData.new_password[0] }
          }
          return { success: false, message: 'Invalid password data provided.' }
        } else if (error.response.status === 401) {
          // Authentication error
          handleSessionExpiry()
          return { success: false, message: 'Session expired. Please log in again.' }
        }
      }
    }

    return { success: false, message: 'Password change failed. Please try again.' }
  }

  return {
    token,
    refreshToken,
    user,
    userLevel,
    isAuthenticated,
    sessionExpired,
    isRefreshing,
    setAuth,
    logout,
    clearAuth,
    handleSessionExpiry,
    resetSessionExpiredFlag,
    refreshAccessToken,
    changePassword,
  }
})
