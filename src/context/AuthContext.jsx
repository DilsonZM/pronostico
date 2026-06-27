import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState(null)

  // Fetch profile from DB
  const fetchProfile = useCallback(async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error)
        return null
      }
      return data
    } catch (err) {
      console.error('Error fetching profile:', err)
      return null
    }
  }, [])

  // Initialize auth state
  useEffect(() => {
    let mounted = true

    const initAuth = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession()

        if (!mounted) return

        setSession(currentSession)
        setUser(currentSession?.user ?? null)

        if (currentSession?.user) {
          const profileData = await fetchProfile(currentSession.user.id)
          if (mounted) setProfile(profileData)
        }
      } catch (err) {
        console.error('Auth init error:', err)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    initAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!mounted) return

        setSession(newSession)
        setUser(newSession?.user ?? null)

        if (newSession?.user) {
          const profileData = await fetchProfile(newSession.user.id)
          if (mounted) setProfile(profileData)
        } else {
          if (mounted) setProfile(null)
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [fetchProfile])

  // Sign in anonymously with display name
  const signInWithName = useCallback(async (displayName) => {
    try {
      // First try anonymous sign in
      const { data, error } = await supabase.auth.signInAnonymously({
        options: {
          data: {
            display_name: displayName,
          },
        },
      })

      if (error) throw error

      // Wait a moment for the trigger to create the profile
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Update profile display name
      if (data.user) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ display_name: displayName })
          .eq('id', data.user.id)

        if (updateError) {
          // If update fails, try insert
          const { error: insertError } = await supabase
            .from('profiles')
            .upsert({
              id: data.user.id,
              display_name: displayName,
            }, { onConflict: 'id' })

          if (insertError) console.error('Profile upsert error:', insertError)
        }

        const profileData = await fetchProfile(data.user.id)
        setProfile(profileData)
      }

      return { user: data.user, error: null }
    } catch (err) {
      console.error('Sign in error:', err)
      return { user: null, error: err }
    }
  }, [fetchProfile])

  // Sign out
  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      setProfile(null)
      setSession(null)
      localStorage.removeItem('pronostico-auth-token')
    } catch (err) {
      console.error('Sign out error:', err)
    }
  }, [])

  const value = {
    user,
    profile,
    session,
    loading,
    signInWithName,
    signOut,
    isAuthenticated: !!user,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
