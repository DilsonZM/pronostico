import { useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Button,
  LiveMatchCard,
  MatchHero,
  CountdownCard,
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
    fromCache,
  } = useLiveMatch()

  const { predictions, loading: feedLoading, newIds } = useRealtimePredictions()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  return (
    <div
      className="min-h-[100dvh] px-4 sm:px-6 py-6 sm:py-8"
      style={{
        background: 'radial-gradient(ellipse at top, #1e293b 0%, #0f172a 50%, #020617 100%)',
      }}
    >
      <div className="w-full max-w-md mx-auto flex flex-col gap-6">
        {/* Greeting */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <p className="text-sm text-slate-300">
            Hola, <span className="font-semibold text-yellow-300">{profile?.display_name}</span> 👋
          </p>
        </motion.div>

        {/* 1. Match Hero */}
        <MatchHero kickoffISO={MATCH_DEADLINE.toISOString()} />

        {/* 2. Live score (compact, from football-data.org) */}
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

        {/* 3. Countdown */}
        <CountdownCard deadline={MATCH_DEADLINE.toISOString()} />

        {/* 4. My prediction OR form */}
        {prediction ? (
          <SectionCard
            eyebrow="Tu marcador"
            title="Tu pronóstico guardado"
            delay={0.05}
          >
            <MyPredictionCard prediction={prediction} />
            {onViewPrediction && (
              <div className="mt-4">
                <Button
                  size="md"
                  fullWidth
                  variant="ghost"
                  onClick={onViewPrediction}
                  icon="👁️"
                >
                  Ver detalles
                </Button>
              </div>
            )}
          </SectionCard>
        ) : (
          <SectionCard
            eyebrow="Tu marcador"
            title="¿Cómo terminará?"
            delay={0.05}
          >
            {predLoading ? (
              <p className="text-center text-slate-500 text-sm py-6">Cargando…</p>
            ) : (
              <PredictionForm />
            )}
          </SectionCard>
        )}

        {/* 5. Live feed */}
        <LivePredictionsFeed
          predictions={predictions.filter((p) => p.user_id !== profile?.id)}
          loading={feedLoading}
          newIds={newIds}
        />
      </div>
    </div>
  )
}
