/**
 * User Service
 * Handles user-related API operations
 */

import axios from 'axios'
import { API_BASE_URL } from '@/config/api'
import { useAuthStore } from '@/stores/authStore'

export interface User {
  id: number
  username: string
  role: 'admin' | 'user' | 'superadmin'
  can_transfer_budget: boolean
  user_level: string
}

/**
 * Get auth headers with the JWT token
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

export class UserService {
  private static instance: UserService

  private constructor() {}

  public static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService()
    }
    return UserService.instance
  }

  /**
   * Fetch all users (admin only)
   */
  async getUsers(): Promise<User[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/auth/users/`, {
        headers: getAuthHeaders(),
      })

      // The API returns an array directly according to the documentation
      return response.data
    } catch (error) {
      console.error('Error fetching users:', error)
      throw error
    }
  }
}

export const userService = UserService.getInstance()
