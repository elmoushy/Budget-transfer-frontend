// Type definitions for CostCenterTransferRequest.vue

export interface TransferItem {
  transfer_id?: number
  to_center?: number | null
  from_center?: number | null
  to_center_input?: string
  from_center_input?: string
  account_code?: string
  account_name?: string
  cost_center_code?: string
  cost_center_name?: string
  approved_budget?: number | null
  available_budget?: number | null
  encumbrance?: number | null
  actual?: number | null
  approved_budget_input?: string
  available_budget_input?: string
  encumbrance_input?: string
  actual_input?: string
  validation_errors?: string[]
  lastChangedField?: string | null
  transaction?: number
  done?: number
  financialDataFromApi?: boolean
  [key: string]: unknown // Allow dynamic property access
}

export interface ApiSummary {
  balanced: boolean
  from_sum: number
  to_sum: number
  diff: number
  transaction_id?: number
  status?: string
}

export interface CostCenterEntity {
  entity: string
  alias_default: string
  id?: number
  alias?: string
  alias_ar?: string
  alias_en?: string
}

export interface AccountEntity {
  account: string
  alias_default: string
  id?: number
  alias?: string
  alias_ar?: string
  alias_en?: string
}
