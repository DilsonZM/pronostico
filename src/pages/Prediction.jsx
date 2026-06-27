import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import {
  MatchHero,
  LiveMatchStrip,
  MyPredictionCard,
  PredictionForm,
  LivePredictionsFeed,
  SectionCard,
  BotSuggestion,
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
  const [editing, setEditing] = useState(false)
  const formRef = useRef(null)

  // When user clicks Edit, enter edit mode and scroll to the form
  function handleStartEdit() {
    if (!canEdit) return
    setEditing(true)
  }

  // After save, exit edit mode and scroll back to the score
  function handleSaved() {
    setEditing(false)
  }

  // When editing mode is on, scroll the form into view
  useEffect(() => {
    if (editing && formRef.current) {
      setTimeout(() => {
        formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    }
  }, [editing])

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

      {/* If user has a prediction, show score card (with optional edit icon).
          When they tap edit, we toggle into edit mode and show the form. */}
      {prediction && !editing && (
        <>
          <SectionCard title="Tu pronóstico" delay={0.05}>
            <MyPredictionCard prediction={prediction} onEdit={canEdit ? handleStartEdit : null} />
            {!canEdit && (
              <p className="text-[10px] text-center text-slate-500 mt-3">
                🔒 No se puede editar después del partido
              </p>
            )}
          </SectionCard>

          <BotSuggestion
            prediction={prediction}
            familyPredictions={predictions}
            match={liveMatch}
          />
        </>
      )}

      {/* Edit mode OR no prediction yet — show the form */}
      {(editing || !prediction) && (
        <SectionCard
          title={editing ? 'Editar mi marcador' : '¿Cómo terminará?'}
          delay={0.05}
        >
          <div ref={formRef}>
            {predLoading ? (
              <p className="text-center text-slate-500 text-sm py-6">Cargando…</p>
            ) : (
              <PredictionForm onSaved={handleSaved} />
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
