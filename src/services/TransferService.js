import axios from 'axios'
import { useAuthStore } from '@/stores/authStore'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

// You can optionally create an axios instance, if needed:
// const apiClient = axios.create({
//   baseURL: `${BASE_URL}/api`,
//   headers: {
//     'Accept': 'application/json',
//     'Content-Type': 'application/json'
//   }
// });

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
const API_ENDPOINT = '/api/budget/transfers/list/'
const PAGE_SIZE = 10

/**
 * Service for handling transfer-related API operations
 */
export default {
  /**
   * Fetch transfers with optional search and pagination
   * @param {string} searchQuery - Optional search term
   * @param {number} page - Page number for pagination
   * @returns {Promise} - API response with transfer data
   */
  async fetchTransfers(searchQuery = '', page = 1) {
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

    // Always include "FAR" as the code in the request body
    // If there's a search query, include it as well
    const requestBody = searchQuery.trim()
      ? { code: 'FAR', search: searchQuery.trim() }
      : { code: 'FAR' }

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
      return await axios.delete(`${API_BASE_URL}/api/budget/transfers/${transferId}/delete/`, {
        headers: {
          Authorization: `Bearer ${authStore.token}`,
          Accept: 'application/json',
        },
      })
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
      const response = await axios.get(
        `${BASE_URL}/api/budget/transfers/?transaction=${transactionId}`,
        {
          headers: {
            Authorization: `Bearer ${authStore.token}`,
          },
        },
      )
      // Return the complete response structure with summary and transfers
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
        `${BASE_URL}/api/budget/transfers/${transactionId}/submit/`,
        {},
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
        `${BASE_URL}/api/budget/transfers/${transactionId}/reopen/`,
        {},
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
   * @param {Array} transferData - Array of transfer objects
   * @returns {Promise} - Promise with response
   */
  async createTransfer(transferData) {
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

      // Send the array directly as payload
      const response = await axios.post(
        `${BASE_URL}/api/budget/transfers/create/`,
        transfersArray,
        {
          headers: {
            Authorization: `Bearer ${authStore.token}`,
          },
        },
      )
      return response.data
    } catch (error) {
      console.error('Error creating transfer request:', error)
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
