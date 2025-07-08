/**
 * Navigation Refresh Utility
 * Use this to trigger navigation menu updates from anywhere in the application
 */

/**
 * Trigger a navigation menu refresh
 * Call this function after updating route names in the admin panel
 */
export const refreshNavigation = () => {
  // Dispatch a custom event that the NavigationMenu component listens for
  const event = new CustomEvent('refreshNavigation', {
    detail: {
      timestamp: Date.now(),
      reason: 'Manual refresh triggered',
    },
  })

  window.dispatchEvent(event)
  console.log('Navigation refresh event dispatched')
}

/**
 * Alternative method using a promise-based approach
 * Returns a promise that resolves when the refresh is complete
 */
export const refreshNavigationAsync = (): Promise<void> => {
  return new Promise((resolve) => {
    refreshNavigation()

    // Wait a short time for the navigation to update
    setTimeout(() => {
      resolve()
    }, 500)
  })
}

/**
 * Check if navigation auto-refresh is available
 */
export const isAutoRefreshSupported = (): boolean => {
  return typeof window !== 'undefined' && 'addEventListener' in window
}

export default {
  refreshNavigation,
  refreshNavigationAsync,
  isAutoRefreshSupported,
}
