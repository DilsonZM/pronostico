import { useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { Button, Input, MatchCard } from '../components/ui'
import { useAuth } from '../context/AuthContext'

export default function Login({ onSuccess, onBack }) {
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
        toast.error('Error al iniciar sesión')
        return
      }
      toast.success(`¡Bienvenido ${trimmed}!`)
      onSuccess?.()
    } catch (err) {
      setError('Error inesperado. Intenta de nuevo.')
      toast.error('Error inesperado')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center px-4 py-8 bg-pitch-pattern">
      {/* Decorative */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-40 -right-20 w-80 h-80 rounded-full bg-colombia-yellow/10 blur-3xl" />
        <div className="absolute bottom-40 -left-20 w-80 h-80 rounded-full bg-portugal-green/10 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md flex flex-col items-center gap-6">
        {/* Back button */}
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={onBack}
          type="button"
          className="self-start flex items-center gap-2 text-slate-300 hover:text-white transition-colors text-sm font-medium"
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
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{
            background: 'rgba(15, 23, 42, 0.85)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
          }}
          className="w-full rounded-3xl p-6 sm:p-8 space-y-5"
        >
          <div className="text-center">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-wide">
              ¿Cuál es tu nombre?
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              Ingresa tu nombre para hacer tu pronóstico
            </p>
          </div>

          <Input
            label="Tu nombre"
            placeholder="Ej: Juan Pérez"
            icon="👤"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              if (error) setError('')
            }}
            error={error}
            disabled={loading}
            maxLength={50}
            autoFocus
          />

          <Button
            type="submit"
            size="lg"
            fullWidth
            loading={loading}
            disabled={loading || !name.trim()}
            icon="🎯"
          >
            {loading ? 'Entrando...' : 'Entrar y pronosticar'}
          </Button>

          <p className="text-center text-xs text-slate-500">
            No necesitas contraseña. Tu sesión se guarda automáticamente.
          </p>
        </motion.form>
      </div>
    </div>
  )
}
