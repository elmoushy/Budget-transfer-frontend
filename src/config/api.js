/**
 * Centralized API configuration
 * All API URL related constants should be defined here
 */

// Base API URL - use environment variable if available or fallback to localhost
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

// API endpoints
export const ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: '/api/auth/login/',
    LOGOUT: '/api/auth/logout/',
    REGISTER: '/api/auth/register/',
    USERS: '/api/auth/users/',
    USER_UPDATE: '/api/auth/users/update/',
    USER_DELETE: '/api/auth/users/delete/',
    NOTIFICATIONS: '/api/auth/Notifications',
  },

  // Budget endpoints
  BUDGET: {
    TRANSFERS_LIST: '/api/budget/transfers/list/',
    TRANSFER_DELETE: '/api/budget/transfers/:id/delete/',
    TRANSFERS_PENDING_APPROVAL: '/api/budget/transfers/list_underapprovel/',
    TRANSFER_APPROVE_REJECT: '/api/budget/transfers/adjd-approve-reject/',
  },

  // Accounts and entities
  ACCOUNTS_ENTITIES: {
    ENTITIES: '/api/accounts-entities/entities/',
    ACCOUNTS: '/api/accounts-entities/accounts/',
    ACCOUNT_ENTITY_LIMIT_LIST: '/api/accounts-entities/account-entity-limit/list',
    ACCOUNT_ENTITY_LIMIT_UPDATE: '/api/accounts-entities/account-entity-limit/update/',
  },
}

// Common pagination settings
export const PAGINATION = {
  PAGE_SIZE: 10,
}
