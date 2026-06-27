import { motion } from 'framer-motion'
import { STATUS_LABELS, STATUS_COLORS } from '../../lib/liveMatch'
import { formatRelative } from '../../lib/date-utils'
import CountdownCard from './CountdownCard'

/**
 * LiveMatchStrip — clean sans-serif
 */
export default function LiveMatchStrip({
  match,
  loading,
  error,
  deadline,
  isActive,
  isFinished,
  lastUpdated,
  onRefresh,
}) {
  const status = match?.status
  const statusLabel = status ? (STATUS_LABELS[status] || status) : null
  const statusColor = status ? (STATUS_COLORS[status] || 'text-slate-400') : 'text-slate-400'
  const showScores = status && ['IN_PLAY', 'PAUSED', 'FINISHED', 'SUSPENDED'].includes(status)
  const score = match?.score?.fullTime
  const lastUpdateRel = lastUpdated ? formatRelative(lastUpdated.toISOString?.() || lastUpdated) : null

  if (loading && !match) {
    return <div className="rounded-2xl bg-slate-900/70 border border-white/8 h-14 animate-pulse" />
  }

  if (error && !match) {
    return (
      <div className="rounded-2xl bg-slate-900/70 border border-white/8 px-4 py-3 text-xs text-slate-500 flex items-center justify-between">
        <span>📡 Sin conexión con el servidor del partido</span>
        {deadline && !isFinished && <CountdownCard deadline={deadline} />}
      </div>
    )
  }

  // Prominent mode when there's a score
  if (showScores && score) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-2xl border px-4 py-4
          ${isActive ? 'border-red-500/20 bg-red-500/5' : 'border-white/8 bg-slate-900/70'}
        `}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {isActive && (
              <motion.span
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-1.5 h-1.5 rounded-full bg-red-500"
              />
            )}
            <span className={`text-[10px] font-semibold uppercase tracking-[0.18em] ${statusColor}`}>
              {statusLabel}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-500">
            {lastUpdateRel && <span className="text-[10px]">{lastUpdateRel}</span>}
            {onRefresh && (
              <button
                onClick={onRefresh}
                className="p-1 rounded text-slate-500 hover:text-white transition-colors"
                title="Actualizar"
                aria-label="Actualizar marcador"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 2v6h-6M3 12a9 9 0 0 1 15-6.7L21 8M3 22v-6h6M21 12a9 9 0 0 1-15 6.7L3 16" />
                </svg>
              </button>
            )}
          </div>
        </div>
        <div className="flex items-center justify-center gap-2">
          <span className="text-xl" aria-hidden>🇨🇴</span>
          <span className="font-mono text-3xl font-bold text-white tabular-nums">
            {score.home ?? 0}
            <span className="text-slate-500 mx-2 font-light">–</span>
            {score.away ?? 0}
          </span>
          <span className="text-xl" aria-hidden>🇵🇹</span>
        </div>
      </motion.div>
    )
  }

  // Slim mode when match is scheduled
  return (
    <div className="rounded-2xl border border-white/8 bg-slate-900/70 px-4 py-3 flex items-center justify-between gap-3 text-xs">
      <div className="flex items-center gap-2">
        <span className="text-slate-500 text-base">⏱</span>
        <span className="font-medium text-slate-400">{statusLabel || 'Programado'}</span>
      </div>
      {deadline && !isFinished && <CountdownCard deadline={deadline} />}
      {onRefresh && (
        <button
          onClick={onRefresh}
          className="p-1 rounded text-slate-500 hover:text-white transition-colors"
          title="Actualizar"
          aria-label="Actualizar marcador"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 2v6h-6M3 12a9 9 0 0 1 15-6.7L21 8M3 22v-6h6M21 12a9 9 0 0 1-15 6.7L3 16" />
          </svg>
        </button>
      )}
    </div>
  )
}
