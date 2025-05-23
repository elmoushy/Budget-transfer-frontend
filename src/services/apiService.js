/**
 * Centralized API Service
 * All API calls should go through this service
 */

import axios from 'axios'
import { API_BASE_URL, ENDPOINTS, PAGINATION } from '@/config/api'
import { useAuthStore } from '@/stores/authStore'

/**
 * Get auth headers with the JWT token
 * @returns {Object} Headers object with Authorization
 */
const getAuthHeaders = () => {
  const authStore = useAuthStore()

  if (!authStore.token) {
    throw new Error('Authentication token not found')
  }

  return {
    Authorization: `Bearer ${authStore.token}`,
    Accept: 'application/json',
    'Content-Type': 'application/json',
  }
}

/**
 * Format URL with path parameters
 * @param {string} url - URL with placeholders like :id
 * @param {Object} params - Parameters to replace in the URL
 * @returns {string} Formatted URL
 */
const formatUrl = (url, params = {}) => {
  let formattedUrl = url

  Object.keys(params).forEach((key) => {
    formattedUrl = formattedUrl.replace(`:${key}`, params[key])
  })

  return formattedUrl
}

/**
 * API Service methods
 */
export default {
  /**
   * Authentication
   */
  auth: {
    /**
     * Login user
     * @param {Object} credentials - Username and password
     * @returns {Promise} Login response with token and user data
     */
    login: async (credentials) => {
      try {
        const response = await axios.post(`${API_BASE_URL}${ENDPOINTS.AUTH.LOGIN}`, credentials, {
          headers: {
            'Content-Type': 'application/json',
          },
        })
        return response.data
      } catch (error) {
        console.error('Login error:', error)
        throw error
      }
    },

    /**
     * Logout user
     * @returns {Promise} Logout response
     */
    logout: async () => {
      try {
        const response = await axios.post(
          `${API_BASE_URL}${ENDPOINTS.AUTH.LOGOUT}`,
          {},
          { headers: getAuthHeaders() },
        )
        return response.data
      } catch (error) {
        console.error('Logout error:', error)
        throw error
      }
    },

    /**
     * Get all users
     * @returns {Promise} Users data
     */
    getUsers: async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}${ENDPOINTS.AUTH.USERS}`, {
          headers: getAuthHeaders(),
        })
        return response.data
      } catch (error) {
        console.error('Error fetching users:', error)
        throw error
      }
    },

    /**
     * Register new user
     * @param {Object} userData - User details including username, password, role
     * @returns {Promise} Registration response
     */
    registerUser: async (userData) => {
      try {
        const response = await axios.post(`${API_BASE_URL}${ENDPOINTS.AUTH.REGISTER}`, userData, {
          headers: getAuthHeaders(),
        })
        return response.data
      } catch (error) {
        console.error('Error registering user:', error)
        throw error
      }
    },

    /**
     * Update user
     * @param {number} userId - User ID
     * @param {Object} userData - Updated user data
     * @returns {Promise} Update response
     */
    updateUser: async (userId, userData) => {
      try {
        const response = await axios.put(
          `${API_BASE_URL}${ENDPOINTS.AUTH.USER_UPDATE}?pk=${userId}`,
          userData,
          { headers: getAuthHeaders() },
        )
        return response.data
      } catch (error) {
        console.error('Error updating user:', error)
        throw error
      }
    },

    /**
     * Delete user
     * @param {number} userId - User ID to delete
     * @returns {Promise} Delete response
     */
    deleteUser: async (userId) => {
      try {
        const response = await axios.delete(
          `${API_BASE_URL}${ENDPOINTS.AUTH.USER_DELETE}?pk=${userId}`,
          { headers: getAuthHeaders() },
        )
        return response.data
      } catch (error) {
        console.error('Error deleting user:', error)
        throw error
      }
    },
  },

  /**
   * Budget Transfers
   */
  transfers: {
    /**
     * Fetch transfers with optional search and pagination
     * @param {string} searchQuery - Optional search term
     * @param {number} page - Page number for pagination
     * @returns {Promise} - API response with transfer data
     */
    fetchTransfers: async (searchQuery = '', page = 1) => {
      try {
        const params = {
          page: page.toString(),
          page_size: PAGINATION.PAGE_SIZE.toString(),
        }

        const requestBody = searchQuery.trim()
          ? { code: 'FAR', search: searchQuery.trim() }
          : { code: 'FAR' }

        const response = await axios.post(
          `${API_BASE_URL}${ENDPOINTS.BUDGET.TRANSFERS_LIST}`,
          requestBody,
          {
            headers: getAuthHeaders(),
            params, // Pagination params still go in URL
          },
        )

        return response.data
      } catch (error) {
        console.error('Error fetching transfers:', error)
        throw error
      }
    },

    /**
     * Delete a transfer by ID
     * @param {number} transferId - The ID of the transfer to delete
     * @returns {Promise} - API response
     */
    deleteTransfer: async (transferId) => {
      try {
        const url = formatUrl(`${API_BASE_URL}${ENDPOINTS.BUDGET.TRANSFER_DELETE}`, {
          id: transferId,
        })
        const response = await axios.delete(url, {
          headers: getAuthHeaders(),
        })
        return response.data
      } catch (error) {
        console.error('Error deleting transfer:', error)
        throw error
      }
    },

    /**
     * Fetch transfers pending approval
     * @param {Object} options - Search options
     * @param {number} page - Page number
     * @returns {Promise} - API response with data
     */
    fetchTransfersPendingApproval: async (options = {}, page = 1) => {
      try {
        const params = {
          page: page.toString(),
          page_size: PAGINATION.PAGE_SIZE.toString(),
          ...options,
        }

        const response = await axios.get(
          `${API_BASE_URL}${ENDPOINTS.BUDGET.TRANSFERS_PENDING_APPROVAL}`,
          {
            headers: getAuthHeaders(),
            params,
          },
        )

        return response.data
      } catch (error) {
        console.error('Error fetching transfers pending approval:', error)
        throw error
      }
    },

    /**
     * Approve or reject a transfer
     * @param {Object} approvalData - Approval data
     * @returns {Promise} - API response
     */
    approveOrRejectTransfer: async (approvalData) => {
      try {
        const response = await axios.post(
          `${API_BASE_URL}${ENDPOINTS.BUDGET.TRANSFER_APPROVE_REJECT}`,
          approvalData,
          { headers: getAuthHeaders() },
        )
        return response.data
      } catch (error) {
        console.error('Error approving/rejecting transfer:', error)
        throw error
      }
    },

    /**
     * Get transfer details by transaction ID
     * @param {number} transactionId - Transaction ID
     * @returns {Promise} - API response with transfer details
     */
    getTransferDetails: async (transactionId) => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/budget/transfers/${transactionId}/`, {
          headers: getAuthHeaders(),
        })
        return response.data
      } catch (error) {
        console.error('Error fetching transfer details:', error)
        throw error
      }
    },

    /**
     * Get pivot fund details
     * @param {string} costCenterCode - Cost center code
     * @param {string} accountCode - Account code
     * @returns {Promise} - API response with fund details
     */
    getPivotFundDetails: async (costCenterCode, accountCode) => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/budget/pivot-fund/?cost_center=${costCenterCode}&account=${accountCode}`,
          { headers: getAuthHeaders() },
        )
        return response.data
      } catch (error) {
        console.error('Error fetching pivot fund details:', error)
        throw error
      }
    },

    /**
     * Generate report for a transfer
     * @param {number} transferId - Transfer ID
     * @param {string} reportType - Report type
     * @returns {Promise} - API response
     */
    generateReport: async (transferId, reportType = 'pdf') => {
      try {
        const response = await axios.post(
          `${API_BASE_URL}/api/budget/transfers/${transferId}/report/`,
          { format: reportType },
          { headers: getAuthHeaders() },
        )
        return response.data
      } catch (error) {
        console.error('Error generating report:', error)
        throw error
      }
    },

    /**
     * Create a new transfer
     * @param {Object} payload - Transfer data
     * @returns {Promise} - API response
     */
    createTransfer: async (payload) => {
      try {
        const response = await axios.post(`${API_BASE_URL}/api/budget/transfers/create/`, payload, {
          headers: getAuthHeaders(),
        })
        return response.data
      } catch (error) {
        console.error('Error creating transfer:', error)
        throw error
      }
    },

    /**
     * Update an existing transfer
     * @param {number} transferId - Transfer ID to update
     * @param {Object} payload - Updated transfer data
     * @returns {Promise} - API response
     */
    updateTransfer: async (transferId, payload) => {
      try {
        const response = await axios.put(
          `${API_BASE_URL}/api/budget/transfers/${transferId}/update/`,
          payload,
          { headers: getAuthHeaders() },
        )
        return response.data
      } catch (error) {
        console.error('Error updating transfer:', error)
        throw error
      }
    },
  },

  /**
   * Account Entities
   */
  accountEntities: {
    /**
     * Get all entities
     * @returns {Promise} Entities data
     */
    getEntities: async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}${ENDPOINTS.ACCOUNTS_ENTITIES.ENTITIES}`, {
          headers: getAuthHeaders(),
        })
        return response.data
      } catch (error) {
        console.error('Error fetching entities:', error)
        throw error
      }
    },

    /**
     * Get all accounts
     * @returns {Promise} Accounts data
     */
    getAccounts: async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}${ENDPOINTS.ACCOUNTS_ENTITIES.ACCOUNTS}`, {
          headers: getAuthHeaders(),
        })
        return response.data
      } catch (error) {
        console.error('Error fetching accounts:', error)
        throw error
      }
    },

    /**
     * Get account limits for a specific cost center
     * @param {string} costCenter - Cost center code
     * @param {number} page - Page number
     * @returns {Promise} Account limits data
     */
    getAccountLimits: async (costCenter, page = 1) => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}${ENDPOINTS.ACCOUNTS_ENTITIES.ACCOUNT_ENTITY_LIMIT_LIST}`,
          {
            params: {
              cost_center: costCenter,
              page,
            },
            headers: getAuthHeaders(),
          },
        )
        return response.data
      } catch (error) {
        console.error('Error fetching account limits:', error)
        throw error
      }
    },

    /**
     * Update account limit
     * @param {number} limitId - Account limit ID
     * @param {Object} limitData - Updated limit data
     * @returns {Promise} Update response
     */
    updateAccountLimit: async (limitId, limitData) => {
      try {
        const response = await axios.put(
          `${API_BASE_URL}${ENDPOINTS.ACCOUNTS_ENTITIES.ACCOUNT_ENTITY_LIMIT_UPDATE}?pk=${limitId}`,
          limitData,
          { headers: getAuthHeaders() },
        )
        return response.data
      } catch (error) {
        console.error('Error updating account limit:', error)
        throw error
      }
    },
  },

  /**
   * Notifications
   */
  notifications: {
    /**
     * Get unread notifications
     * @returns {Promise} Unread notifications
     */
    getUnreadNotifications: async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}${ENDPOINTS.AUTH.NOTIFICATIONS}/unread`, {
          headers: getAuthHeaders(),
        })
        return response.data
      } catch (error) {
        console.error('Error fetching unread notifications:', error)
        return { notifications: [] }
      }
    },

    /**
     * Check system notifications
     * @returns {Promise} System notifications count
     */
    checkSystemNotifications: async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}${ENDPOINTS.AUTH.NOTIFICATIONS}/system`, {
          headers: getAuthHeaders(),
        })
        return response.data
      } catch (error) {
        console.error('Error checking system notifications:', error)
        return { Number_Of_Notifications: 0 }
      }
    },

    /**
     * Get all notifications
     * @returns {Promise} All notifications
     */
    getAllNotifications: async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}${ENDPOINTS.AUTH.NOTIFICATIONS}/get_all`, {
          headers: getAuthHeaders(),
        })
        return response.data
      } catch (error) {
        console.error('Error fetching all notifications:', error)
        return { notifications: [] }
      }
    },

    /**
     * Mark notification as read
     * @param {number} notificationId - Notification ID
     * @returns {Promise} Response data
     */
    markNotificationAsRead: async (notificationId) => {
      try {
        const response = await axios.post(
          `${API_BASE_URL}${ENDPOINTS.AUTH.NOTIFICATIONS}/read_one?notification_id=${notificationId}`,
          {},
          { headers: getAuthHeaders() },
        )
        return response.data
      } catch (error) {
        console.error('Error marking notification as read:', error)
        throw error
      }
    },

    /**
     * Mark all notifications as read
     * @returns {Promise} Response data
     */
    markAllNotificationsAsRead: async () => {
      try {
        const response = await axios.post(
          `${API_BASE_URL}${ENDPOINTS.AUTH.NOTIFICATIONS}/read_all`,
          {},
          { headers: getAuthHeaders() },
        )
        return response.data
      } catch (error) {
        console.error('Error marking all notifications as read:', error)
        throw error
      }
    },

    /**
     * Delete notification
     * @param {number} notificationId - Notification ID
     * @returns {Promise} Response data
     */
    deleteNotification: async (notificationId) => {
      try {
        const response = await axios.delete(
          `${API_BASE_URL}${ENDPOINTS.AUTH.NOTIFICATIONS}/delete?notification_id=${notificationId}`,
          { headers: getAuthHeaders() },
        )
        return response.data
      } catch (error) {
        console.error('Error deleting notification:', error)
        throw error
      }
    },
  },
}
