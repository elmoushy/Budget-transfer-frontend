export type PerformanceMetrics = {
  total_processing_time: number
}

export type NormalDashboard = {
  total_transfers: number
  total_transfers_far: number
  total_transfers_afr: number
  total_transfers_fad: number
  approved_transfers: number
  rejected_transfers: number
  pending_transfers: number
  pending_transfers_by_level: Record<string, number>
  request_dates: string[]
  performance_metrics: PerformanceMetrics & {
    counting_time: number
    total_records_processed: number
    request_dates_retrieved: number
  }
}

export type FlowRow = {
  cost_center_code: number
  account_code: number
  total_from_center: number
  total_to_center: number
}

export type AllOrSmartDashboard = {
  filtered_combinations: FlowRow[]
  cost_center_totals: {
    cost_center_code: number
    total_from_center: number
    total_to_center: number
  }[]
  account_code_totals: {
    account_code: number
    total_from_center: number
    total_to_center: number
  }[]
  all_combinations: FlowRow[]
  applied_filters?: {
    cost_center_code: number | null
    account_code: number | null
  }
  performance_metrics: PerformanceMetrics & {
    aggregation_time: number
    cost_center_groups: number
    account_code_groups: number
    total_combinations: number
  }
}

export type DashboardType = 'normal' | 'all' | 'smart'
export type DashboardData = NormalDashboard | AllOrSmartDashboard

export interface ChartDataPoint {
  label: string
  count: number
}

export interface HeatmapCell {
  x: string
  y: string
  value: number
  to: number
  from: number
}

export interface SankeyData {
  nodes: { name: string }[]
  links: { source: number; target: number; value: number }[]
}

export interface GroupedTotals {
  labels: string[]
  toSeries: number[]
  fromSeries: number[]
}
