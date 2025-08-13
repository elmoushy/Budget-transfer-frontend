import type {
  FlowRow,
  ChartDataPoint,
  HeatmapCell,
  SankeyData,
  GroupedTotals,
} from '@/types/dashboard'
import { toDateStringCairo } from './dateUtils'

/**
 * Bucket ISO dates by day in Africa/Cairo timezone
 */
export function bucketDatesByDayCairo(isoDates: string[]): ChartDataPoint[] {
  const counts = new Map<string, number>()

  for (const iso of isoDates) {
    const key = toDateStringCairo(iso)
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }

  return [...counts.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([label, count]) => ({ label, count }))
}

/**
 * Transform data to grouped totals for bar charts
 */
export function toGroupedTotals<T extends { total_from_center: number; total_to_center: number }>(
  rows: (T & { cost_center_code?: number; account_code?: number })[],
  key: 'cost_center_code' | 'account_code',
): GroupedTotals {
  const labels: string[] = []
  const toSeries: number[] = []
  const fromSeries: number[] = []

  for (const r of rows) {
    const label = String((r as Record<string, unknown>)[key])
    labels.push(label)
    toSeries.push(r.total_to_center)
    fromSeries.push(r.total_from_center)
  }

  return { labels, toSeries, fromSeries }
}

/**
 * Transform flow data to heatmap cells
 */
export function toHeatmapCells(rows: FlowRow[]): HeatmapCell[] {
  return rows.map((r) => ({
    x: String(r.account_code),
    y: String(r.cost_center_code),
    value: r.total_to_center - r.total_from_center,
    to: r.total_to_center,
    from: r.total_from_center,
  }))
}

/**
 * Transform flow data to Sankey diagram format
 */
export function toSankey(rows: FlowRow[]): SankeyData {
  const nodeIndex = new Map<string, number>()
  const nodes: { name: string }[] = []
  const links: { source: number; target: number; value: number }[] = []

  const getNodeIndex = (name: string): number => {
    if (!nodeIndex.has(name)) {
      nodeIndex.set(name, nodes.length)
      nodes.push({ name })
    }
    return nodeIndex.get(name)!
  }

  for (const r of rows) {
    const cc = `CC ${r.cost_center_code}`
    const ac = `AC ${r.account_code}`

    if (r.total_to_center > 0) {
      links.push({
        source: getNodeIndex(ac),
        target: getNodeIndex(cc),
        value: r.total_to_center,
      })
    }

    if (r.total_from_center > 0) {
      links.push({
        source: getNodeIndex(cc),
        target: getNodeIndex(ac),
        value: r.total_from_center,
      })
    }
  }

  return { nodes, links }
}

/**
 * Calculate sum of totals from cost center data
 */
export function calculateTotalSums(
  costCenterTotals: { total_from_center: number; total_to_center: number }[],
) {
  const totalFrom = costCenterTotals.reduce((sum, cc) => sum + cc.total_from_center, 0)
  const totalTo = costCenterTotals.reduce((sum, cc) => sum + cc.total_to_center, 0)
  const net = totalTo - totalFrom

  return { totalFrom, totalTo, net }
}

/**
 * Format currency value with proper locale
 */
export function formatCurrency(value: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value)
}

/**
 * Format large numbers with abbreviated units (K, M, B)
 */
export function formatNumber(value: number): string {
  if (Math.abs(value) >= 1e9) {
    return (value / 1e9).toFixed(1) + 'B'
  }
  if (Math.abs(value) >= 1e6) {
    return (value / 1e6).toFixed(1) + 'M'
  }
  if (Math.abs(value) >= 1e3) {
    return (value / 1e3).toFixed(1) + 'K'
  }
  return value.toString()
}

/**
 * Calculate percentage of part from total
 */
export function calculatePercentage(part: number, total: number): number {
  if (total === 0) return 0
  return Math.round((part / total) * 100)
}

/**
 * Sort data by specified key
 */
export function sortByKey<T>(data: T[], key: keyof T, direction: 'asc' | 'desc' = 'asc'): T[] {
  return [...data].sort((a, b) => {
    const aVal = a[key]
    const bVal = b[key]

    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return direction === 'asc' ? aVal - bVal : bVal - aVal
    }

    const aStr = String(aVal)
    const bStr = String(bVal)

    return direction === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr)
  })
}
