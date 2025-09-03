import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  DashboardData,
  DashboardType,
  NormalDashboard,
  AllOrSmartDashboard,
} from '@/types/dashboard'
import { fetchDashboard } from '@/api/budget'
import { nowInCairo } from '@/utils/dateUtils'

export const useBudgetDashboardStore = defineStore('budgetDashboard', () => {
  // State
  const cache = ref(new Map<string, DashboardData>())
  const lastFetched = ref(new Map<string, string>())
  const loading = ref(false)
  const error = ref<string | null>(null)
  const currentType = ref<DashboardType>('all')

  // Abort controller for canceling requests
  let abortController: AbortController | null = null

  // Computed
  const currentData = computed(() => {
    return cache.value.get(currentType.value) || null
  })



  const currentLastFetched = computed(() => {
    return lastFetched.value.get(currentType.value) || null
  })

  const isNormalMode = computed(() => currentType.value === 'normal')
  const isAllMode = computed(() => currentType.value === 'all')
  const isSmartMode = computed(() => currentType.value === 'smart')

  const normalData = computed((): NormalDashboard | null => {
    return isNormalMode.value ? (currentData.value as NormalDashboard) : null
  })


  const flowData = computed((): AllOrSmartDashboard | null => {
    const result =
      isAllMode.value || isSmartMode.value ? (currentData.value as AllOrSmartDashboard) : null
    console.log('🌊 flowData computed:', {
      isAllMode: isAllMode.value,
      isSmartMode: isSmartMode.value,
      currentType: currentType.value,
      currentData: currentData.value,
      result: result,
    })
    return result
  })

  // Actions
  const setCurrentType = (type: DashboardType) => {
    currentType.value = type
  }

  const load = async (type: DashboardType, token: string) => {
    // Cancel any ongoing request
    if (abortController) {
      abortController.abort()
    }

    loading.value = true
    error.value = null
    abortController = new AbortController()

    try {
      const data = await fetchDashboard(type, token, {
        signal: abortController.signal,
      })

      console.log('🏪 Store received data:', { type, data })

      // Update cache and last fetched time
      cache.value.set(type, data)
      lastFetched.value.set(type, nowInCairo())

      // Set current type
      setCurrentType(type)

      console.log('🏪 Store updated:', {
        currentType: currentType.value,
        hasData: data !== null,
        cacheSize: cache.value.size,
        isEmpty:
          !data ||
          (type === 'normal'
            ? (data as NormalDashboard).total_transfers === 0
            : (data as AllOrSmartDashboard).filtered_combinations?.length === 0),
      })

      error.value = null
    } catch (err) {
      if (err instanceof Error && err.message === 'Request aborted') {
        // Ignore aborted requests
        return
      }

      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch dashboard data'
      error.value = errorMessage
      console.error('Dashboard data fetch error:', err)
    } finally {
      loading.value = false
      abortController = null
    }
  }

  const refresh = async (token: string) => {
    await load(currentType.value, token)
  }

  const clearCache = () => {
    cache.value.clear()
    lastFetched.value.clear()
    error.value = null
  }

  const clearError = () => {
    error.value = null
  }

  // Helper methods for data access
  const hasData = computed(() => {
    return currentData.value !== null
  })

  const isEmpty = computed(() => {
    console.log('🔍 isEmpty check:', {
      currentData: currentData.value,
      isNormalMode: isNormalMode.value,
      currentType: currentType.value,
    })

    if (!currentData.value) {
      console.log('🔍 isEmpty: true (no current data)')
      return true
    }

    if (isNormalMode.value) {
      const data = currentData.value as NormalDashboard
      const result = data.total_transfers === 0
      console.log('🔍 isEmpty (normal mode):', result, 'total_transfers:', data.total_transfers)
      return result
    } else {
      const data = currentData.value as AllOrSmartDashboard
      const result = data.filtered_combinations.length === 0
      console.log(
        '🔍 isEmpty (flow mode):',
        result,
        'filtered_combinations length:',
        data.filtered_combinations?.length,
      )
      return result
    }
  })

  return {
    // State
    cache: cache.value,
    lastFetched: lastFetched.value,
    loading,
    error,
    currentType,

    // Computed
    currentData,
    currentLastFetched,
    isNormalMode,
    isAllMode,
    isSmartMode,
    normalData,
    flowData,
    hasData,
    isEmpty,

    // Actions
    setCurrentType,
    load,
    refresh,
    clearCache,
    clearError,
  }
})
