import axios from 'axios'
import { useAuthStore } from '@/stores/authStore'

// Create a flag to avoid showing multiple expiry notifications
let isHandlingSessionExpiry = false

export function setupAxiosInterceptors() {
  // Add a response interceptor
  axios.interceptors.response.use(
    (response) => {
      // If response is successful, just return it
      return response
    },
    (error) => {
      // If we get a 401 Unauthorized error
      if (error.response && error.response.status === 401 && !isHandlingSessionExpiry) {
        isHandlingSessionExpiry = true

        const authStore = useAuthStore()

        // Log the user out and clear auth data
        authStore.handleSessionExpiry()

        // Reset the flag after a short delay
        setTimeout(() => {
          isHandlingSessionExpiry = false
        }, 5000)
      }

      // Return the error for further handling in the services
      return Promise.reject(error)
    },
  )
}
