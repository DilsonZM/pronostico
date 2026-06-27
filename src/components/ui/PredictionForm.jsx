import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import Button from './Button'
import ScoreStepper from './ScoreStepper'
import { usePrediction } from '../../context/PredictionContext'

export default function PredictionForm({ onSaved }) {
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

  if (deadlinePassed) {
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
      <div className="flex items-center justify-between gap-2 sm:gap-3 mb-4">
        <div className="flex flex-col items-center gap-1">
          <span className="text-xl" aria-hidden>🇨🇴</span>
          <ScoreStepper
            value={colombiaScore}
            onChange={setColombiaScore}
            teamColor="colombia-yellow"
            disabled={readOnly}
          />
        </div>
        <span className="font-mono text-2xl sm:text-3xl text-slate-600 font-light mt-6">–</span>
        <div className="flex flex-col items-center gap-1">
          <span className="text-xl" aria-hidden>🇵🇹</span>
          <ScoreStepper
            value={portugalScore}
            onChange={setPortugalScore}
            teamColor="portugal-green"
            disabled={readOnly}
          />
        </div>
      </div>

      {error && (
        <p className="mb-3 text-sm text-red-400 text-center">
          {error}
        </p>
      )}

      {readOnly ? (
        <p className="text-[10px] text-center text-slate-500 py-2">
          🔒 No se puede editar después del partido
        </p>
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
