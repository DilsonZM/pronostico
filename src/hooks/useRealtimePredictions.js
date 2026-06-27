/**
 * useRealtimePredictions
 *
 * Subscribes to the `predictions` table via Supabase Realtime (Postgres Changes)
 * and returns the full list of predictions enriched with profile data.
 *
 * - Re-fetches on INSERT, UPDATE, DELETE
 * - Cleanup on unmount (no leak)
 * - Joins profile data to show display_name
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { MATCH_SLUG } from '../lib/supabase'

const PROFILES_SELECT = 'id, display_name'

export function useRealtimePredictions() {
  const [predictions, setPredictions] = useState([])
  const [profiles, setProfiles] = useState({}) // user_id -> profile
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [newIds, setNewIds] = useState(new Set()) // ids that just arrived (for animation)
  const newIdTimeoutRef = useRef(null)

  // Fetch all profiles once (small set)
  const fetchProfiles = useCallback(async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select(PROFILES_SELECT)
    if (error) {
      console.error('useRealtimePredictions: profiles error', error)
      return {}
    }
    const map = {}
    for (const p of data || []) map[p.id] = p
    return map
  }, [])

  // Fetch all predictions for this match
  const fetchPredictions = useCallback(async () => {
    const { data, error } = await supabase
      .from('predictions')
      .select('*')
      .eq('match_slug', MATCH_SLUG)
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('useRealtimePredictions: predictions error', error)
      setError(error)
      return []
    }
    return data || []
  }, [])

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const [preds, profs] = await Promise.all([fetchPredictions(), fetchProfiles()])
      setPredictions(preds)
      setProfiles(profs)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [fetchPredictions, fetchProfiles])

  // Mark a prediction as "new" briefly so the UI can animate it.
  const markNew = useCallback((id) => {
    setNewIds((prev) => {
      const next = new Set(prev)
      next.add(id)
      return next
    })
    if (newIdTimeoutRef.current) clearTimeout(newIdTimeoutRef.current)
    newIdTimeoutRef.current = setTimeout(() => {
      setNewIds(new Set())
    }, 1500)
  }, [])

  useEffect(() => {
    refresh()

    const channel = supabase
      .channel('predictions-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'predictions' },
        async (payload) => {
          const newRow = payload.new
          if (newRow.match_slug !== MATCH_SLUG) return
          setPredictions((prev) => {
            // de-dupe
            const without = prev.filter((p) => p.id !== newRow.id)
            return [newRow, ...without]
          })
          // Try to fetch the profile if we don't have it
          if (newRow.user_id && !profiles[newRow.user_id]) {
            const { data: p } = await supabase
              .from('profiles')
              .select(PROFILES_SELECT)
              .eq('id', newRow.user_id)
              .maybeSingle()
            if (p) setProfiles((prev) => ({ ...prev, [p.id]: p }))
          }
          markNew(newRow.id)
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'predictions' },
        (payload) => {
          const newRow = payload.new
          if (newRow.match_slug !== MATCH_SLUG) return
          setPredictions((prev) => prev.map((p) => (p.id === newRow.id ? newRow : p)))
          markNew(newRow.id)
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'predictions' },
        (payload) => {
          const oldRow = payload.old
          setPredictions((prev) => prev.filter((p) => p.id !== oldRow.id))
        }
      )
      .subscribe()

    return () => {
      if (newIdTimeoutRef.current) clearTimeout(newIdTimeoutRef.current)
      supabase.removeChannel(channel)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Enrich each prediction with its profile
  const enriched = predictions.map((p) => ({
    ...p,
    profile: profiles[p.user_id] || null,
  }))

  return {
    predictions: enriched,
    rawPredictions: predictions,
    loading,
    error,
    refresh,
    newIds,
  }
}
