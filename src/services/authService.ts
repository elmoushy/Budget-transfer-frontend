/**
 * JWT Authentication Service
 * Handles all JWT token-related operations
 */

import axios from 'axios'
import { API_BASE_URL } from '@/config/api'

export interface LoginCredentials {
  username: string
  password: string
}

export interface LoginResponse {
  data: {
    id: number
    username: string
    role: string
    can_transfer_budget: boolean
  }
  message: string
  token: string
  refresh: string
}

export interface TokenValidationResponse {
  data: {
    id: number
    username: string
    role: string
    can_transfer_budget: boolean
  }
  message: string
  token: string
}

export interface TokenRefreshResponse {
  access: string
  refresh: string
}

export interface PasswordChangeRequest {
  old_password: string
  new_password: string
}

export interface PasswordChangeResponse {
  message: string
}

export class AuthenticationService {
  private static instance: AuthenticationService

  private constructor() {}

  public static getInstance(): AuthenticationService {
    if (!AuthenticationService.instance) {
      AuthenticationService.instance = new AuthenticationService()
    }
    return AuthenticationService.instance
  }

  /**
   * Login with username and password
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/login/`, credentials, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      return response.data
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  /**
   * Validate current access token
   */
  async validateToken(token: string): Promise<TokenValidationResponse> {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/auth/token-expired/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      return response.data
    } catch (error) {
      console.error('Token validation error:', error)
      throw error
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(refreshToken: string): Promise<TokenRefreshResponse> {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/token-refresh/`, {
        refresh: refreshToken,
      })
      return response.data
    } catch (error) {
      console.error('Token refresh error:', error)
      throw error
    }
  }

  /**
   * Change user password
   */
  async changePassword(
    token: string,
    passwordData: PasswordChangeRequest,
  ): Promise<PasswordChangeResponse> {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/change-password/`, passwordData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      return response.data
    } catch (error) {
      console.error('Password change error:', error)
      throw error
    }
  }

  /**
   * Logout (optional server-side logout if implemented)
   */
  async logout(token: string): Promise<void> {
    try {
      await axios.post(
        `${API_BASE_URL}/api/auth/logout/`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
    } catch (error) {
      console.error('Logout error:', error)
      // Don't throw error for logout as it's not critical
    }
  }
}

export const authService = AuthenticationService.getInstance()
