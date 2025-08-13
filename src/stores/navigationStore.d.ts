// Type definitions for navigationStore

export interface NavigationState {
  source: string | null
  params: Record<string, any>
}

export interface NavigationStore {
  navigationSource: string | null
  navigationParams: Record<string, any>
  setNavigationSource(source: string, params?: Record<string, any>): void
  clearNavigationSource(): void
}

export function useNavigationStore(): NavigationStore
