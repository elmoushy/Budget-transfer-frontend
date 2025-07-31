import axios from 'axios'
import { useAuthStore } from '@/stores/authStore'

// Create a flag to avoid showing multiple expiry notifications
let isHandlingSessionExpiry = false
let failedRequestsQueue = []

export function setupAxiosInterceptors() {
  // Request interceptor to add authorization header
  axios.interceptors.request.use(
    (config) => {
      const authStore = useAuthStore()
      const token = authStore.token

      if (token && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`
      }

      return config
    },
    (error) => {
      return Promise.reject(error)
    },
  )

  // Response interceptor to handle token refresh
  axios.interceptors.response.use(
    (response) => {
      // If response is successful, just return it
      return response
    },
    async (error) => {
      const originalRequest = error.config

      // If we get a 401 Unauthorized error and haven't already tried to refresh
      if (error.response && error.response.status === 401 && !originalRequest._retry) {
        const authStore = useAuthStore()

        // Check if this is a login request or refresh request, if so don't try to refresh
        if (
          originalRequest.url?.includes('/api/auth/login/') ||
          originalRequest.url?.includes('/api/auth/token-refresh/')
        ) {
          return Promise.reject(error)
        }

        // Mark this request as retried
        originalRequest._retry = true

        // If we're not already refreshing and we have a refresh token
        if (!authStore.isRefreshing && authStore.refreshToken) {
          try {
            // Try to refresh the token
            const tokenRefreshed = await authStore.refreshAccessToken()

            if (tokenRefreshed) {
              // Update the authorization header with the new token
              originalRequest.headers.Authorization = `Bearer ${authStore.token}`

              // Process any queued failed requests with the new token
              processFailedRequestsQueue(null, authStore.token)

              // Retry the original request
              return axios(originalRequest)
            } else {
              // Refresh failed, handle session expiry
              if (!isHandlingSessionExpiry) {
                isHandlingSessionExpiry = true
                authStore.handleSessionExpiry()
                processFailedRequestsQueue('Session expired', null)

                // Reset the flag after a short delay
                setTimeout(() => {
                  isHandlingSessionExpiry = false
                }, 5000)
              }
            }
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError)

            // Check if refresh error is 401 (refresh token invalid)
            if (refreshError.response && refreshError.response.status === 401) {
              // Refresh token is invalid, handle session expiry
              if (!isHandlingSessionExpiry) {
                isHandlingSessionExpiry = true
                authStore.handleSessionExpiry()
                processFailedRequestsQueue('Session expired', null)

                // Reset the flag after a short delay
                setTimeout(() => {
                  isHandlingSessionExpiry = false
                }, 5000)
              }
            } else {
              // Other error during refresh, still handle session expiry
              if (!isHandlingSessionExpiry) {
                isHandlingSessionExpiry = true
                authStore.handleSessionExpiry()
                processFailedRequestsQueue('Session expired', null)

                // Reset the flag after a short delay
                setTimeout(() => {
                  isHandlingSessionExpiry = false
                }, 5000)
              }
            }
          }
        } else if (authStore.isRefreshing) {
          // If we're already refreshing, queue this request
          return new Promise((resolve, reject) => {
            failedRequestsQueue.push({ resolve, reject, config: originalRequest })
          })
        } else {
          // No refresh token available, handle session expiry
          if (!isHandlingSessionExpiry) {
            isHandlingSessionExpiry = true
            authStore.handleSessionExpiry()

            // Reset the flag after a short delay
            setTimeout(() => {
              isHandlingSessionExpiry = false
            }, 5000)
          }
        }
      }

      // Return the error for further handling in the services
      return Promise.reject(error)
    },
  )
}

// Process queued failed requests after token refresh
function processFailedRequestsQueue(error, token) {
  failedRequestsQueue.forEach(({ resolve, reject, config }) => {
    if (error) {
      reject(error)
    } else {
      config.headers.Authorization = `Bearer ${token}`
      resolve(axios(config))
    }
  })

  failedRequestsQueue = []
}
