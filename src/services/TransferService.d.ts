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
  balanced?: boolean
  from_sum?: number
  to_sum?: number
  diff?: number
  transaction_id?: number
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

export interface DeleteResponse {
  success: boolean
  message?: string
}

export type BlobResponse = Blob

export interface TransferRequestData {
  [key: string]: unknown
}

export interface BudgetTransferRequestData {
  [key: string]: unknown
}

export declare const PAGE_SIZE: number

declare const transferService: {
  fetchTransfers(searchQuery?: string, page?: number): Promise<ApiResponse>
  deleteTransfer(transferId: number): Promise<DeleteResponse>
  getTransfers(transactionId: number): Promise<ApiResponse>
  getTransferDetails(transactionId: number): Promise<ApiResponse>
  fetchTransferDetails(transactionId: number): Promise<ApiResponse>
  approveTransferRequest(transactionId: number): Promise<ApiResponse>
  rejectTransferRequest(transactionId: number, rejectionReason: string): Promise<ApiResponse>
  reopenTransferRequest(transactionId: number): Promise<ApiResponse>
  generateReport(transactionId: number): Promise<BlobResponse>
  createTransfer(transferData: TransferRequestData[]): Promise<ApiResponse>
  createTransferRequests(transferData: TransferRequestData[]): Promise<ApiResponse>
  submitTransferRequest(transactionId: number): Promise<ApiResponse>
  updateTransferRequestsLevel(
    transactionId: number,
    levelData: UpdateLevelData,
  ): Promise<ApiResponse>
  fetchTransfersFlow(searchQuery?: string, page?: number): Promise<ApiResponse>
  deleteTransferRequest(transactionId: number): Promise<ApiResponse>
  fetchAccountsEntities(): Promise<ApiResponse>
  fetchCostCenterDetailsByEntity(entityId: number): Promise<ApiResponse>
  fetchAccountByEntityAndCostCenter(entityId: number, costCenterId: number): Promise<ApiResponse>
  createBudgetTransferRequest(requestData: BudgetTransferRequestData): Promise<ApiResponse>
  getPivotFundDetails(entityId: string | number, accountId: string | number): Promise<ApiResponse>
  fetchPivotFundsDetail(entityId: number, accountId: number): Promise<ApiResponse>
  getRejectionReports(transactionId: number): Promise<RejectionReport[]>
}

export default transferService
