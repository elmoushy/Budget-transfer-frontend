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

export interface Currency {
  id: number
  name: string
  icon: string
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
  const currencyData = ref<Currency | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const authStore = useAuthStore()

  const fetchCurrencyData = async () => {
    try {
      const headers = {
        Authorization: `Bearer ${authStore.token}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      }

      const response = await axios.get(
        `${API_BASE_URL}${ENDPOINTS.ACCOUNTS_ENTITIES.MAIN_CURRENCIES}`,
        { headers },
      )

      // API returns array with single item, get the first one
      if (response.data?.data && response.data.data.length > 0) {
        currencyData.value = response.data.data[0]
      }
    } catch (err: unknown) {
      console.error('Currency data fetch error:', err)
      // Fallback to USD if currency fetch fails
      currencyData.value = { id: 1, name: 'US Dollar', icon: '$' }
    }
  }

  const fetchDashboardData = async () => {
    isLoading.value = true
    error.value = null

    try {
      const headers = {
        Authorization: `Bearer ${authStore.token}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      }

      // Fetch both dashboard and currency data
      await Promise.all([
        axios.get(`${API_BASE_URL}${ENDPOINTS.BUDGET.DASHBOARD}`, { headers }).then((response) => {
          dashboardData.value = response.data
        }),
        fetchCurrencyData(),
      ])
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch dashboard data'
      error.value = errorMessage
      console.error('Dashboard data fetch error:', err)
    } finally {
      isLoading.value = false
    }
  }

  return {
    dashboardData,
    currencyData,
    isLoading,
    error,
    fetchDashboardData,
  }
}
