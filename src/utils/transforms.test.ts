import { describe, it, expect } from 'vitest'
import {
  bucketDatesByDayCairo,
  toGroupedTotals,
  toHeatmapCells,
  toSankey,
  calculateTotalSums,
  formatCurrency,
  formatNumber,
  calculatePercentage,
} from '@/utils/transforms'

describe('transforms', () => {
  describe('bucketDatesByDayCairo', () => {
    it('should bucket dates by day in Cairo timezone', () => {
      const dates = [
        '2025-08-12T07:48:10.158688+00:00',
        '2025-08-12T10:23:43.737168+00:00',
        '2025-08-11T21:17:32.046530+00:00',
      ]

      const result = bucketDatesByDayCairo(dates)

      expect(result).toHaveLength(2)
      expect(result[0].label).toBe('2025-08-12')
      expect(result[0].count).toBe(2)
      expect(result[1].label).toBe('2025-08-12')
      expect(result[1].count).toBe(1)
    })

    it('should handle empty array', () => {
      const result = bucketDatesByDayCairo([])
      expect(result).toEqual([])
    })
  })

  describe('toGroupedTotals', () => {
    it('should transform cost center data to grouped totals', () => {
      const data = [
        { cost_center_code: 9900001, total_from_center: 100, total_to_center: 200 },
        { cost_center_code: 9900002, total_from_center: 300, total_to_center: 400 },
      ]

      const result = toGroupedTotals(data, 'cost_center_code')

      expect(result.labels).toEqual(['9900001', '9900002'])
      expect(result.toSeries).toEqual([200, 400])
      expect(result.fromSeries).toEqual([100, 300])
    })

    it('should transform account data to grouped totals', () => {
      const data = [
        { account_code: 415220, total_from_center: 50, total_to_center: 150 },
        { account_code: 415410, total_from_center: 250, total_to_center: 350 },
      ]

      const result = toGroupedTotals(data, 'account_code')

      expect(result.labels).toEqual(['415220', '415410'])
      expect(result.toSeries).toEqual([150, 350])
      expect(result.fromSeries).toEqual([50, 250])
    })
  })

  describe('toHeatmapCells', () => {
    it('should transform flow data to heatmap cells', () => {
      const flows = [
        {
          cost_center_code: 9900001,
          account_code: 415220,
          total_from_center: 100,
          total_to_center: 200,
        },
        {
          cost_center_code: 9900002,
          account_code: 415410,
          total_from_center: 300,
          total_to_center: 400,
        },
      ]

      const result = toHeatmapCells(flows)

      expect(result).toHaveLength(2)
      expect(result[0]).toEqual({
        x: '415220',
        y: '9900001',
        value: 100, // 200 - 100
        to: 200,
        from: 100,
      })
      expect(result[1]).toEqual({
        x: '415410',
        y: '9900002',
        value: 100, // 400 - 300
        to: 400,
        from: 300,
      })
    })
  })

  describe('toSankey', () => {
    it('should transform flow data to Sankey format', () => {
      const flows = [
        {
          cost_center_code: 9900001,
          account_code: 415220,
          total_from_center: 100,
          total_to_center: 200,
        },
      ]

      const result = toSankey(flows)

      expect(result.nodes).toHaveLength(2)
      expect(result.nodes[0].name).toBe('AC 415220')
      expect(result.nodes[1].name).toBe('CC 9900001')

      expect(result.links).toHaveLength(2)
      expect(result.links[0]).toEqual({ source: 0, target: 1, value: 200 }) // AC -> CC
      expect(result.links[1]).toEqual({ source: 1, target: 0, value: 100 }) // CC -> AC
    })

    it('should handle flows with zero values', () => {
      const flows = [
        {
          cost_center_code: 9900001,
          account_code: 415220,
          total_from_center: 0,
          total_to_center: 200,
        },
      ]

      const result = toSankey(flows)

      expect(result.links).toHaveLength(1)
      expect(result.links[0]).toEqual({ source: 0, target: 1, value: 200 })
    })
  })

  describe('calculateTotalSums', () => {
    it('should calculate total sums correctly', () => {
      const data = [
        { total_from_center: 100, total_to_center: 200 },
        { total_from_center: 300, total_to_center: 400 },
      ]

      const result = calculateTotalSums(data)

      expect(result.totalFrom).toBe(400)
      expect(result.totalTo).toBe(600)
      expect(result.net).toBe(200)
    })
  })

  describe('formatCurrency', () => {
    it('should format currency values', () => {
      expect(formatCurrency(1234.56)).toBe('$1,235')
      expect(formatCurrency(1234567.89)).toBe('$1,234,568')
      expect(formatCurrency(0)).toBe('$0')
    })

    it('should handle different currencies', () => {
      expect(formatCurrency(1234.56, 'EUR')).toBe('€1,235')
    })
  })

  describe('formatNumber', () => {
    it('should format large numbers with abbreviations', () => {
      expect(formatNumber(1234)).toBe('1.2K')
      expect(formatNumber(1234567)).toBe('1.2M')
      expect(formatNumber(1234567890)).toBe('1.2B')
      expect(formatNumber(123)).toBe('123')
    })
  })

  describe('calculatePercentage', () => {
    it('should calculate percentage correctly', () => {
      expect(calculatePercentage(25, 100)).toBe(25)
      expect(calculatePercentage(1, 3)).toBe(33)
      expect(calculatePercentage(0, 100)).toBe(0)
    })

    it('should handle division by zero', () => {
      expect(calculatePercentage(25, 0)).toBe(0)
    })
  })
})
