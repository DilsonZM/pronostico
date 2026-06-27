import { createContext, useContext, useMemo } from 'react'
import { useRealtimePredictions } from '../hooks/useRealtimePredictions'
import { useLiveMatch } from '../hooks/useLiveMatch'

/**
 * LiveDataContext
 *
 * Provides realtime predictions + live match data to the entire app
 * using a single subscription per source. Both Prediction and the
 * ChatBot (and any other component) read from here.
 */

const LiveDataContext = createContext(null)

export function LiveDataProvider({ children }) {
  const predictionsHook = useRealtimePredictions()
  const liveMatchHook = useLiveMatch()

  const value = useMemo(
    () => ({
      predictions: predictionsHook.predictions,
      rawPredictions: predictionsHook.rawPredictions,
      loading: predictionsHook.loading,
      error: predictionsHook.error,
      newIds: predictionsHook.newIds,

      liveMatch: liveMatchHook.match,
      liveLoading: liveMatchHook.loading,
      liveError: liveMatchHook.error,
      liveLastUpdated: liveMatchHook.lastUpdated,
      refreshLive: liveMatchHook.refresh,
      isActive: liveMatchHook.isActive,
      isFinished: liveMatchHook.isFinished,
      fromCache: liveMatchHook.fromCache,
    }),
    [predictionsHook, liveMatchHook]
  )

  return <LiveDataContext.Provider value={value}>{children}</LiveDataContext.Provider>
}

export function useLiveData() {
  const ctx = useContext(LiveDataContext)
  if (!ctx) {
    throw new Error('useLiveData must be used within LiveDataProvider')
  }
  return ctx
}
