import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button, Input, MatchCard } from '../components/ui'
import { useAuth } from '../context/AuthContext'

export default function Login({ onSuccess }) {
  const { signInWithName } = useAuth()
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const trimmed = name.trim()
    if (!trimmed) {
      setError('Por favor ingresa tu nombre')
      return
    }
    if (trimmed.length < 2) {
      setError('El nombre debe tener al menos 2 caracteres')
      return
    }
    if (trimmed.length > 50) {
      setError('El nombre no puede tener más de 50 caracteres')
      return
    }

    setLoading(true)
    try {
      const { user, error: authError } = await signInWithName(trimmed)
      if (authError) {
        setError('Error al iniciar sesión. Intenta de nuevo.')
        return
      }
      onSuccess?.()
    } catch (err) {
      setError('Error inesperado. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center px-4 py-8 bg-pitch-pattern">
      {/* Decorative */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-40 -right-20 w-80 h-80 rounded-full bg-colombia-yellow/5 blur-3xl" />
        <div className="absolute bottom-40 -left-20 w-80 h-80 rounded-full bg-portugal-green/5 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md flex flex-col items-center gap-8">
        {/* Back button */}
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => window.location.reload()}
          className="self-start flex items-center gap-2 text-dark-400 hover:text-white transition-colors text-sm"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Volver
        </motion.button>

        {/* Match preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="w-full"
        >
          <MatchCard />
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="w-full glass rounded-3xl p-6 sm:p-8"
        >
          <div className="text-center mb-6">
            <h2 className="font-display text-2xl font-bold text-white tracking-wide">
              ¿Cuál es tu nombre?
            </h2>
            <p className="text-sm text-dark-400 mt-2">
              Ingresa tu nombre para hacer tu pronóstico
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Tu nombre"
              placeholder="Ej: Juan Pérez"
              icon="👤"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                setError('')
              }}
              error={error}
              maxLength={50}
              autoFocus
              autoComplete="name"
            />

            <Button
              type="submit"
              size="lg"
              fullWidth
              loading={loading}
              disabled={!name.trim()}
              icon="🎯"
            >
              Entrar y pronosticar
            </Button>
          </form>

          <p className="text-center text-xs text-dark-600 mt-4">
            No necesitas contraseña. Tu sesión se guarda automáticamente.
          </p>
        </motion.div>
      </div>
    </div>
  )
}
