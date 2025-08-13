import axios from 'axios'
import { useAuthStore } from '@/stores/authStore'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
const API_ENDPOINT = '/api/budget/transfers/list/'
const PAGE_SIZE = 6

/**
 * Unified service for handling transfer-related API operations
 * Supports different codes: FAR (Home), AFR (Enhancements), FAD (Contracts)
 */
export { PAGE_SIZE }

export default {
  /**
   * Fetch transfers with optional search and pagination
   * @param {string} code - Transfer type code (FAR, AFR, FAD)
   * @param {string} searchQuery - Optional search term
   * @param {number} page - Page number for pagination
   * @returns {Promise} - API response with transfer data
   */
  async fetchTransfers(code = 'FAR', searchQuery = '', page = 1) {
    const authStore = useAuthStore()

    if (!authStore.token) {
      throw new Error('Authentication token not found')
    }

    const params = {
      page: page.toString(),
      page_size: PAGE_SIZE.toString(),
    }

    // Common headers for all requests
    const headers = {
      Authorization: `Bearer ${authStore.token}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    }

    // Include the specified code in the request body
    // If there's a search query, include it as well
    const requestBody = searchQuery.trim() ? { code, search: searchQuery.trim() } : { code }

    try {
      // Always use POST for both listing and searching
      const response = await axios.post(`${API_BASE_URL}${API_ENDPOINT}`, requestBody, {
        headers,
        params, // Pagination params still go in URL
      })

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
  async deleteTransfer(transferId) {
    const authStore = useAuthStore()

    if (!authStore.token) {
      throw new Error('Authentication token not found')
    }

    try {
      const response = await axios.delete(
        `${BASE_URL}/api/budget/transfers/${transferId}/delete/`,
        {
          headers: {
            Authorization: `Bearer ${authStore.token}`,
          },
        },
      )
      return response.data
    } catch (error) {
      console.error('Error deleting transfer:', error)
      throw error
    }
  },

  /**
   * Fetches transfer details by transaction ID
   * @param {number} transactionId - The transaction ID to fetch
   * @returns {Promise} - Promise with transfer data containing:
   *   - summary: Object with transaction_id, balanced status
   *   - transfers: Array of transfer objects with validation_errors
   */
  async getTransferDetails(transactionId) {
    const authStore = useAuthStore()
    try {
      const response = await axios.get(`${BASE_URL}/api/budget/transfers/${transactionId}/`, {
        headers: {
          Authorization: `Bearer ${authStore.token}`,
        },
      })
      return response.data
    } catch (error) {
      console.error('Error fetching transfer details:', error)
      throw error
    }
  },

  /**
   * Submit a transfer request
   * @param {number} transactionId - The transaction ID
   * @returns {Promise} - Promise with response
   */
  async submitTransferRequest(transactionId) {
    const authStore = useAuthStore()
    try {
      const response = await axios.post(
        `${BASE_URL}/api/adjd-transfers/submit/`,
        { transaction: transactionId },
        {
          headers: {
            Authorization: `Bearer ${authStore.token}`,
          },
        },
      )
      return response.data
    } catch (error) {
      console.error('Error submitting transfer request:', error)
      throw error
    }
  },

  /**
   * Reopen a transfer request
   * @param {number} transactionId - The transaction ID
   * @returns {Promise} - Promise with response
   */
  async reopenTransferRequest(transactionId) {
    const authStore = useAuthStore()
    try {
      const response = await axios.post(
        `${BASE_URL}/api/adjd-transfers/reopen/`,
        {
          transaction: transactionId,
          action: 'reopen',
        },
        {
          headers: {
            Authorization: `Bearer ${authStore.token}`,
          },
        },
      )
      return response.data
    } catch (error) {
      console.error('Error reopening transfer request:', error)
      throw error
    }
  },

  /**
   * Generate report for a transfer
   * @param {number} transactionId - The transaction ID
   * @returns {Promise} - Promise with report data
   */
  async generateReport(transactionId) {
    const authStore = useAuthStore()
    try {
      const response = await axios.get(
        `${BASE_URL}/api/budget/transfers/${transactionId}/report/`,
        {
          headers: {
            Authorization: `Bearer ${authStore.token}`,
          },
          responseType: 'blob',
        },
      )
      return response.data
    } catch (error) {
      console.error('Error generating report:', error)
      throw error
    }
  },

  /**
   * Create transfer requests
   * @param {string} code - Transfer type code (FAR, AFR, FAD)
   * @param {Array} transferData - Array of transfer objects
   * @returns {Promise} - Promise with response
   */
  async createTransfer(code, transferData) {
    const authStore = useAuthStore()
    try {
      // Map each transfer using 'transaction' property (not transaction_id)
      const transfersArray = transferData.map((item) => ({
        transaction: item.transaction,
        cost_center_code: item.cost_center_code,
        cost_center_name: item.cost_center_name,
        account_code: item.account_code,
        account_name: item.account_name,
        approved_budget: parseFloat(item.approved_budget) || 0,
        available_budget: parseFloat(item.available_budget) || 0,
        from_center: parseFloat(item.from_center) || 0,
        to_center: parseFloat(item.to_center) || 0,
        encumbrance: parseFloat(item.encumbrance) || 0,
        actual: parseFloat(item.actual) || 0,
        done: 1,
      }))

      // Choose the appropriate endpoint based on code
      let endpoint
      switch (code) {
        case 'AFR':
          endpoint = `${BASE_URL}/api/adjd-transfers/create/`
          break
        case 'FAD':
          endpoint = `${BASE_URL}/api/fund-adj-transfers/create/`
          break
        case 'FAR':
        default:
          endpoint = `${BASE_URL}/api/fund-transfers/create/`
          break
      }

      // Send the array directly as payload
      const response = await axios.post(endpoint, transfersArray, {
        headers: {
          Authorization: `Bearer ${authStore.token}`,
        },
      })
      return response.data
    } catch (error) {
      console.error('Error creating transfer request:', error)
      throw error
    }
  },

  /**
   * Upload file attachments for a transfer
   * @param {File} file - The file to upload
   * @param {number} transactionId - The transaction ID
   * @returns {Promise} - Promise with response
   */
  async uploadFile(file, transactionId) {
    const authStore = useAuthStore()
    const formData = new FormData()
    formData.append('file', file)
    formData.append('transaction_id', transactionId.toString())

    try {
      const response = await axios.post(`${BASE_URL}/api/budget/transfers/upload-file/`, formData, {
        headers: {
          Authorization: `Bearer ${authStore.token}`,
          'Content-Type': 'multipart/form-data',
        },
      })
      return response.data
    } catch (error) {
      console.error('Error uploading file:', error)
      throw error
    }
  },

  /**
   * List file attachments for a transfer
   * @param {number} transactionId - The transaction ID
   * @returns {Promise} - Promise with response containing array of attachments
   */
  async listFiles(transactionId) {
    const authStore = useAuthStore()
    try {
      const response = await axios.get(`${BASE_URL}/api/budget/transfers/${transactionId}/files/`, {
        headers: {
          Authorization: `Bearer ${authStore.token}`,
        },
      })
      return response.data
    } catch (error) {
      console.error('Error listing files:', error)
      throw error
    }
  },

  /**
   * Upload an Excel file for a specific transaction
   * @param {File} file - The Excel file to upload
   * @param {number} transactionId - The transaction ID
   * @returns {Promise} - Promise with response
   */
  async uploadExcelFile(file, transactionId) {
    const authStore = useAuthStore()
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await axios.post(
        `${BASE_URL}/api/budget/transfers/${transactionId}/upload-excel/`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${authStore.token}`,
            'Content-Type': 'multipart/form-data',
          },
        },
      )
      return response.data
    } catch (error) {
      console.error('Error uploading Excel file:', error)
      throw error
    }
  },

  /**
   * Get pivot fund details for a specific cost center and account
   * @param {string} entityId - Cost Center Code
   * @param {string} accountId - Account Code
   * @returns {Promise} - Promise with pivot fund details
   */
  async getPivotFundDetails(entityId, accountId) {
    const authStore = useAuthStore()
    try {
      const response = await axios.get(
        `${BASE_URL}/api/accounts-entities/pivot-funds/getdetail/?entity_id=${entityId}&account_id=${accountId}`,
        {
          headers: {
            Authorization: `Bearer ${authStore.token}`,
          },
        },
      )
      return response.data
    } catch (error) {
      // Only log non-404 errors (404s are expected and handled by the component)
      if (!error.response || error.response.status !== 404) {
        console.error('Error fetching pivot fund details:', error)
      }
      // Make sure we re-throw the error for proper component handling
      throw error
    }
  },

  /**
   * Alternative method: Get transfers using an axios instance
   * (Optional if needed, otherwise you can remove this method)
   * @param {number} transactionId
   * @returns {Promise} - Promise with transfer data containing summary and transfers array
   */
  getTransfers(transactionId) {
    return axios.get(`${BASE_URL}/api/budget/transfers/?transaction=${transactionId}`)
  },
}
