// Type definition for Enhancements service
export interface EnhancementData {
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
}

declare const enhancementsService: {
  fetchEnhancements(
    searchQuery?: string,
    page?: number,
  ): Promise<ApiResponse<{ results: EnhancementData[]; count: number }>>
  fetchTransfers(
    searchQuery?: string,
    page?: number,
  ): Promise<ApiResponse<{ results: EnhancementData[]; count: number }>>
  getEnhancementById(id: number): Promise<ApiResponse<EnhancementData>>
  createEnhancement(data: Partial<EnhancementData>): Promise<ApiResponse<EnhancementData>>
  updateEnhancement(
    id: number,
    data: Partial<EnhancementData>,
  ): Promise<ApiResponse<EnhancementData>>
  getAttachments(id: number): Promise<ApiResponse<{ id: number; file: string; name: string }[]>>
  uploadAttachments(id: number, files: File[]): Promise<ApiResponse<{ message: string }>>
  deleteAttachment(id: number): Promise<ApiResponse<void>>
  deleteTransfer(transferId: number): Promise<ApiResponse<void>>
}

export default enhancementsService
