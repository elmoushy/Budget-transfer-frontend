import axios from 'axios'
import { useAuthStore } from '@/stores/authStore'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export default {
  /**
   * Fetch transfers pending approval with pagination and search
   * @param {number} page - Page number
   * @param {number} pageSize - Items per page
   * @param {string} search - Optional search term
   * @returns {Promise} - API response with transfers data
   */
  async fetchPendingTransfers(page = 1, pageSize = 10, search = '') {
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
   * @returns {Promise} - API response
   */
  async approveRejectTransfers(transactionIds, decision) {
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
