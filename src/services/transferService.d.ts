// Type declaration file for transferService
export const PAGE_SIZE: number

export interface TransferData {
  transaction_id: number
  transaction_date: string
  amount: number
  status: string
  requested_by: string
  user_id: number
  request_date: string
  notes: string
  description_x: string
  code: string
  attachment_count?: number
  // Allow additional properties with defined types
  to_center?: number | null
  from_center?: number | null
  approved_budget?: number | null
  available_budget?: number | null
  encumbrance?: number | null
  actual?: number | null
  cost_center_code?: string
  cost_center_name?: string
  account_code?: string
  account_name?: string
}

export interface ApiResponse<T = unknown> {
  results?: T[]
  count?: number
  next?: string | null
  previous?: string | null
  data?: T
  // Add index signature for flexibility
  [key: string]: unknown
}

export interface RejectionReport {
  id: number
  transaction_id: number
  reason: string
  reason_text?: string
  date?: string
  created_at?: string
  user_name: string
  user_id: number
  'rejected by'?: string
  [key: string]: unknown // For backward compatibility
}

export interface Attachment {
  id: number
  file: string
  name: string
}

declare const transferService: {
  fetchTransfers(searchQuery?: string, page?: number): Promise<ApiResponse<TransferData>>
  getTransferById(id: number): Promise<ApiResponse<TransferData>>
  createTransfer(
    data: Partial<TransferData>[] | Partial<TransferData>,
  ): Promise<ApiResponse<TransferData>>
  updateTransfer(id: number, data: Partial<TransferData>): Promise<ApiResponse<TransferData>>
  getAttachments(id: number): Promise<ApiResponse<Attachment>>
  uploadAttachments(id: number, files: File[]): Promise<ApiResponse<{ message: string }>>
  deleteAttachment(id: number): Promise<ApiResponse<void>>
  deleteTransfer(transferId: number): Promise<ApiResponse<void>>
  getTransferDetails(transactionId: number): Promise<
    ApiResponse<{
      summary: { transaction_id: number; balanced: boolean }
      transfers: TransferData[]
    }>
  >
  submitTransferRequest(transactionId: number): Promise<ApiResponse<{ message: string }>>
  reopenTransferRequest(transactionId: number): Promise<ApiResponse<{ message: string }>>
  generateReport(transactionId: number): Promise<Blob>
  getRejectionReports(transactionId: number): Promise<RejectionReport[]>
  getPivotFundDetails(
    costCenterCode: string,
    accountCode: string,
  ): Promise<
    ApiResponse<{
      approved_budget: number | null
      available_budget: number | null
      actual: number | null
      encumbrance: number | null
    }>
  >
}

export default transferService
