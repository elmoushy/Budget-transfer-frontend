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
const MOCK_NORMAL_DATA = {
  total_transfers: 6,
  total_transfers_far: 2,
  total_transfers_afr: 0,
  total_transfers_fad: 4,
  approved_transfers: 0,
  rejected_transfers: 0,
  pending_transfers: 6,
  pending_transfers_by_level: {
    Level1: 6,
    Level2: 0,
    Level3: 0,
    Level4: 0,
  },
  request_dates: [
    '2025-09-03T18:10:29+00:00',
    '2025-09-03T15:12:20.726047+00:00',
    '2025-09-03T15:11:33.265978+00:00',
  ],
  performance_metrics: {
    total_processing_time: 0.1,
    counting_time: 0.1,
    total_records_processed: 6,
    request_dates_retrieved: 3,
  },
} as NormalDashboard

const MOCK_FLOW_DATA = {
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
} as AllOrSmartDashboard

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

    // For normal mode in mock, return the normal data directly
    if (type === 'normal') {
      return MOCK_NORMAL_DATA as T
    } else if (type === 'all') {
      return MOCK_FLOW_DATA as T
    } else {
      return MOCK_FLOW_DATA as T
    }
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
    console.log('📊 Fetching dashboard data:', { type, url })

    if (type === 'normal') {
      // For 'normal' type, expect nested response with data under 'normal' key
      const response: AxiosResponse<{ normal: NormalDashboard }> = await axios.get(url, config)
      console.log('📊 Dashboard response (normal):', response.data)
      return response.data.normal as T
    } else if (type === 'all') {
      // For 'all' type, expect nested response with both normal and smart data
      const response: AxiosResponse<{ normal: NormalDashboard; smart: AllOrSmartDashboard }> =
        await axios.get(url, config)
      console.log('📊 Dashboard response (all):', response.data)
      return response.data.smart as T // Return the smart data for 'all' type
    } else {
      // For 'smart' type, expect nested response with data under 'smart' key
      const response: AxiosResponse<{ smart: AllOrSmartDashboard }> = await axios.get(url, config)
      console.log('📊 Dashboard response (' + type + '):', response.data)
      return response.data.smart as T
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
