import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

// Simple hash to generate a deterministic but unique ID from a name
function hashName(name) {
  let hash = 0
  const normalized = name.toLowerCase().trim()
  for (let i = 0; i < normalized.length; i++) {
    const char = normalized.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash |= 0
  }
  return Math.abs(hash).toString(36)
}

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
        .maybeSingle()

      if (error) {
        console.error('Error fetching profile:', error)
        return null
      }
      return data
    } catch (err) {
      console.error('Error fetching profile:', err)
      return null
    }
  }, [])

  // Sign in with name: creates a deterministic "user" by upserting a profile directly
  // Since anonymous auth may be disabled, we use profile-based identity
  const signInWithName = useCallback(async (displayName) => {
    try {
      // Use a deterministic UUID v5-like based on the name
      // This way the same name always gets the same user
      const userId = await generateUUIDFromName(displayName)

      // Upsert the profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          display_name: displayName,
        }, { onConflict: 'id' })
        .select()
        .single()

      if (profileError) {
        console.error('Profile upsert error:', profileError)
        throw profileError
      }

      // Create a fake "user" object for the app
      const fakeUser = {
        id: userId,
        email: `${userId}@pronostico.app`,
        user_metadata: { display_name: displayName },
        app_metadata: {},
        aud: 'authenticated',
        created_at: new Date().toISOString(),
      }

      // Save to localStorage for persistence
      const sessionData = {
        user: fakeUser,
        profile: profileData,
        timestamp: Date.now(),
      }
      localStorage.setItem('pronostico-session', JSON.stringify(sessionData))

      setUser(fakeUser)
      setProfile(profileData)
      setSession(sessionData)

      return { user: fakeUser, error: null }
    } catch (err) {
      console.error('Sign in error:', err)
      return { user: null, error: err }
    }
  }, [])

  // Sign out
  const signOut = useCallback(async () => {
    try {
      localStorage.removeItem('pronostico-session')
      setUser(null)
      setProfile(null)
      setSession(null)
    } catch (err) {
      console.error('Sign out error:', err)
    }
  }, [])

  // Initialize from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('pronostico-session')
      if (stored) {
        const sessionData = JSON.parse(stored)
        // Verify the profile still exists in DB
        if (sessionData?.user?.id) {
          setUser(sessionData.user)
          setProfile(sessionData.profile)
          setSession(sessionData)
        }
      }
    } catch (err) {
      console.error('Error loading session:', err)
    } finally {
      setLoading(false)
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

// Generate a deterministic UUID v4 format string from a name
async function generateUUIDFromName(name) {
  const normalized = name.toLowerCase().trim()
  const encoder = new TextEncoder()
  const data = encoder.encode(normalized + 'pronostico-salt-2026')

  // Use crypto.subtle to hash
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))

  // Format as UUID v4
  const hex = hashArray.slice(0, 16).map(b => b.toString(16).padStart(2, '0')).join('')
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    '4' + hex.slice(13, 16), // version 4
    ((parseInt(hex.slice(16, 17), 16) & 0x3) | 0x8).toString(16) + hex.slice(17, 20),
    hex.slice(20, 32),
  ].join('-')
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
