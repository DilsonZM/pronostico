import { useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  MatchHero,
  LiveMatchStrip,
  MyPredictionCard,
  PredictionForm,
  LivePredictionsFeed,
  SectionCard,
  BotSuggestion,
  Button,
} from '../components/ui'
import { PageContainer } from '../components/layout'
import { usePrediction } from '../context/PredictionContext'
import { useLiveData } from '../context/LiveDataContext'
import { useAuth } from '../context/AuthContext'
import { isPast } from '../lib/date-utils'
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

  const canEdit = !isPast(MATCH_DEADLINE) && !isFinished
  const formRef = useRef(null)

  function handleEditClick() {
    // Navigate to MyPrediction and scroll to the form
    if (onViewPrediction) onViewPrediction()
  }

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
        <>
          <SectionCard title="Tu pronóstico" delay={0.05}>
            <MyPredictionCard prediction={prediction} />
            {canEdit && (
              <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-center">
                <Button
                  size="md"
                  variant="secondary"
                  onClick={handleEditClick}
                  icon="✏️"
                >
                  Editar marcador
                </Button>
              </div>
            )}
            {!canEdit && (
              <p className="text-[10px] text-center text-slate-500 mt-3">
                🔒 No se puede editar después del partido
              </p>
            )}
          </SectionCard>

          {/* Short bot suggestion just below the score card */}
          <BotSuggestion
            prediction={prediction}
            familyPredictions={predictions}
            match={liveMatch}
          />
        </>
      ) : (
        <SectionCard
          title="¿Cómo terminará?"
          delay={0.05}
        >
          <div ref={formRef}>
            {predLoading ? (
              <p className="text-center text-slate-500 text-sm py-6">Cargando…</p>
            ) : (
              <PredictionForm />
            )}
          </div>
        </SectionCard>
      )}

      <LivePredictionsFeed
        predictions={predictions.filter((p) => p.user_id !== profile?.id)}
        loading={feedLoading}
        newIds={newIds}
        liveMatch={liveMatch}
        consensus={null}
      />
    </PageContainer>
  )
}
