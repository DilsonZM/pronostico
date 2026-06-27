import { motion } from 'framer-motion'
import {
  Button,
  MatchHero,
  LiveMatchStrip,
  MyPredictionCard,
  PredictionComparison,
  LivePredictionsFeed,
  SectionCard,
} from '../components/ui'
import { usePrediction } from '../context/PredictionContext'
import { useLiveMatch } from '../hooks/useLiveMatch'
import { useRealtimePredictions } from '../hooks/useRealtimePredictions'
import { useAuth } from '../context/AuthContext'
import { MATCH_DEADLINE } from '../lib/supabase'

/**
 * MyPrediction — narrow column, no "Ver detalles"
 */
export default function MyPrediction({ onEdit, onBack }) {
  const { profile } = useAuth()
  const { prediction } = usePrediction()
  const {
    match: liveMatch,
    loading: liveLoading,
    error: liveError,
    refresh: refreshLive,
    isActive,
    isFinished,
    lastUpdated: liveLastUpdated,
  } = useLiveMatch()
  const { predictions, loading: feedLoading, newIds } = useRealtimePredictions()

  if (!prediction) {
    return (
      <div
        className="min-h-[100dvh] flex flex-col items-center justify-center px-6 text-center gap-4"
        style={{ background: 'radial-gradient(ellipse at top, #1e293b 0%, #0f172a 50%, #020617 100%)' }}
      >
        <p className="text-slate-400 text-sm">Aún no has pronosticado</p>
        <Button onClick={onBack} icon="🎯">Hacer mi pronóstico</Button>
      </div>
    )
  }

  return (
    <div
      className="min-h-[100dvh] px-4 sm:px-6 py-6 sm:py-8"
      style={{
        background: 'radial-gradient(ellipse at top, #1e293b 0%, #0f172a 50%, #020617 100%)',
      }}
    >
      <div className="w-full max-w-[340px] mx-auto flex flex-col gap-5">
        {onBack && <BackButton onClick={onBack} />}

        <MatchHero kickoffISO={MATCH_DEADLINE.toISOString()} />

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

        <SectionCard title="Tu pronóstico" delay={0.05}>
          <MyPredictionCard prediction={prediction} />
          {onEdit && (
            <div className="mt-5 pt-5 border-t border-white/5">
              <Button
                size="md"
                fullWidth
                variant="secondary"
                onClick={onEdit}
                icon="✏️"
              >
                Editar
              </Button>
            </div>
          )}
        </SectionCard>

        {liveMatch && (
          <SectionCard title="Tu pronóstico vs. resultado" delay={0.1}>
            <PredictionComparison prediction={prediction} liveMatch={liveMatch} />
          </SectionCard>
        )}

        <LivePredictionsFeed
          predictions={predictions.filter((p) => p.user_id !== profile?.id)}
          loading={feedLoading}
          newIds={newIds}
        />
      </div>
    </div>
  )
}

function BackButton({ onClick }) {
  return (
    <motion.button
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      onClick={onClick}
      className="self-start inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 12H5M12 19l-7-7 7-7" />
      </svg>
      Volver
    </motion.button>
  )
}
