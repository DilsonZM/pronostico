import { useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  MatchHero,
  LiveMatchStrip,
  MyPredictionCard,
  PredictionForm,
  LivePredictionsFeed,
  SectionCard,
  BotAnalisis,
} from '../components/ui'
import { PageContainer } from '../components/layout'
import { usePrediction } from '../context/PredictionContext'
import { useLiveMatch } from '../hooks/useLiveMatch'
import { useRealtimePredictions } from '../hooks/useRealtimePredictions'
import { useAuth } from '../context/AuthContext'
import { MATCH_DEADLINE } from '../lib/supabase'

/**
 * Prediction — floating island + bot analysis
 */
export default function Prediction() {
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

  // Build family + consensus for the bot
  const familyPredictions = useMemo(
    () => predictions,
    [predictions]
  )
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
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <p className="text-[10px] font-semibold tracking-[0.22em] uppercase text-slate-500 mb-3">
          Hola, {profile?.display_name}
        </p>
      </motion.div>

      <div className="rounded-3xl bg-slate-900/55 border border-white/8 backdrop-blur-xl p-5 sm:p-6 shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
        <MatchHero kickoffISO={MATCH_DEADLINE.toISOString()} />
      </div>

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

      {/* Bot analítico con IA */}
      <SectionCard
        eyebrow="Asistente"
        title="¿Necesitas ayuda para decidir?"
        delay={0.07}
      >
        <p className="text-xs text-slate-400 mb-3 leading-relaxed">
          Pídele al bot un análisis del partido basado en los pronósticos
          de la familia y el contexto del encuentro.
        </p>
        <BotAnalisis
          familyPredictions={familyPredictions}
          match={liveMatch}
          userPrediction={
            prediction
              ? { colombia: prediction.colombia_score, portugal: prediction.portugal_score }
              : null
          }
          triggerLabel="Pedir análisis al bot"
        />
      </SectionCard>

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
