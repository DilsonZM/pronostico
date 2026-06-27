/**
 * Live Match Service
 * 
 * Fetches live match data from our own /api/live-match endpoint.
 * Never exposes the football-data.org API key to the client.
 * 
 * Features:
 * - In-memory cache to reduce duplicate requests
 * - Error classification for user-friendly messages
 * - Normalized response format
 */

// In-memory cache
let cache = {
  data: null,
  timestamp: 0,
}

const CACHE_DURATION = 55 * 1000 // 55 seconds (slightly less than server cache)

/**
 * Fetches live match data from the serverless API
 * @param {boolean} forceRefresh - Bypass cache
 * @returns {Promise<Object>} Match data or error
 */
export async function fetchLiveMatch(forceRefresh = false) {
  const now = Date.now()

  // Return cached data if fresh enough
  if (!forceRefresh && cache.data && (now - cache.timestamp) < CACHE_DURATION) {
    return { ...cache.data, fromCache: true }
  }

  try {
    // Dev-only: support ?demo=finished in URL to preview the winners banner
    let url = '/api/live-match'
    if (typeof window !== 'undefined' && window.location?.search?.includes('demo=finished')) {
      url = '/api/live-match?demo=finished'
    }
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    })

    if (response.status === 429) {
      const data = await response.json().catch(() => ({}))
      return {
        error: true,
        type: 'RATE_LIMIT',
        message: data.message || 'Demasiadas solicitudes. Intenta de nuevo en un minuto.',
        retryAfter: data.retryAfter || 60,
      }
    }

    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      return {
        error: true,
        type: 'API_ERROR',
        message: data.message || 'Error al consultar datos del partido.',
      }
    }

    const data = await response.json()

    // Update cache
    cache = { data, timestamp: now }

    return { ...data, fromCache: false }
  } catch (err) {
    // Network error
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      return {
        error: true,
        type: 'NETWORK_ERROR',
        message: 'Sin conexión. Verifica tu internet.',
      }
    }

    return {
      error: true,
      type: 'UNKNOWN',
      message: 'Error inesperado al consultar el partido.',
    }
  }
}

/**
 * Clears the local cache
 */
export function clearLiveMatchCache() {
  cache = { data: null, timestamp: 0 }
}

/**
 * Match status labels in Spanish
 */
export const STATUS_LABELS = {
  SCHEDULED: 'Programado',
  TIMED: 'Programado',
  IN_PLAY: '🔴 En vivo',
  PAUSED: '⏸️ Entretiempo',
  FINISHED: '✅ Finalizado',
  SUSPENDED: '⚠️ Suspendido',
  POSTPONED: '📅 Pospuesto',
  CANCELLED: '❌ Cancelado',
  AWARDED: '🏆 Adjudicado',
}

/**
 * Status colors for visual styling
 */
export const STATUS_COLORS = {
  SCHEDULED: 'text-slate-400',
  TIMED: 'text-slate-400',
  IN_PLAY: 'text-red-400',
  PAUSED: 'text-amber-400',
  FINISHED: 'text-emerald-400',
  SUSPENDED: 'text-red-500',
  POSTPONED: 'text-amber-500',
  CANCELLED: 'text-red-500',
  AWARDED: 'text-emerald-500',
}

/**
 * Whether a match status indicates it's currently active (should poll)
 */
export function isMatchActive(status) {
  return ['IN_PLAY', 'PAUSED'].includes(status)
}

/**
 * Whether a match status indicates it has ended
 */
export function isMatchFinished(status) {
  return ['FINISHED', 'SUSPENDED', 'CANCELLED', 'AWARDED', 'POSTPONED'].includes(status)
}
