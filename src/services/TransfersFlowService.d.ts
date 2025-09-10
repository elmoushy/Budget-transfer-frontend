// Type definition for TransfersFlowService
export interface FlowData {
  id: number
  status: string
  transfer_id: number
  comment?: string
  created_at: string
  updated_at: string
  user_id: number
  user_name: string
  [key: string]: unknown
}

export interface ApiResponse<T> {
  data?: T
  status?: number
  message?: string
  // Allow direct access to response properties
  results?: FlowData[]
  count?: number
}

declare const TransfersFlowService: {
  getTransfersForApproval(
    page?: number,
    searchQuery?: string,
  ): Promise<{ results: FlowData[]; count: number }>
  approveTransfer(id: number, comment?: string): Promise<ApiResponse<FlowData>>
  rejectTransfer(id: number, comment: string): Promise<ApiResponse<FlowData>>
  getFlowHistory(id: number): Promise<ApiResponse<FlowData[]>>
  fetchPendingTransfers(
    page?: number,
    pageSize?: number,
    search?: string,
    code?: string,
  ): Promise<{ results: FlowData[]; count: number }>
  approveRejectTransfers(
    transactionIds: number[],
    decision: string,
    reasons?: string[],
  ): Promise<ApiResponse<unknown>>
}

export default TransfersFlowService
