import { useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import Button from './Button'
import Input from './Input'
import { useAuth } from '../../context/AuthContext'

/**
 * NameEntryForm — pro style
 * Hero "¿Cómo te llamas?" + supporting line + clean input + CTA.
 */
export default function NameEntryForm({ onSuccess, onBack }) {
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
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="w-full"
    >
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
          ¿Cómo te llamas?
        </h2>
        <p className="text-sm text-slate-400 mt-2">
          Solo necesitamos tu nombre para registrar tu pronóstico
        </p>
      </div>

      {/* Form body */}
      <div className="flex flex-col gap-5">
        <Input
          placeholder="Escribe tu nombre…"
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

        {onBack && (
          <button
            type="button"
            onClick={onBack}
            disabled={loading}
            className="group w-full inline-flex items-center justify-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors py-2 disabled:opacity-40"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:-translate-x-0.5">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Volver
          </button>
        )}
      </div>
    </motion.form>
  )
}
