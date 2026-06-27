import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { supabase, MATCH_SLUG, MATCH_DEADLINE } from '../lib/supabase'
import { useAuth } from './AuthContext'

const PredictionContext = createContext(null)

export function PredictionProvider({ children }) {
  const { user, isAuthenticated } = useAuth()
  const [prediction, setPrediction] = useState(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deadlinePassed, setDeadlinePassed] = useState(false)

  // Check deadline
  useEffect(() => {
    const checkDeadline = () => {
      setDeadlinePassed(new Date() >= MATCH_DEADLINE)
    }
    checkDeadline()
    const interval = setInterval(checkDeadline, 30000) // check every 30s
    return () => clearInterval(interval)
  }, [])

  // Fetch user's prediction
  const fetchPrediction = useCallback(async () => {
    if (!isAuthenticated || !user) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('predictions')
        .select('*')
        .eq('user_id', user.id)
        .eq('match_slug', MATCH_SLUG)
        .maybeSingle()

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching prediction:', error)
        return
      }

      setPrediction(data)
    } catch (err) {
      console.error('Error fetching prediction:', err)
    } finally {
      setLoading(false)
    }
  }, [user, isAuthenticated])

  // Auto-fetch when user changes
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchPrediction()
    } else {
      setPrediction(null)
    }
  }, [user, isAuthenticated, fetchPrediction])

  // Save or update prediction
  const savePrediction = useCallback(async (colombiaScore, portugalScore) => {
    if (!isAuthenticated || !user) {
      return { error: new Error('No autenticado') }
    }

    if (deadlinePassed) {
      return { error: new Error('El periodo de pronósticos ha cerrado') }
    }

    setSaving(true)
    try {
      const predictionData = {
        user_id: user.id,
        match_slug: MATCH_SLUG,
        colombia_score: colombiaScore,
        portugal_score: portugalScore,
      }

      let result

      if (prediction) {
        // Update existing
        result = await supabase
          .from('predictions')
          .update({
            colombia_score: colombiaScore,
            portugal_score: portugalScore,
          })
          .eq('id', prediction.id)
          .eq('user_id', user.id)
          .select()
          .single()
      } else {
        // Insert new
        result = await supabase
          .from('predictions')
          .insert(predictionData)
          .select()
          .single()
      }

      if (result.error) throw result.error

      setPrediction(result.data)
      return { data: result.data, error: null }
    } catch (err) {
      console.error('Error saving prediction:', err)
      return { data: null, error: err }
    } finally {
      setSaving(false)
    }
  }, [user, isAuthenticated, prediction, deadlinePassed])

  // Get all predictions (for admin)
  const getAllPredictions = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('predictions')
        .select(`
          *,
          profiles:profiles!inner(display_name)
        `)
        .eq('match_slug', MATCH_SLUG)
        .order('created_at', { ascending: false })

      if (error) throw error
      return { data, error: null }
    } catch (err) {
      console.error('Error fetching all predictions:', err)
      return { data: null, error: err }
    }
  }, [])

  // Get prediction count
  const getPredictionCount = useCallback(async () => {
    try {
      const { count, error } = await supabase
        .from('predictions')
        .select('*', { count: 'exact', head: true })
        .eq('match_slug', MATCH_SLUG)

      if (error) throw error
      return count || 0
    } catch (err) {
      console.error('Error counting predictions:', err)
      return 0
    }
  }, [])

  // Delete a prediction (used by admin to clean up)
  const deletePrediction = useCallback(async (id) => {
    try {
      const { error } = await supabase
        .from('predictions')
        .delete()
        .eq('id', id)
      if (error) throw error
      return { error: null }
    } catch (err) {
      console.error('Error deleting prediction:', err)
      return { error: err }
    }
  }, [])

  const value = {
    prediction,
    loading,
    saving,
    deadlinePassed,
    savePrediction,
    getAllPredictions,
    getPredictionCount,
    deletePrediction,
    fetchPrediction,
  }

  return (
    <PredictionContext.Provider value={value}>
      {children}
    </PredictionContext.Provider>
  )
}

export function usePrediction() {
  const context = useContext(PredictionContext)
  if (!context) {
    throw new Error('usePrediction must be used within a PredictionProvider')
  }
  return context
}
