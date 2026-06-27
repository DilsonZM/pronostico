/**
 * date-utils.js
 *
 * Centralized date/time utilities for the Pronóstico app.
 * ALL user-facing dates must be formatted in America/Bogota (Colombia time).
 *
 * Backend (Supabase, football-data.org) sends UTC ISO strings. We always
 * convert to Colombia time before rendering to avoid "day 28 vs day 27" bugs.
 */

const TIMEZONE = 'America/Bogota'
const LOCALE = 'es-CO'

/**
 * Parse an ISO date string (UTC) and return a Date object.
 * Always treats the input as UTC.
 */
export function parseUTC(isoString) {
  if (!isoString) return null
  // The Date constructor with ISO string ending in 'Z' is parsed as UTC.
  // We append 'Z' defensively in case the input lacks a timezone marker.
  const normalized = isoString.endsWith('Z') || isoString.includes('+') || isoString.includes('-', 10)
    ? isoString
    : `${isoString}Z`
  const d = new Date(normalized)
  return isNaN(d.getTime()) ? null : d
}

/**
 * Format a date in Colombia time with a custom Intl pattern.
 * Returns "—" for null/invalid inputs.
 */
export function formatInBogota(isoString, options = {}) {
  const d = parseUTC(isoString)
  if (!d) return '—'
  const fmt = new Intl.DateTimeFormat(LOCALE, {
    timeZone: TIMEZONE,
    ...options,
  })
  return fmt.format(d)
}

/**
 * Match meta: "sábado, 27 de junio" · "6:30 p. m. COT"
 * Used for the main "Colombia vs Portugal" subtitle.
 */
export function formatMatchDate(isoString) {
  const date = formatInBogota(isoString, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
  // Capitalize first letter and trim trailing dot (es-CO puts a period after month)
  return date.charAt(0).toUpperCase() + date.slice(1).replace(/\.$/, '')
}

export function formatMatchTime(isoString) {
  return formatInBogota(isoString, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

/**
 * Short date+time: "27 jun, 2:30 p. m." — used for prediction list items.
 */
export function formatShortDateTime(isoString) {
  if (!isoString) return '—'
  const d = parseUTC(isoString)
  if (!d) return '—'
  const date = new Intl.DateTimeFormat(LOCALE, {
    timeZone: TIMEZONE,
    day: 'numeric',
    month: 'short',
  }).format(d)
  const time = new Intl.DateTimeFormat(LOCALE, {
    timeZone: TIMEZONE,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(d)
  return `${date}, ${time}`
}

/**
 * Relative time: "hace 3 min", "hace 1 h", "hace 2 días".
 * Returns null if the date is in the future.
 */
export function formatRelative(isoString) {
  const d = parseUTC(isoString)
  if (!d) return '—'
  const diffMs = Date.now() - d.getTime()
  if (diffMs < 0) return null
  const diffSec = Math.floor(diffMs / 1000)
  if (diffSec < 30) return 'ahora mismo'
  if (diffSec < 60) return `hace ${diffSec}s`
  const diffMin = Math.floor(diffSec / 60)
  if (diffMin < 60) return `hace ${diffMin} min`
  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24) return `hace ${diffHr} h`
  const diffDay = Math.floor(diffHr / 24)
  if (diffDay === 1) return 'hace 1 día'
  return `hace ${diffDay} días`
}

/**
 * Calculate the time left until a deadline (in Colombia time).
 * Returns { days, hours, minutes, seconds, total }.
 * total <= 0 means deadline passed.
 */
export function getTimeLeft(deadlineISO) {
  const d = parseUTC(deadlineISO)
  if (!d) return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 }
  const diff = d.getTime() - Date.now()
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 }
  return {
    total: diff,
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  }
}

/**
 * Check if the deadline is in the past.
 */
export function isPast(deadlineISO) {
  const d = parseUTC(deadlineISO)
  if (!d) return true
  return d.getTime() <= Date.now()
}
