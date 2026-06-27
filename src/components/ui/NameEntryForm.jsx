import { useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import Button from './Button'
import Input from './Input'
import { useAuth } from '../../context/AuthContext'

/**
 * NameEntryForm
 *
 * The single place where users enter their name. Calm, focused, one job.
 * Returns the user to the previous screen on success.
 */
export default function NameEntryForm({ onSuccess, onBack, compact = false }) {
  const { signInWithName } = useAuth()
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e?.preventDefault?.()
    setError('')
    const trimmed = name.trim()
    if (!trimmed) return setError('Por favor ingresa tu nombre')
    if (trimmed.length < 2) return setError('El nombre debe tener al menos 2 caracteres')
    if (trimmed.length > 30) return setError('El nombre no puede tener más de 30 caracteres')

    setLoading(true)
    try {
      const { error: authError } = await signInWithName(trimmed)
      if (authError) {
        setError('No pudimos registrarte. Intenta de nuevo.')
        toast.error('No pudimos registrarte')
        return
      }
      toast.success(`¡Listo ${trimmed.split(' ')[0]}!`)
      onSuccess?.()
    } catch (err) {
      setError('Error inesperado. Intenta de nuevo.')
      toast.error('Error inesperado')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full"
    >
      {!compact && (
        <div className="mb-5 text-center">
          <h2 className="font-display text-xl sm:text-2xl font-bold text-white tracking-wide">
            ¿Cómo te llamas?
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Solo necesitamos tu nombre para registrar tu pronóstico
          </p>
        </div>
      )}

      <div className={compact ? '' : 'space-y-4'}>
        <Input
          label="Tu nombre"
          placeholder="Ej: Juan Pérez"
          value={name}
          onChange={(e) => {
            setName(e.target.value)
            if (error) setError('')
          }}
          error={error}
          disabled={loading}
          maxLength={30}
          autoFocus
          autoComplete="name"
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

        {onBack && !compact && (
          <button
            type="button"
            onClick={onBack}
            className="w-full text-center text-sm text-slate-400 hover:text-white transition-colors py-2"
            disabled={loading}
          >
            ← Volver
          </button>
        )}
      </div>
    </form>
  )
}
