import { useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  MatchHero,
  LiveMatchStrip,
  MyPredictionCard,
  PredictionForm,
  LivePredictionsFeed,
  SectionCard,
} from '../components/ui'
import { PageContainer } from '../components/layout'
import { usePrediction } from '../context/PredictionContext'
import { useLiveData } from '../context/LiveDataContext'
import { useAuth } from '../context/AuthContext'
import { MATCH_DEADLINE } from '../lib/supabase'

export default function Prediction({ onViewPrediction }) {
  const { profile } = useAuth()
  const { prediction, loading: predLoading } = usePrediction()
  const {
    predictions,
    liveMatch,
    liveLoading,
    liveError,
    refreshLive,
    liveLastUpdated,
    isActive,
    isFinished,
    loading: feedLoading,
    newIds,
  } = useLiveData()

  const consensus = useMemo(() => {
    if (!predictions.length) return null
    const tally = {}
    for (const p of predictions) {
      const k = `${p.colombia_score}-${p.portugal_score}`
      tally[k] = (tally[k] || 0) + 1
    }
    const [top, count] = Object.entries(tally).sort((a, b) => b[1] - a[1])[0]
    const [col, por] = top.split('-').map(Number)
    return { col, por, total: predictions.length, count }
  }, [predictions])

  return (
    <PageContainer>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center"
      >
        <p className="text-[10px] font-semibold tracking-[0.22em] uppercase text-slate-500 mb-2">
          Hola, {profile?.display_name}
        </p>
      </motion.div>

      <SectionCard delay={0.05}>
        <MatchHero kickoffISO={MATCH_DEADLINE.toISOString()} />
      </SectionCard>

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

      {prediction ? (
        <SectionCard title="Tu pronóstico" delay={0.05}>
          <MyPredictionCard prediction={prediction} />
          {onViewPrediction && !isFinished && (
            <div className="mt-4 pt-4 border-t border-white/5">
              <button
                onClick={onViewPrediction}
                className="w-full text-center text-xs text-slate-400 hover:text-white transition-colors py-1.5"
              >
                Ver detalles
              </button>
            </div>
          )}
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

      <LivePredictionsFeed
        predictions={predictions.filter((p) => p.user_id !== profile?.id)}
        loading={feedLoading}
        newIds={newIds}
        liveMatch={liveMatch}
        consensus={consensus}
      />
    </PageContainer>
  )
}
