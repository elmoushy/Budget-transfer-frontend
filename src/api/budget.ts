import axios, { type AxiosResponse } from 'axios'
import type {
  DashboardData,
  DashboardType,
  NormalDashboard,
  AllOrSmartDashboard,
} from '@/types/dashboard'
import type { FetchOptions } from '@/types/api'
import { API_BASE_URL, ENDPOINTS } from '@/config/api'

/**
 * Mock data for development/testing
 */
const MOCK_DATA = {
  normal: {
    total_transfers: 11,
    total_transfers_far: 7,
    total_transfers_afr: 1,
    total_transfers_fad: 3,
    approved_transfers: 2,
    rejected_transfers: 1,
    pending_transfers: 8,
    pending_transfers_by_level: {
      Level1: 7,
      Level2: 1,
      Level3: 0,
      Level4: 1,
    },
    request_dates: [
      '2025-08-12T07:48:10.158688+00:00',
      '2025-08-12T07:23:43.737168+00:00',
      '2025-08-12T07:23:43.126126+00:00',
      '2025-08-12T07:23:03.311210+00:00',
      '2025-08-12T07:21:41.586923+00:00',
      '2025-08-12T07:11:46.108978+00:00',
      '2025-08-12T07:08:04.636999+00:00',
      '2025-08-12T07:04:51.491478+00:00',
      '2025-08-12T07:04:28.891307+00:00',
      '2025-08-12T07:04:26.445043+00:00',
      '2025-08-11T07:17:32.046530+00:00',
    ],
    performance_metrics: {
      total_processing_time: 0.49,
      counting_time: 0.49,
      total_records_processed: 11,
      request_dates_retrieved: 11,
    },
  } as NormalDashboard,

  all: {
    filtered_combinations: [
      {
        cost_center_code: 9900002,
        account_code: 415220,
        total_from_center: 0.0,
        total_to_center: 3000.0,
      },
      {
        cost_center_code: 9900002,
        account_code: 415410,
        total_from_center: 3000.0,
        total_to_center: 100.0,
      },
      {
        cost_center_code: 9900002,
        account_code: 435740,
        total_from_center: 100.0,
        total_to_center: 0.0,
      },
    ],
    cost_center_totals: [
      { cost_center_code: 9900002, total_from_center: 3100.0, total_to_center: 3100.0 },
    ],
    account_code_totals: [
      { account_code: 415220, total_from_center: 0.0, total_to_center: 3000.0 },
      { account_code: 415410, total_from_center: 3000.0, total_to_center: 100.0 },
      { account_code: 435740, total_from_center: 100.0, total_to_center: 0.0 },
    ],
    all_combinations: [
      {
        cost_center_code: 9900002,
        account_code: 415220,
        total_from_center: 0.0,
        total_to_center: 3000.0,
      },
      {
        cost_center_code: 9900002,
        account_code: 415410,
        total_from_center: 3000.0,
        total_to_center: 100.0,
      },
      {
        cost_center_code: 9900002,
        account_code: 435740,
        total_from_center: 100.0,
        total_to_center: 0.0,
      },
    ],
    performance_metrics: {
      total_processing_time: 0.67,
      aggregation_time: 0.67,
      cost_center_groups: 1,
      account_code_groups: 3,
      total_combinations: 3,
    },
  } as AllOrSmartDashboard,

  smart: {
    filtered_combinations: [
      {
        cost_center_code: 9900002,
        account_code: 415220,
        total_from_center: 0.0,
        total_to_center: 3000.0,
      },
      {
        cost_center_code: 9900002,
        account_code: 415410,
        total_from_center: 3000.0,
        total_to_center: 100.0,
      },
      {
        cost_center_code: 9900002,
        account_code: 435740,
        total_from_center: 100.0,
        total_to_center: 0.0,
      },
    ],
    cost_center_totals: [
      { cost_center_code: 9900002, total_from_center: 3100.0, total_to_center: 3100.0 },
    ],
    account_code_totals: [
      { account_code: 415220, total_from_center: 0.0, total_to_center: 3000.0 },
      { account_code: 415410, total_from_center: 3000.0, total_to_center: 100.0 },
      { account_code: 435740, total_from_center: 100.0, total_to_center: 0.0 },
    ],
    all_combinations: [
      {
        cost_center_code: 9900002,
        account_code: 415220,
        total_from_center: 0.0,
        total_to_center: 3000.0,
      },
      {
        cost_center_code: 9900002,
        account_code: 415410,
        total_from_center: 3000.0,
        total_to_center: 100.0,
      },
      {
        cost_center_code: 9900002,
        account_code: 435740,
        total_from_center: 100.0,
        total_to_center: 0.0,
      },
    ],
    applied_filters: {
      cost_center_code: null,
      account_code: null,
    },
    performance_metrics: {
      total_processing_time: 0.67,
      aggregation_time: 0.67,
      cost_center_groups: 1,
      account_code_groups: 3,
      total_combinations: 3,
    },
  } as AllOrSmartDashboard,
}

// Check if we're in mock mode
const IS_MOCK_MODE = import.meta.env.VITE_MOCK_MODE === 'true'

/**
 * Simulate network delay for realistic mock behavior
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Fetch dashboard data from API or mock
 */
export async function fetchDashboard<T extends DashboardData>(
  type: DashboardType,
  token: string,
  options: FetchOptions = {},
): Promise<T> {
  const { signal } = options

  // Mock mode
  if (IS_MOCK_MODE) {
    await delay(Math.random() * 1000 + 500) // 500-1500ms delay

    if (signal?.aborted) {
      throw new Error('Request aborted')
    }

    return MOCK_DATA[type] as T
  }

  // Real API call
  try {
    const params = new URLSearchParams({ type })

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      signal,
    }

    const url = `${API_BASE_URL}${ENDPOINTS.BUDGET.DASHBOARD}?${params.toString()}`

    if (type === 'all') {
      // For 'all' type, expect nested response with both normal and smart data
      const response: AxiosResponse<{ normal: NormalDashboard; smart: AllOrSmartDashboard }> =
        await axios.get(url, config)
      console.log('📊 Dashboard response (all):', response.data)
      return response.data.smart as T // Return the smart data for 'all' type
    } else if (type === 'normal') {
      // For 'normal' type, expect response.data.normal
      const response: AxiosResponse<{ normal: NormalDashboard }> = await axios.get(url, config)
      console.log('📊 Dashboard response (normal):', response.data.normal)
      return response.data.normal as T
    } else if (type === 'smart') {
      // For 'smart' type, expect response.data.smart
      const response: AxiosResponse<{ smart: AllOrSmartDashboard }> = await axios.get(url, config)
      console.log('📊 Dashboard response (smart):', response.data.smart)
      return response.data.smart as T
    } else {
      throw new Error('Unknown dashboard type')
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.code === 'ERR_CANCELED') {
        throw new Error('Request aborted')
      }

      const status = error.response?.status
      const message = error.response?.data?.message || error.message

      if (status === 401) {
        throw new Error('Authentication required. Please log in again.')
      }

      if (status && status >= 500) {
        throw new Error(`Server error (${status}): ${message}`)
      }

      throw new Error(`Request failed: ${message}`)
    }

    throw error
  }
}

/**
 * Export dashboard data as CSV
 */
export function exportToCsv(data: unknown[], filename: string): void {
  if (!data.length) return

  const headers = Object.keys(data[0] as Record<string, unknown>)
  const csvContent = [
    headers.join(','),
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = (row as Record<string, unknown>)[header]
          return typeof value === 'string' && value.includes(',') ? `"${value}"` : String(value)
        })
        .join(','),
    ),
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}.csv`)
  link.style.visibility = 'hidden'

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(url)
}
