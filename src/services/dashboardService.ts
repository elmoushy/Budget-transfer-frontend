import { useAuthStore } from '@/stores/authStore'
import { API_BASE_URL, ENDPOINTS } from '@/config/api'
import axios from 'axios'
import { ref } from 'vue'

export interface CostCenterAccountCombo {
  cost_center_code_str: string
  account_code_str: string
  total_from_center: number
  total_to_center: number
}

export interface CostCenterTotal {
  cost_center_code_str: string
  total_from_center: number
  total_to_center: number
}

export interface AccountCodeTotal {
  account_code_str: string
  total_from_center: number
  total_to_center: number
}

export interface DashboardData {
  total_transfers: number
  total_transfers_far: number
  total_transfers_afr: number
  total_transfers_fad: number
  approved_transfers: number
  rejected_transfers: number
  pending_transfers: {
    Level1: number
    Level2: number
    Level3: number
    Level4: number
  }
  filtered_combinations: CostCenterAccountCombo[]
  cost_center_totals: CostCenterTotal[][]
  account_code_totals: AccountCodeTotal[][]
  all_combinations: CostCenterAccountCombo[][]
}

export const useDashboardService = () => {
  const dashboardData = ref<DashboardData | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const authStore = useAuthStore()

  const fetchDashboardData = async () => {
    isLoading.value = true
    error.value = null

    try {
      const headers = {
        Authorization: `Bearer ${authStore.token}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      }

      const response = await axios.get(`${API_BASE_URL}${ENDPOINTS.BUDGET.DASHBOARD}`, { headers })
      dashboardData.value = response.data
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch dashboard data'
      console.error('Dashboard data fetch error:', err)
    } finally {
      isLoading.value = false
    }
  }

  return {
    dashboardData,
    isLoading,
    error,
    fetchDashboardData,
  }
}
