/**
 * useLiveMatch Hook
 * 
 * Manages live match data fetching with automatic polling.
 * Polls every 60s when match is active, every 5min when scheduled,
 * and stops polling when match is finished.
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  fetchLiveMatch,
  isMatchActive,
  isMatchFinished,
} from '../lib/liveMatch'

const POLL_INTERVAL_ACTIVE = 60 * 1000    // 60s when in play
const POLL_INTERVAL_IDLE = 5 * 60 * 1000  // 5min when scheduled
const POLL_INTERVAL_FINISHED = 0           // no polling when finished

export function useLiveMatch({ autoRefresh = true } = {}) {
  const [matchData, setMatchData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)
  const intervalRef = useRef(null)
  const mountedRef = useRef(true)

  const fetchData = useCallback(async (forceRefresh = false) => {
    try {
      const result = await fetchLiveMatch(forceRefresh)

      if (!mountedRef.current) return

      if (result.error) {
        setError(result)
        // Don't clear existing match data on rate limit
        if (result.type !== 'RATE_LIMIT' || !matchData) {
          setMatchData(null)
        }
      } else {
        setError(null)
        setMatchData(result)
        setLastUpdated(new Date())
      }
    } catch (err) {
      if (mountedRef.current) {
        setError({
          error: true,
          type: 'UNKNOWN',
          message: 'Error inesperado.',
        })
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false)
      }
    }
  }, [matchData])

  // Setup polling interval based on match status
  const setupPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    if (!autoRefresh) return

    const status = matchData?.match?.status

    let interval = POLL_INTERVAL_IDLE

    if (status && isMatchActive(status)) {
      interval = POLL_INTERVAL_ACTIVE
    } else if (status && isMatchFinished(status)) {
      interval = POLL_INTERVAL_FINISHED
    }

    if (interval > 0) {
      intervalRef.current = setInterval(() => {
        fetchData(false)
      }, interval)
    }
  }, [matchData, autoRefresh, fetchData])

  // Initial fetch
  useEffect(() => {
    mountedRef.current = true
    fetchData()

    return () => {
      mountedRef.current = false
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Update polling when match data changes
  useEffect(() => {
    setupPolling()
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [setupPolling])

  const refresh = useCallback(() => {
    setLoading(true)
    fetchData(true)
  }, [fetchData])

  return {
    match: matchData?.match || null,
    found: matchData?.found || false,
    loading,
    error,
    lastUpdated,
    refresh,
    fromCache: matchData?.fromCache || false,
    // Convenience flags
    isActive: matchData?.match ? isMatchActive(matchData.match.status) : false,
    isFinished: matchData?.match ? isMatchFinished(matchData.match.status) : false,
    isScheduled: matchData?.match ? ['SCHEDULED', 'TIMED'].includes(matchData.match.status) : false,
  }
}
