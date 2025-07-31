/**
 * Centralized API configuration
 * All API URL related constants should be defined here
 */

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

// Base API URL - use environment variable if available or fallback to production URL

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
    TOKEN_REFRESH: '/api/auth/token-refresh/',
    CHANGE_PASSWORD: '/api/auth/change-password/',
    // User levels endpoints
    LEVELS: '/api/auth/levels/',
    LEVEL_UPDATE: '/api/auth/levels/update/',
    USER_LEVEL_ASSIGN: '/api/auth/users/level/update/',
  },

  // Budget endpoints
  BUDGET: {
    TRANSFERS_LIST: '/api/budget/transfers/list/',
    TRANSFER_DELETE: '/api/budget/transfers/:id/delete/',
    TRANSFERS_PENDING_APPROVAL: '/api/budget/transfers/list_underapprovel/',
    TRANSFER_APPROVE_REJECT: '/api/budget/transfers/adjd-approve-reject/',
    DASHBOARD: '/api/budget/dashboard/',
  },

  // Accounts and entities
  ACCOUNTS_ENTITIES: {
    ENTITIES: '/api/accounts-entities/entities/',
    ENTITIES_CREATE: '/api/accounts-entities/entities/create/',
    ENTITY_DETAIL: '/api/accounts-entities/entities/:id/',
    ENTITY_UPDATE: '/api/accounts-entities/entities/:id/update/',
    ENTITY_DELETE: '/api/accounts-entities/entities/:id/delete/',
    ACCOUNTS: '/api/accounts-entities/accounts/',
    ACCOUNT_CREATE: '/api/accounts-entities/accounts/create/',
    ACCOUNT_DETAIL: '/api/accounts-entities/accounts/:id/',
    ACCOUNT_UPDATE: '/api/accounts-entities/accounts/:id/update/',
    ACCOUNT_DELETE: '/api/accounts-entities/accounts/:id/delete/',
    ACCOUNT_ENTITY_LIMIT_LIST: '/api/accounts-entities/account-entity-limit/list',
    ACCOUNT_ENTITY_LIMIT_UPDATE: '/api/accounts-entities/account-entity-limit/update/',
    MAIN_ROUTES: '/api/admin_panel/main-routes/',
    MAIN_CURRENCIES: '/api/admin_panel/main-currencies/',
  },
}

// Common pagination settings
export const PAGINATION = {
  PAGE_SIZE: 10,
}
