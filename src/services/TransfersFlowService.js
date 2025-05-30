import axios from 'axios'
import { useAuthStore } from '@/stores/authStore'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export default {
  /**
   * Fetch transfers pending approval with pagination and search
   * @param {number} page - Page number
   * @param {number} pageSize - Items per page
   * @param {string} search - Optional search term
   * @param {string} code - Code identifier for the transfer type
   * @returns {Promise} - API response with transfers data
   */
  async fetchPendingTransfers(page = 1, pageSize = 10, search = '', code = '') {
    const authStore = useAuthStore()

    if (!authStore.token) {
      throw new Error('Authentication token not found')
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/api/budget/transfers/list_underapprovel/`, {
        headers: {
          Authorization: `Bearer ${authStore.token}`,
        },
        params: {
          page,
          page_size: pageSize,
          code,
          search: search.trim(),
        },
      })
      return response.data
    } catch (error) {
      console.error('Error fetching transfers pending approval:', error)
      throw error
    }
  },

  /**
   * Approve or reject transfers
   * @param {Array} transactionIds - Array of transaction IDs
   * @param {number} decision - 2 for approve, 3 for reject
   * @param {Array} reasons - Array of reasons for rejection (required when rejecting)
   * @returns {Promise} - API response
   */
  async approveRejectTransfers(transactionIds, decision, reasons = []) {
    const authStore = useAuthStore()

    if (!authStore.token) {
      throw new Error('Authentication token not found')
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/budget/transfers/adjd-approve-reject/`,
        {
          transaction_id: transactionIds,
          decide: transactionIds.map(() => decision),
          reason: reasons.length ? reasons : transactionIds.map(() => ''),
        },
        {
          headers: {
            Authorization: `Bearer ${authStore.token}`,
          },
        },
      )
      return response.data
    } catch (error) {
      console.error('Error approving/rejecting transfers:', error)
      throw error
    }
  },
}
