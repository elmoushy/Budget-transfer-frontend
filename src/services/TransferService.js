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

export default {
  /**
   * Fetches transfer details by transaction ID
   * @param {number} transactionId - The transaction ID to fetch
   * @returns {Promise} - Promise with transfer data
   */
  async getTransferDetails(transactionId) {
    const authStore = useAuthStore()
    try {
      const response = await axios.get(
        `${BASE_URL}/api/adjd-transfers/?transaction=${transactionId}`,
        {
          headers: {
            Authorization: `Bearer ${authStore.token}`,
          },
        },
      )
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
        `${BASE_URL}/api/adjd-transfers/${transactionId}/submit/`,
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
        `${BASE_URL}/api/adjd-transfers/${transactionId}/reopen/`,
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
      const response = await axios.get(`${BASE_URL}/api/adjd-transfers/${transactionId}/report/`, {
        headers: {
          Authorization: `Bearer ${authStore.token}`,
        },
        responseType: 'blob',
      })
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
      const response = await axios.post(`${BASE_URL}/api/adjd-transfers/create/`, transferData, {
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
   * Alternative method: Get transfers using an axios instance
   * (Optional if needed, otherwise you can remove this method)
   * @param {number} transactionId
   */
  getTransfers(transactionId) {
    return axios.get(`${BASE_URL}/api/adjd-transfers/?transaction=${transactionId}`)
  },
}
