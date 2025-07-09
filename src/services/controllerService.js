/**
 * Controller Service - API calls for Currencies and Routes management
 */

import axios from 'axios'
import { API_BASE_URL } from '@/config/api'
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
 * Controller Service methods
 */
export default {
  // ==================== CURRENCIES ====================

  /**
   * List all main currencies
   * @returns {Promise<Array>} List of currencies
   */
  async listCurrencies() {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/admin_panel/main-currencies/`, {
        headers: getAuthHeaders(),
      })
      // Return the data array from the nested response structure
      return response.data.data
    } catch (error) {
      console.error('Error fetching currencies:', error)
      throw error
    }
  },

  /**
   * Create a new currency
   * @param {Object} currencyData - Currency data (name, icon)
   * @returns {Promise<Object>} Created currency
   */
  async createCurrency(currencyData) {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/admin_panel/main-currencies/create/`,
        currencyData,
        { headers: getAuthHeaders() },
      )
      // Return the created currency data from the nested response structure
      return response.data.data
    } catch (error) {
      console.error('Error creating currency:', error)
      throw error
    }
  },

  /**
   * Get currency details by ID
   * @param {number} id - Currency ID
   * @returns {Promise<Object>} Currency details
   */
  async getCurrency(id) {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/admin_panel/main-currencies/${id}/`, {
        headers: getAuthHeaders(),
      })
      // Return the currency data from the nested response structure
      return response.data.data
    } catch (error) {
      console.error('Error fetching currency:', error)
      throw error
    }
  },

  /**
   * Update currency
   * @param {number} id - Currency ID
   * @param {Object} currencyData - Updated currency data
   * @returns {Promise<Object>} Updated currency
   */
  async updateCurrency(id, currencyData) {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/admin_panel/main-currencies/${id}/update/`,
        currencyData,
        { headers: getAuthHeaders() },
      )
      // Return the updated currency data from the nested response structure
      return response.data.data
    } catch (error) {
      console.error('Error updating currency:', error)
      throw error
    }
  },

  /**
   * Delete currency
   * @param {number} id - Currency ID
   * @returns {Promise<void>}
   */
  async deleteCurrency(id) {
    try {
      await axios.delete(`${API_BASE_URL}/api/admin_panel/main-currencies/${id}/delete/`, {
        headers: getAuthHeaders(),
      })
    } catch (error) {
      console.error('Error deleting currency:', error)
      throw error
    }
  },

  // ==================== ROUTES ====================

  /**
   * List all main routes
   * @returns {Promise<Array>} List of routes
   */
  async listRoutes() {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/admin_panel/main-routes/`, {
        headers: getAuthHeaders(),
      })
      // Return the routes data from the nested response structure
      return response.data.data
    } catch (error) {
      console.error('Error fetching routes:', error)
      throw error
    }
  },

  /**
   * Create a new route
   * @param {Object} routeData - Route data (english_name, arabic_name)
   * @returns {Promise<Object>} Created route
   */
  async createRoute(routeData) {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/admin_panel/main-routes/create/`,
        routeData,
        { headers: getAuthHeaders() },
      )
      // Return the created route data from the nested response structure
      return response.data.data
    } catch (error) {
      console.error('Error creating route:', error)
      throw error
    }
  },

  /**
   * Get route details by ID
   * @param {number} id - Route ID
   * @returns {Promise<Object>} Route details
   */
  async getRoute(id) {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/admin_panel/main-routes/${id}/`, {
        headers: getAuthHeaders(),
      })
      // Return the route data from the nested response structure
      return response.data.data
    } catch (error) {
      console.error('Error fetching route:', error)
      throw error
    }
  },

  /**
   * Update route
   * @param {number} id - Route ID
   * @param {Object} routeData - Updated route data
   * @returns {Promise<Object>} Updated route
   */
  async updateRoute(id, routeData) {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/admin_panel/main-routes/${id}/update/`,
        routeData,
        { headers: getAuthHeaders() },
      )
      // Return the updated route data from the nested response structure
      return response.data.data
    } catch (error) {
      console.error('Error updating route:', error)
      throw error
    }
  },

  /**
   * Delete route
   * @param {number} id - Route ID
   * @returns {Promise<void>}
   */
  async deleteRoute(id) {
    try {
      await axios.delete(`${API_BASE_URL}/api/admin_panel/main-routes/${id}/delete/`, {
        headers: getAuthHeaders(),
      })
    } catch (error) {
      console.error('Error deleting route:', error)
      throw error
    }
  },
}
