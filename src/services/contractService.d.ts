// Type declaration file for contractService
import { ApiResponse } from '@/services/transferService'

export interface ContractData {
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
  type?: string
}

export interface Attachment {
  id: number
  file: string
  name: string
}

declare const contractService: {
  fetchContracts(
    searchQuery?: string,
    page?: number,
  ): Promise<ApiResponse<{ results: ContractData[]; count: number }>>
  getContractById(id: number): Promise<ApiResponse<ContractData>>
  createContract(data: Partial<ContractData>): Promise<ApiResponse<ContractData>>
  updateContract(id: number, data: Partial<ContractData>): Promise<ApiResponse<ContractData>>
  deleteContract(id: number): Promise<ApiResponse<void>>
  getAttachments(id: number): Promise<ApiResponse<Attachment[]>>
  uploadAttachments(id: number, files: File[]): Promise<ApiResponse<{ message: string }>>
  deleteAttachment(id: number): Promise<ApiResponse<void>>
  submitContractRequest(id: number): Promise<ApiResponse<{ message: string }>>
  reopenContractRequest(id: number): Promise<ApiResponse<{ message: string }>>
}

export default contractService
