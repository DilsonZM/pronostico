import { useMemo } from 'react'
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
import { PageContainer } from '../components/layout'
import { usePrediction } from '../context/PredictionContext'
import { useLiveData } from '../context/LiveDataContext'
import { useAuth } from '../context/AuthContext'
import { isPast } from '../lib/date-utils'
import { MATCH_DEADLINE } from '../lib/supabase'

export default function MyPrediction({ onEdit, onBack }) {
  const { profile } = useAuth()
  const { prediction } = usePrediction()
  const {
    predictions,
    liveMatch,
    liveLoading,
    liveError,
    refreshLive,
    isActive,
    isFinished,
    liveLastUpdated,
    loading: feedLoading,
    newIds,
  } = useLiveData()

  const canEdit = !isPast(MATCH_DEADLINE) && !isFinished

  if (!prediction) {
    return (
      <PageContainer gap="gap-4">
        <p className="text-slate-400 text-sm text-center mt-20">Aún no has pronosticado</p>
        <Button onClick={onBack} fullWidth icon="🎯">Hacer mi pronóstico</Button>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      {onBack && (
        <button
          onClick={onBack}
          className="self-start inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Volver
        </button>
      )}

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

      <SectionCard title="Tu pronóstico" delay={0.05}>
        <MyPredictionCard prediction={prediction} />
        {onEdit && canEdit && (
          <div className="mt-4 pt-4 border-t border-white/5">
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
        {onEdit && !canEdit && (
          <p className="text-[10px] text-center text-slate-500 mt-3">
            🔒 No se puede editar después del partido
          </p>
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
        liveMatch={liveMatch}
        consensus={null}
      />
    </PageContainer>
  )
}
