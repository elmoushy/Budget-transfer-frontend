/**
 * User Abilities Service - API calls for User Abilities management
 * Only accessible by SuperAdmin users
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

export interface UserAbility {
  id: number
  user: string
  entity: string
  type: 'edit' | 'approve'
}

export interface CreateUserAbilityRequest {
  user: number
  entity: number
  type: 'edit' | 'approve'
}

export interface UpdateUserAbilityRequest {
  id: number
  user: number
  entity: number
  type: 'edit' | 'approve'
}

export interface DeleteUserAbilityRequest {
  id: number
}

export interface CreateUserAbilityResponse {
  message: string
  ability: UserAbility
}

export interface UpdateUserAbilityResponse {
  message: string
}

export interface DeleteUserAbilityResponse {
  message: string
}

export interface UserAbilityFilters {
  user?: number
  entity?: number
  type?: 'edit' | 'approve'
}

/**
 * User Abilities Service methods
 */
export default {
  /**
   * Get all user abilities with optional filtering
   * @param {UserAbilityFilters} filters - Optional filters for user, entity, or type
   * @returns {Promise<UserAbility[]>} List of user abilities
   */
  async getUserAbilities(filters?: UserAbilityFilters): Promise<UserAbility[]> {
    try {
      const params = new URLSearchParams()
      if (filters?.user) params.append('user', filters.user.toString())
      if (filters?.entity) params.append('entity', filters.entity.toString())
      if (filters?.type) params.append('type', filters.type)

      const queryString = params.toString()
      const url = `${API_BASE_URL}/api/auth/user/abilities/${queryString ? `?${queryString}` : ''}`

      const response = await axios.get(url, {
        headers: getAuthHeaders(),
      })

      return response.data
    } catch (error) {
      console.error('Error fetching user abilities:', error)
      throw error
    }
  },

  /**
   * Create a new user ability
   * @param {CreateUserAbilityRequest} abilityData - Ability data (user, entity, type)
   * @returns {Promise<CreateUserAbilityResponse>} Created ability response
   */
  async createUserAbility(
    abilityData: CreateUserAbilityRequest,
  ): Promise<CreateUserAbilityResponse> {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/user/abilities/`, abilityData, {
        headers: getAuthHeaders(),
      })
      return response.data
    } catch (error) {
      console.error('Error creating user ability:', error)
      throw error
    }
  },

  /**
   * Update an existing user ability
   * @param {UpdateUserAbilityRequest} abilityData - Ability data (id, user, entity, type)
   * @returns {Promise<UpdateUserAbilityResponse>} Update response
   */
  async updateUserAbility(
    abilityData: UpdateUserAbilityRequest,
  ): Promise<UpdateUserAbilityResponse> {
    try {
      const response = await axios.put(`${API_BASE_URL}/api/auth/user/abilities/`, abilityData, {
        headers: getAuthHeaders(),
      })
      return response.data
    } catch (error) {
      console.error('Error updating user ability:', error)
      throw error
    }
  },

  /**
   * Delete a user ability
   * @param {DeleteUserAbilityRequest} deleteData - Data containing ability ID to delete
   * @returns {Promise<DeleteUserAbilityResponse>} Delete response
   */
  async deleteUserAbility(
    deleteData: DeleteUserAbilityRequest,
  ): Promise<DeleteUserAbilityResponse> {
    try {
      const response = await axios.delete(`${API_BASE_URL}/api/auth/user/abilities/`, {
        headers: getAuthHeaders(),
        data: deleteData,
      })
      return response.data
    } catch (error) {
      console.error('Error deleting user ability:', error)
      throw error
    }
  },
}
