import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import Button from './Button'
import ScoreStepper from './ScoreStepper'
import { usePrediction } from '../../context/PredictionContext'

/**
 * PredictionForm
 *
 * The score entry experience. Always shows the same two flags + steppers
 * with a clear, single CTA. When the user already has a prediction, it
 * becomes "edit mode".
 */
export default function PredictionForm({ onSaved, compact = false }) {
  const { prediction, saving, deadlinePassed, savePrediction } = usePrediction()
  const [colombiaScore, setColombiaScore] = useState(0)
  const [portugalScore, setPortugalScore] = useState(0)
  const [error, setError] = useState('')
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    if (prediction) {
      setColombiaScore(prediction.colombia_score)
      setPortugalScore(prediction.portugal_score)
    }
  }, [prediction])

  const handleSave = async (e) => {
    e?.preventDefault?.()
    setError('')
    const result = await savePrediction(colombiaScore, portugalScore)
    if (result.error) {
      setError(result.error.message || 'Error al guardar. Intenta de nuevo.')
      toast.error(result.error.message || 'Error al guardar')
      return
    }
    toast.success(prediction ? '¡Pronóstico actualizado!' : '¡Pronóstico guardado!')
    setIsEditing(false)
    onSaved?.()
  }

  if (deadlinePassed && !compact) {
    return (
      <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5 text-center">
        <p className="text-amber-300 font-semibold text-sm">⏰ El plazo de pronósticos cerró</p>
        <p className="text-xs text-slate-400 mt-1">Espera al partido para ver el resultado en vivo</p>
      </div>
    )
  }

  const isUpdate = !!prediction
  const readOnly = isUpdate && !isEditing

  return (
    <form onSubmit={handleSave} className="w-full">
      {!compact && (
        <div className="text-center mb-5">
          <p className="text-[10px] sm:text-xs font-semibold tracking-[0.22em] uppercase text-slate-400 mb-1">
            {isUpdate ? 'Tu pronóstico' : 'Tu marcador'}
          </p>
          <h2 className="font-display text-lg sm:text-xl font-bold text-white">
            {isUpdate ? (readOnly ? 'Así pronosticaste' : 'Edita tu marcador') : '¿Cómo terminará?'}
          </h2>
        </div>
      )}

      {/* Score row */}
      <div className="flex items-center justify-between gap-2 sm:gap-4 mb-5">
        <TeamSide flag="🇨🇴" code="COL" color="text-yellow-300" />
        <div className="flex items-center gap-2 sm:gap-3">
          <ScoreStepper
            value={colombiaScore}
            onChange={setColombiaScore}
            teamColor="colombia-yellow"
            disabled={readOnly}
          />
          <span className="font-display text-2xl sm:text-3xl font-bold text-slate-600">–</span>
          <ScoreStepper
            value={portugalScore}
            onChange={setPortugalScore}
            teamColor="portugal-green"
            disabled={readOnly}
          />
        </div>
        <TeamSide flag="🇵🇹" code="POR" color="text-emerald-400" />
      </div>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-3 text-sm text-red-400 text-center"
        >
          {error}
        </motion.p>
      )}

      {/* Action */}
      {readOnly ? (
        <Button
          type="button"
          size="lg"
          fullWidth
          variant="secondary"
          onClick={() => setIsEditing(true)}
          icon="✏️"
        >
          Editar mi pronóstico
        </Button>
      ) : (
        <Button
          type="submit"
          size="lg"
          fullWidth
          loading={saving}
          icon={isUpdate ? '💾' : '🎯'}
        >
          {isUpdate ? 'Actualizar pronóstico' : 'Guardar mi pronóstico'}
        </Button>
      )}
    </form>
  )
}

function TeamSide({ flag, code, color }) {
  return (
    <div className="flex flex-col items-center gap-1 min-w-[56px]">
      <span className="text-3xl sm:text-4xl leading-none">{flag}</span>
      <span className={`font-display text-[10px] sm:text-xs font-bold tracking-widest ${color}`}>
        {code}
      </span>
    </div>
  )
}
