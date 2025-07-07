// Type definitions for TransferService

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
  results?: T[]
  summary?: ApiSummary
  transfers?: TransferData[]
  count?: number
  next?: string
  previous?: string
}

export interface ApiSummary {
  status?: string
  total?: number
  count?: number
  [key: string]: unknown
}

export interface TransferData {
  transaction_id: number
  status: string
  code: string
  request_date: string
  requested_by: string
  transaction_date: string
  amount?: number
  description?: string
  attachment_count?: number
  type?: string
  user_id?: number
  notes?: string
  description_x?: string
  [key: string]: unknown
}

export interface FlowData {
  transaction_id: number
  status: string
  code: string
  request_date: string
  requested_by: string
  transaction_date: string
  amount?: number
  description?: string
  attachment_count?: number
  type?: string
  user_id?: number
  notes?: string
  description_x?: string
  [key: string]: unknown
}

export interface RowData {
  transaction_id: number
  status: string
  code: string
  request_date: string
  requested_by: string
  transaction_date: string
  amount?: number
  description?: string
  [key: string]: unknown
}

export interface RejectionReport {
  id: number
  transaction_id: number
  rejection_reason: string
  rejected_by: string
  rejection_date: string
  created_at?: string
  reason_text?: string
  'rejected by'?: string
  [key: string]: unknown
}

export interface UpdateLevelData {
  level_name: string
  level_order?: number
  [key: string]: unknown
}

export declare const PAGE_SIZE: number

declare const transferService: {
  fetchTransfers(searchQuery?: string, page?: number): Promise<ApiResponse>
  getTransfers(transactionId: number): Promise<ApiResponse>
  getRejectionReports(transactionId: number): Promise<RejectionReport[]>
  [key: string]: (...args: unknown[]) => Promise<unknown>
}

export default transferService
