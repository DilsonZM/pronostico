import { motion } from 'framer-motion'
import {
  Button,
  MatchHero,
  LiveMatchStrip,
  MyPredictionCard,
  PredictionForm,
  LivePredictionsFeed,
  SectionCard,
} from '../components/ui'
import { usePrediction } from '../context/PredictionContext'
import { useLiveMatch } from '../hooks/useLiveMatch'
import { useRealtimePredictions } from '../hooks/useRealtimePredictions'
import { useAuth } from '../context/AuthContext'
import { MATCH_DEADLINE } from '../lib/supabase'

/**
 * Prediction — minimal, one section at a time
 * Stack: Greeting → Hero → Status strip → My prediction (or form) → Live feed
 */
export default function Prediction({ onViewPrediction }) {
  const { profile } = useAuth()
  const { prediction, loading: predLoading } = usePrediction()
  const {
    match: liveMatch,
    loading: liveLoading,
    error: liveError,
    refresh: refreshLive,
    lastUpdated: liveLastUpdated,
    isActive,
    isFinished,
  } = useLiveMatch()
  const { predictions, loading: feedLoading, newIds } = useRealtimePredictions()

  return (
    <div
      className="min-h-[100dvh] px-4 sm:px-6 py-6 sm:py-8"
      style={{
        background: 'radial-gradient(ellipse at top, #1e293b 0%, #0f172a 50%, #020617 100%)',
      }}
    >
      <div className="w-full max-w-md mx-auto flex flex-col gap-5">
        {/* Greeting + hero en una sola línea visual */}
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <p className="text-[10px] font-semibold tracking-[0.22em] uppercase text-slate-500">
            Hola, {profile?.display_name}
          </p>
          <div className="mt-2">
            <MatchHero kickoffISO={MATCH_DEADLINE.toISOString()} />
          </div>
        </motion.div>

        {/* Status + countdown en una sola fila */}
        <LiveMatchStrip
          match={liveMatch}
          loading={liveLoading}
          error={liveError}
          deadline={MATCH_DEADLINE.toISOString()}
          isActive={isActive}
          isFinished={isFinished}
          lastUpdated={liveLastUpdated}
          onRefresh={refreshLive}
        />

        {/* Mi pronóstico o form */}
        {prediction ? (
          <SectionCard
            title="Tu pronóstico"
            delay={0.05}
          >
            <MyPredictionCard prediction={prediction} />
            <div className="mt-5 pt-5 border-t border-white/5">
              <Button
                size="md"
                fullWidth
                variant="secondary"
                onClick={onViewPrediction}
                icon="👁️"
              >
                Ver detalles
              </Button>
            </div>
          </SectionCard>
        ) : (
          <SectionCard title="¿Cómo terminará?" delay={0.05}>
            {predLoading ? (
              <p className="text-center text-slate-500 text-sm py-6">Cargando…</p>
            ) : (
              <PredictionForm />
            )}
          </SectionCard>
        )}

        {/* Feed en vivo */}
        <LivePredictionsFeed
          predictions={predictions.filter((p) => p.user_id !== profile?.id)}
          loading={feedLoading}
          newIds={newIds}
        />
      </div>
    </div>
  )
}
