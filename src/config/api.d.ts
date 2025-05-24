// Type definitions for API config

export const API_BASE_URL: string

export interface BudgetEndpoints {
  TRANSFERS_LIST: string
  TRANSFER_DELETE: string
  TRANSFERS_PENDING_APPROVAL: string
  TRANSFER_APPROVE_REJECT: string
  DASHBOARD: string
}

export interface AuthEndpoints {
  LOGIN: string
  LOGOUT: string
  REGISTER: string
  USERS: string
  USER_UPDATE: string
  USER_DELETE: string
  NOTIFICATIONS: string
  LEVELS: string
  LEVEL_UPDATE: string
  USER_LEVEL_ASSIGN: string
}

export interface AccountsEntitiesEndpoints {
  ENTITIES: string
  ENTITIES_CREATE: string
  ENTITY_DETAIL: string
  ENTITY_UPDATE: string
  ENTITY_DELETE: string
  ACCOUNTS: string
  ACCOUNT_CREATE: string
  ACCOUNT_DETAIL: string
  ACCOUNT_UPDATE: string
  ACCOUNT_DELETE: string
  ACCOUNT_ENTITY_LIMIT_LIST: string
  ACCOUNT_ENTITY_LIMIT_UPDATE: string
}

export interface EndpointsType {
  AUTH: AuthEndpoints
  BUDGET: BudgetEndpoints
  ACCOUNTS_ENTITIES: AccountsEntitiesEndpoints
}

export const ENDPOINTS: EndpointsType
