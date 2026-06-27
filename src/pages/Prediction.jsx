import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button, ScoreStepper, MatchCard, CountdownTimer, LiveMatchCard } from '../components/ui'
import { useAuth } from '../context/AuthContext'
import { usePrediction } from '../context/PredictionContext'
import { useLiveMatch } from '../hooks/useLiveMatch'
import { MATCH_DEADLINE } from '../lib/supabase'

export default function Prediction({ onSaved, onViewPrediction }) {
  const { profile } = useAuth()
  const { prediction, loading, saving, deadlinePassed, savePrediction } = usePrediction()
  const { match: liveMatch, loading: liveLoading, error: liveError, refresh: refreshLive, isActive, isFinished, lastUpdated: liveLastUpdated, fromCache } = useLiveMatch()

  const [colombiaScore, setColombiaScore] = useState(0)
  const [portugalScore, setPortugalScore] = useState(0)
  const [showSuccess, setShowSuccess] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [error, setError] = useState('')

  // Load existing prediction
  useEffect(() => {
    if (prediction) {
      setColombiaScore(prediction.colombia_score)
      setPortugalScore(prediction.portugal_score)
    }
  }, [prediction])

  const handleSave = async () => {
    setError('')
    const result = await savePrediction(colombiaScore, portugalScore)
    if (result.error) {
      setError(result.error.message || 'Error al guardar. Intenta de nuevo.')
      return
    }
    setShowSuccess(true)
    setIsEditing(false)
    setTimeout(() => setShowSuccess(false), 3000)
  }

  const isUpdate = !!prediction

  return (
    <div className="min-h-[100dvh] flex flex-col px-4 py-6 bg-pitch-pattern">
      {/* Decorative */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-colombia-yellow/3 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md mx-auto flex flex-col gap-6 flex-1">
        {/* Welcome */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <p className="text-sm text-dark-400">
            Hola, <span className="text-colombia-yellow font-semibold">{profile?.display_name}</span> 👋
          </p>
        </motion.div>

        {/* Match Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <MatchCard />
        </motion.div>

        {/* Live Match from football-data.org */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <LiveMatchCard
            match={liveMatch}
            loading={liveLoading}
            error={liveError}
            lastUpdated={liveLastUpdated}
            onRefresh={refreshLive}
            isActive={isActive}
            isFinished={isFinished}
            fromCache={fromCache}
          />
        </motion.div>

        {/* Deadline Countdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-2xl p-4"
        >
          <CountdownTimer deadline={MATCH_DEADLINE} />
        </motion.div>

        {/* Prediction Form */}
        {!deadlinePassed ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass rounded-3xl p-6 sm:p-8"
          >
            <div className="text-center mb-6">
              <h2 className="font-display text-xl font-bold text-white tracking-wide">
                {isUpdate && !isEditing ? 'Tu pronóstico' : '¿Cuál será el marcador?'}
              </h2>
              <p className="text-sm text-dark-400 mt-1">
                {isUpdate && !isEditing
                  ? 'Así pronosticaste este partido'
                  : 'Ingresa los goles para cada equipo'
                }
              </p>
            </div>

            {/* Score Input */}
            <div className="flex items-center justify-center gap-6 sm:gap-10 mb-8">
              <div className="flex flex-col items-center gap-2">
                <span className="text-3xl">🇨🇴</span>
                <span className="font-display text-sm font-bold text-colombia-yellow tracking-wider">
                  COLOMBIA
                </span>
              </div>

              <div className="flex items-center gap-4">
                <ScoreStepper
                  value={colombiaScore}
                  onChange={setColombiaScore}
                  teamName="COL"
                  teamColor="colombia-yellow"
                  disabled={isUpdate && !isEditing}
                />
                <span className="font-display text-2xl text-dark-600 font-bold">-</span>
                <ScoreStepper
                  value={portugalScore}
                  onChange={setPortugalScore}
                  teamName="POR"
                  teamColor="portugal-green"
                  disabled={isUpdate && !isEditing}
                />
              </div>

              <div className="flex flex-col items-center gap-2">
                <span className="text-3xl">🇵🇹</span>
                <span className="font-display text-sm font-bold text-emerald-400 tracking-wider">
                  PORTUGAL
                </span>
              </div>
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Actions */}
            <div className="space-y-3">
              {isUpdate && !isEditing ? (
                <Button
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
                  size="lg"
                  fullWidth
                  onClick={handleSave}
                  loading={saving}
                  icon={isUpdate ? '💾' : '🎯'}
                >
                  {isUpdate ? 'Actualizar pronóstico' : 'Guardar mi pronóstico'}
                </Button>
              )}

              {isUpdate && (
                <Button
                  size="md"
                  fullWidth
                  variant="ghost"
                  onClick={onViewPrediction}
                  icon="👁️"
                >
                  Ver mi pronóstico
                </Button>
              )}
            </div>
          </motion.div>
        ) : (
          /* Deadline Passed */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-3xl p-8 text-center"
          >
            <div className="text-5xl mb-4">🔒</div>
            <h2 className="font-display text-xl font-bold text-white mb-2">
              Pronósticos cerrados
            </h2>
            <p className="text-dark-400 text-sm mb-6">
              El tiempo para hacer pronósticos ha terminado.
              {prediction && ' Ya no puedes editar tu marcador.'}
            </p>
            {prediction && (
              <Button
                size="lg"
                fullWidth
                variant="secondary"
                onClick={onViewPrediction}
                icon="👁️"
              >
                Ver mi pronóstico
              </Button>
            )}
          </motion.div>
        )}

        {/* Success Toast */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.9 }}
              className="fixed bottom-6 left-4 right-4 max-w-md mx-auto z-50"
            >
              <div className="glass rounded-2xl p-4 border border-emerald-500/20 bg-emerald-500/10 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">✅</span>
                </div>
                <div>
                  <p className="font-semibold text-emerald-400 text-sm">
                    {isUpdate ? '¡Pronóstico actualizado!' : '¡Pronóstico guardado!'}
                  </p>
                  <p className="text-xs text-dark-400">
                    Colombia {colombiaScore} - {portugalScore} Portugal
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
