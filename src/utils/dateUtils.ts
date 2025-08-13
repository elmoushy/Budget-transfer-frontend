/**
 * Date utility functions for Africa/Cairo timezone
 */

const CAIRO_TIMEZONE = 'Africa/Cairo'

/**
 * Format date to Cairo timezone
 */
export function formatDateCairo(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date

  const defaultOptions: Intl.DateTimeFormatOptions = {
    timeZone: CAIRO_TIMEZONE,
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    ...options,
  }

  return new Intl.DateTimeFormat('en-US', defaultOptions).format(dateObj)
}

/**
 * Get current time in Cairo timezone
 */
export function nowInCairo(): string {
  return formatDateCairo(new Date())
}

/**
 * Convert ISO date to Cairo date string (YYYY-MM-DD)
 */
export function toDateStringCairo(isoDate: string): string {
  const date = new Date(isoDate)

  const year = new Intl.DateTimeFormat('en-CA', {
    timeZone: CAIRO_TIMEZONE,
    year: 'numeric',
  }).format(date)

  const month = new Intl.DateTimeFormat('en-CA', {
    timeZone: CAIRO_TIMEZONE,
    month: '2-digit',
  }).format(date)

  const day = new Intl.DateTimeFormat('en-CA', {
    timeZone: CAIRO_TIMEZONE,
    day: '2-digit',
  }).format(date)

  return `${year}-${month}-${day}`
}

/**
 * Format relative time from ISO date in Cairo timezone
 */
export function formatRelativeTimeCairo(isoDate: string): string {
  const date = new Date(isoDate)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins} min ago`
  if (diffHours < 24) return `${diffHours} hours ago`
  if (diffDays < 7) return `${diffDays} days ago`

  return formatDateCairo(date, {
    month: 'short',
    day: 'numeric',
    hour: undefined,
    minute: undefined,
  })
}
