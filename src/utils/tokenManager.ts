/**
 * Token Manager Utility
 * Handles token storage, validation, and refresh operations
 */

export interface TokenData {
  access: string
  refresh: string
  expiresAt?: number
}

export class TokenManager {
  private static readonly ACCESS_TOKEN_KEY = 'token'
  private static readonly REFRESH_TOKEN_KEY = 'refreshToken'
  private static readonly EXPIRES_AT_KEY = 'tokenExpiresAt'

  /**
   * Store tokens in localStorage
   */
  static storeTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken)
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken)

    // JWT tokens typically expire in 24 hours (1440 minutes)
    // Store expiration time for proactive refresh
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000 // 24 hours from now
    localStorage.setItem(this.EXPIRES_AT_KEY, expiresAt.toString())
  }

  /**
   * Get access token from localStorage
   */
  static getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY)
  }

  /**
   * Get refresh token from localStorage
   */
  static getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY)
  }

  /**
   * Get token expiration time
   */
  static getTokenExpiresAt(): number | null {
    const expiresAt = localStorage.getItem(this.EXPIRES_AT_KEY)
    return expiresAt ? parseInt(expiresAt, 10) : null
  }

  /**
   * Check if access token is expired or about to expire
   */
  static isTokenExpired(bufferMinutes: number = 5): boolean {
    const expiresAt = this.getTokenExpiresAt()
    if (!expiresAt) return true

    // Consider token expired if it expires within the buffer time
    const bufferMs = bufferMinutes * 60 * 1000
    return Date.now() + bufferMs >= expiresAt
  }

  /**
   * Check if we have valid tokens
   */
  static hasValidTokens(): boolean {
    const accessToken = this.getAccessToken()
    const refreshToken = this.getRefreshToken()

    return !!(accessToken && refreshToken && !this.isTokenExpired())
  }

  /**
   * Clear all stored tokens
   */
  static clearTokens(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY)
    localStorage.removeItem(this.REFRESH_TOKEN_KEY)
    localStorage.removeItem(this.EXPIRES_AT_KEY)
  }

  /**
   * Update only the access token (used after refresh)
   */
  static updateAccessToken(accessToken: string): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken)

    // Update expiration time
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000 // 24 hours from now
    localStorage.setItem(this.EXPIRES_AT_KEY, expiresAt.toString())
  }

  /**
   * Get all token data
   */
  static getTokenData(): TokenData | null {
    const access = this.getAccessToken()
    const refresh = this.getRefreshToken()
    const expiresAt = this.getTokenExpiresAt()

    if (!access || !refresh) return null

    return {
      access,
      refresh,
      expiresAt: expiresAt || undefined,
    }
  }

  /**
   * Parse JWT token payload (without verification)
   * This is used for extracting user info from the token
   */
  static parseJWTPayload(token: string): Record<string, unknown> | null {
    try {
      const base64Url = token.split('.')[1]
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      const jsonPayload = decodeURIComponent(
        window
          .atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join(''),
      )
      return JSON.parse(jsonPayload)
    } catch (error) {
      console.error('Error parsing JWT token:', error)
      return null
    }
  }

  /**
   * Get token expiration from JWT payload
   */
  static getJWTExpiration(token: string): number | null {
    const payload = this.parseJWTPayload(token)
    if (payload && typeof payload.exp === 'number') {
      return payload.exp * 1000 // Convert to milliseconds
    }
    return null
  }

  /**
   * Check if JWT token is expired based on its exp claim
   */
  static isJWTExpired(token: string): boolean {
    const expiration = this.getJWTExpiration(token)
    if (!expiration) return true

    return Date.now() >= expiration
  }
}
