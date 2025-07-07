// Type declaration file for UnifiedTransferService
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
  type: string
  attachment_count?: number
  from_center?: number | null
  to_center?: number | null
  approved_budget?: number | null
  available_budget?: number | null
  encumbrance?: number | null
  actual?: number | null
  [key: string]: unknown
}

export interface ApiResponse<T> {
  results?: T
  count?: number
  next?: string | null
  previous?: string | null
  data?: T
  status?: number
  message?: string
}

export interface PivotFundDetails {
  actual: number
  fund: number
  budget: number
  encumbrance: number
}

export interface Attachment {
  id: number
  file: string
  name: string
}

declare const unifiedTransferService: {
  fetchTransfers(
    code: string,
    searchQuery?: string,
    page?: number,
  ): Promise<ApiResponse<{ results: TransferData[]; count: number }>>
  deleteTransfer(transferId: number): Promise<ApiResponse<void>>
  getTransferDetails(transactionId: number): Promise<ApiResponse<TransferData>>
  submitTransferRequest(transactionId: number): Promise<ApiResponse<{ message: string }>>
  reopenTransferRequest(transactionId: number): Promise<ApiResponse<{ message: string }>>
  generateReport(transactionId: number): Promise<Blob>
  createTransfer(
    code: string,
    transferData: Partial<TransferData>[],
  ): Promise<ApiResponse<TransferData>>
  uploadFile(file: File, transactionId: number): Promise<ApiResponse<{ message: string }>>
  listFiles(transactionId: number): Promise<ApiResponse<Attachment[]>>
  uploadExcelFile(file: File, transactionId: number): Promise<ApiResponse<{ message: string }>>
  getPivotFundDetails(entityId: string, accountId: string): Promise<ApiResponse<PivotFundDetails>>
  getTransfers(transactionId: number): Promise<ApiResponse<TransferData>>
}

export default unifiedTransferService
