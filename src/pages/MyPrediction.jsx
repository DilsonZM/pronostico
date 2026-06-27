import { motion } from 'framer-motion'
import { Button, MatchCard, LiveMatchCard, PredictionComparison } from '../components/ui'
import { useAuth } from '../context/AuthContext'
import { usePrediction } from '../context/PredictionContext'
import { useLiveMatch } from '../hooks/useLiveMatch'
import { MATCH_DEADLINE } from '../lib/supabase'

export default function MyPrediction({ onEdit, onBack }) {
  const { profile } = useAuth()
  const { prediction, deadlinePassed } = usePrediction()
  const { match: liveMatch, loading: liveLoading, error: liveError, refresh: refreshLive, isActive, isFinished, lastUpdated: liveLastUpdated, fromCache } = useLiveMatch()

  if (!prediction) {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center px-4 py-8">
        <div className="text-center space-y-4">
          <span className="text-5xl">📋</span>
          <h2 className="font-display text-xl font-bold text-white">
            Sin pronóstico
          </h2>
          <p className="text-dark-400 text-sm">
            Aún no has registrado tu pronóstico.
          </p>
          <Button onClick={onBack} icon="🎯">
            Hacer mi pronóstico
          </Button>
        </div>
      </div>
    )
  }

  const colombiaScore = prediction.colombia_score
  const portugalScore = prediction.portugal_score
  const result = colombiaScore > portugalScore
    ? 'Victoria Colombia'
    : colombiaScore < portugalScore
    ? 'Victoria Portugal'
    : 'Empate'

  const resultColors = {
    'Victoria Colombia': 'text-colombia-yellow',
    'Victoria Portugal': 'text-emerald-400',
    'Empate': 'text-dark-300',
  }

  const resultEmojis = {
    'Victoria Colombia': '🇨🇴',
    'Victoria Portugal': '🇵🇹',
    'Empate': '🤝',
  }

  return (
    <div className="min-h-[100dvh] flex flex-col px-4 py-6 bg-pitch-pattern">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-colombia-yellow/3 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md mx-auto flex flex-col gap-6 flex-1">
        {/* Back */}
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={onBack}
          className="self-start flex items-center gap-2 text-dark-400 hover:text-white transition-colors text-sm"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Volver
        </motion.button>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <p className="text-sm text-dark-400 mb-1">
            Pronóstico de <span className="text-colombia-yellow font-semibold">{profile?.display_name}</span>
          </p>
          <h1 className="font-display text-2xl font-bold text-white tracking-wide">
            Mi Marcador
          </h1>
        </motion.div>

        {/* Score Display Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.2 }}
          className="glass rounded-3xl p-8 text-center"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex flex-col items-center gap-3 flex-1">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-colombia-yellow/20 to-colombia-blue/10 border border-colombia-yellow/20 flex items-center justify-center">
                <span className="text-4xl">🇨🇴</span>
              </div>
              <span className="font-display text-sm font-bold text-colombia-yellow tracking-wider">
                COLOMBIA
              </span>
            </div>

            <div className="flex items-center gap-3 px-4">
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.4 }}
                className="font-display text-6xl sm:text-7xl font-black text-white"
              >
                {colombiaScore}
              </motion.span>
              <span className="font-display text-3xl text-dark-600 font-bold">-</span>
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.5 }}
                className="font-display text-6xl sm:text-7xl font-black text-white"
              >
                {portugalScore}
              </motion.span>
            </div>

            <div className="flex flex-col items-center gap-3 flex-1">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-portugal-green/20 to-portugal-red/10 border border-portugal-green/20 flex items-center justify-center">
                <span className="text-4xl">🇵🇹</span>
              </div>
              <span className="font-display text-sm font-bold text-emerald-400 tracking-wider">
                PORTUGAL
              </span>
            </div>
          </div>

          {/* Result badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-light"
          >
            <span>{resultEmojis[result]}</span>
            <span className={`text-sm font-semibold ${resultColors[result]}`}>
              {result}
            </span>
          </motion.div>
        </motion.div>

        {/* Live Match Score */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
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

        {/* Prediction vs Live Comparison */}
        {liveMatch && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <PredictionComparison
              prediction={prediction}
              liveMatch={liveMatch}
            />
          </motion.div>
        )}

        {/* Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass rounded-2xl p-4 space-y-3"
        >
          <div className="flex items-center justify-between text-sm">
            <span className="text-dark-400">Estado</span>
            <span className={deadlinePassed ? 'text-red-400' : 'text-emerald-400'}>
              {deadlinePassed ? '🔒 Cerrado' : '🟢 Abierto'}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-dark-400">Creado</span>
            <span className="text-dark-300">
              {new Date(prediction.created_at).toLocaleString('es-CO', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
          {prediction.updated_at !== prediction.created_at && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-dark-400">Última edición</span>
              <span className="text-dark-300">
                {new Date(prediction.updated_at).toLocaleString('es-CO', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          )}
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-3 mt-auto"
        >
          {!deadlinePassed && (
            <Button
              size="lg"
              fullWidth
              variant="secondary"
              onClick={onEdit}
              icon="✏️"
            >
              Editar mi pronóstico
            </Button>
          )}
        </motion.div>
      </div>
    </div>
  )
}
