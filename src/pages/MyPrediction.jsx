import { useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Button,
  LiveMatchCard,
  MatchHero,
  MyPredictionCard,
  PredictionComparison,
  SectionCard,
  LivePredictionsFeed,
} from '../components/ui'
import { usePrediction } from '../context/PredictionContext'
import { useLiveMatch } from '../hooks/useLiveMatch'
import { useRealtimePredictions } from '../hooks/useRealtimePredictions'
import { useAuth } from '../context/AuthContext'
import { MATCH_DEADLINE } from '../lib/supabase'

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
    fromCache,
  } = useLiveMatch()
  const { predictions, loading: feedLoading, newIds } = useRealtimePredictions()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  if (!prediction) {
    return (
      <div
        className="min-h-[100dvh] flex flex-col items-center justify-center px-6 text-center gap-4"
        style={{
          background: 'radial-gradient(ellipse at top, #1e293b 0%, #0f172a 50%, #020617 100%)',
        }}
      >
        <div className="w-16 h-16 rounded-2xl bg-slate-800/60 border border-white/10 flex items-center justify-center text-3xl">
          📋
        </div>
        <h2 className="font-display text-xl font-bold text-white">Sin pronóstico aún</h2>
        <p className="text-slate-400 text-sm max-w-[260px]">
          Registra tu marcador para participar
        </p>
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
      <div className="w-full max-w-md mx-auto flex flex-col gap-6">
        {onBack && (
          <BackButton onClick={onBack} />
        )}

        <MatchHero kickoffISO={MATCH_DEADLINE.toISOString()} />

        <SectionCard
          eyebrow={`Hola, ${profile?.display_name || 'fan'}`}
          title="Tu marcador"
          delay={0.05}
        >
          <MyPredictionCard prediction={prediction} />
          {onEdit && (
            <div className="mt-4">
              <Button
                size="md"
                fullWidth
                variant="secondary"
                onClick={onEdit}
                icon="✏️"
              >
                Editar mi pronóstico
              </Button>
            </div>
          )}
        </SectionCard>

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

        {liveMatch && (
          <SectionCard eyebrow="Análisis" title="Tu pronóstico vs. resultado" delay={0.1}>
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
      className="self-start inline-flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 12H5M12 19l-7-7 7-7" />
      </svg>
      Volver
    </motion.button>
  )
}
