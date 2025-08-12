import axios from 'axios'
import { useAuthStore } from '@/stores/authStore'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
const API_ENDPOINT = '/api/budget/transfers/list/'
const PAGE_SIZE = 6

/**
 * Service for handling contract-related API operations
 */
export { PAGE_SIZE }

export default {
  /**
   * Fetch contracts with optional search and pagination
   * @param {string} searchQuery - Optional search term
   * @param {number} page - Page number for pagination
   * @returns {Promise} - API response with contract data
   */
  async fetchContracts(searchQuery = '', page = 1) {
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

    // Always include "CON" as the code in the request body
    // If there's a search query, include it as well
    const requestBody = searchQuery.trim()
      ? { code: 'FAD', search: searchQuery.trim() }
      : { code: 'FAD' }

    try {
      const response = await axios.post(`${API_BASE_URL}${API_ENDPOINT}`, requestBody, {
        params,
        headers,
      })
      return response.data
    } catch (error) {
      console.error('Error fetching contracts:', error)
      throw error
    }
  },

  /**
   * Delete a contract by ID
   * @param {number} contractId - The ID of the contract to delete
   * @returns {Promise} - API response
   */
  async deleteContract(contractId) {
    const authStore = useAuthStore()

    if (!authStore.token) {
      throw new Error('Authentication token not found')
    }

    try {
      const response = await axios.delete(
        `${API_BASE_URL}/api/budget/transfers/${contractId}/delete/`,
        {
          headers: {
            Authorization: `Bearer ${authStore.token}`,
            Accept: 'application/json',
          },
        },
      )
      return response.data
    } catch (error) {
      console.error('Error deleting contract:', error)
      throw error
    }
  },

  /**
   * Fetches contract details by transaction ID
   * @param {number} transactionId - The transaction ID to fetch
   * @returns {Promise} - Promise with contract data containing:
   *   - summary: Object with transaction_id, balanced status
   *   - contracts: Array of contract objects with validation_errors
   */
  async getContractDetails(transactionId) {
    const authStore = useAuthStore()
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/adjd-transfers/?transaction=${transactionId}`,
        {
          headers: {
            Authorization: `Bearer ${authStore.token}`,
            Accept: 'application/json',
          },
        },
      )
      return response.data
    } catch (error) {
      console.error('Error fetching contract details:', error)
      throw error
    }
  },

  /**
   * Submit a contract request
   * @param {number} transactionId - The transaction ID
   * @returns {Promise} - Promise with response
   */
  async submitContractRequest(transactionId) {
    const authStore = useAuthStore()
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/adjd-transfers/submit/`,
        { transaction: transactionId },
        {
          headers: {
            Authorization: `Bearer ${authStore.token}`,
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        },
      )
      return response.data
    } catch (error) {
      console.error('Error submitting contract request:', error)
      throw error
    }
  },

  /**
   * Reopen a contract request
   * @param {number} transactionId - The transaction ID
   * @returns {Promise} - Promise with response
   */
  async reopenContractRequest(transactionId) {
    const authStore = useAuthStore()
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/adjd-transfers/reopen/`,
        {
          transaction: transactionId,
          action: 'reopen',
        },
        {
          headers: {
            Authorization: `Bearer ${authStore.token}`,
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        },
      )
      return response.data
    } catch (error) {
      console.error('Error reopening contract request:', error)
      throw error
    }
  },

  /**
   * Generate report for a contract
   * @param {number} transactionId - The transaction ID
   * @returns {Promise} - Promise with report data
   */
  async generateReport(transactionId) {
    const authStore = useAuthStore()
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/budget/transfers/${transactionId}/report/`,
        {
          headers: {
            Authorization: `Bearer ${authStore.token}`,
            Accept: 'application/json',
          },
        },
      )
      return response.data
    } catch (error) {
      console.error('Error generating report:', error)
      throw error
    }
  },

  /**
   * Create contract requests
   * @param {Array} contractData - Array of contract objects
   * @returns {Promise} - Promise with response
   */
  async createContract(contractData) {
    const authStore = useAuthStore()
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/adjd-transfers/create/`,
        contractData,
        {
          headers: {
            Authorization: `Bearer ${authStore.token}`,
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        },
      )
      return response.data
    } catch (error) {
      console.error('Error creating contract:', error)
      throw error
    }
  },

  /**
   * Upload file attachments for a contract
   * @param {File} file - The file to upload
   * @param {number} transactionId - The transaction ID
   * @returns {Promise} - Promise with response
   */
  async uploadFile(file, transactionId) {
    const authStore = useAuthStore()
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await axios.post(
        `${API_BASE_URL}/api/budget/transfers/${transactionId}/files/upload/`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${authStore.token}`,
            Accept: 'application/json',
            'Content-Type': 'multipart/form-data',
          },
        },
      )
      return response.data
    } catch (error) {
      console.error('Error uploading file:', error)
      throw error
    }
  },
  /**
   * List file attachments for a contract
   * @param {number} transactionId - The transaction ID
   * @returns {Promise} - Promise with response containing array of attachments
   */
  async listFiles(transactionId) {
    const authStore = useAuthStore()
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/budget/transfers/${transactionId}/files/`,
        {
          headers: {
            Authorization: `Bearer ${authStore.token}`,
            Accept: 'application/json',
          },
        },
      )
      return response.data
    } catch (error) {
      console.error('Error listing files:', error)
      throw error
    }
  },

  /**
   * Download a file attachment
   * @param {number} fileId - The ID of the file to download
   * @returns {Promise} - Promise with file blob
   */
  async downloadFile(fileId) {
    const authStore = useAuthStore()
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/budget/transfers/files/${fileId}/download/`,
        {
          headers: {
            Authorization: `Bearer ${authStore.token}`,
          },
          responseType: 'blob',
        },
      )
      return response.data
    } catch (error) {
      console.error('Error downloading file:', error)
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
        `${API_BASE_URL}/api/budget/transfers/${transactionId}/excel/upload/`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${authStore.token}`,
            Accept: 'application/json',
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
        `${API_BASE_URL}/api/accounts-entities/pivot-funds/getdetail/`,
        {
          params: {
            entity_id: entityId,
            account_id: accountId,
          },
          headers: {
            Authorization: `Bearer ${authStore.token}`,
            Accept: 'application/json',
          },
        },
      )
      return response.data
    } catch (error) {
      console.error('Error fetching pivot fund details:', error)
      throw error
    }
  },

  /**
   * Alternative method: Get contracts using an axios instance
   * (Optional if needed, otherwise you can remove this method)
   * @param {number} transactionId
   * @returns {Promise} - Promise with contract data containing summary and contracts array
   */
  getContracts(transactionId) {
    const authStore = useAuthStore()
    return axios.get(`${API_BASE_URL}/api/budget/transfers/${transactionId}/`, {
      headers: {
        Authorization: `Bearer ${authStore.token}`,
        Accept: 'application/json',
      },
    })
  },
}
