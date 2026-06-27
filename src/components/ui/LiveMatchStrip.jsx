import { motion } from 'framer-motion'
import { STATUS_LABELS, STATUS_COLORS } from '../../lib/liveMatch'
import { formatRelative } from '../../lib/date-utils'
import CountdownCard from './CountdownCard'

/**
 * LiveMatchStrip — single elegant status row
 * Combines live status + score + countdown + last update + refresh.
 * Replaces the bulky separate LiveMatchCard and CountdownCard.
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
    return (
      <div className="rounded-2xl bg-slate-900/60 border border-white/5 px-4 py-3 animate-pulse">
        <div className="h-3 w-32 bg-slate-800 rounded" />
      </div>
    )
  }

  if (error && !match) {
    return (
      <div className="rounded-2xl bg-slate-900/60 border border-white/5 px-4 py-3 text-xs text-slate-500 flex items-center justify-between">
        <span>📡 Sin conexión con el servidor del partido</span>
        {deadline && !isFinished && <CountdownCard deadline={deadline} />}
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={`
        rounded-2xl border bg-slate-900/60 backdrop-blur-md
        px-4 py-3 flex items-center justify-between gap-3 text-xs
        ${isActive ? 'border-red-500/20 shadow-[0_0_24px_-8px_rgba(239,68,68,0.4)]' : 'border-white/5'}
      `}
    >
      {/* Status + score */}
      <div className="flex items-center gap-2 min-w-0">
        {isActive && (
          <motion.span
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"
          />
        )}
        <span className={`font-semibold uppercase tracking-wider ${statusColor}`}>
          {statusLabel || 'Programado'}
        </span>
        {showScores && score && (
          <span className="font-display font-bold text-white tabular-nums ml-1">
            {score.home}–{score.away}
          </span>
        )}
      </div>

      {/* Countdown */}
      {deadline && !isFinished && (
        <div className="shrink-0">
          <CountdownCard deadline={deadline} />
        </div>
      )}

      {/* Last update + refresh */}
      <div className="flex items-center gap-1.5 shrink-0 text-slate-500">
        {lastUpdateRel && <span className="hidden sm:inline text-[11px]">· {lastUpdateRel}</span>}
        {onRefresh && (
          <motion.button
            whileTap={{ scale: 0.9 }}
            whileHover={{ rotate: 90 }}
            transition={{ duration: 0.2 }}
            onClick={onRefresh}
            className="p-1 rounded text-slate-500 hover:text-white transition-colors"
            title="Actualizar"
            aria-label="Actualizar marcador"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 2v6h-6M3 12a9 9 0 0 1 15-6.7L21 8M3 22v-6h6M21 12a9 9 0 0 1-15 6.7L3 16" />
            </svg>
          </motion.button>
        )}
      </div>
    </motion.div>
  )
}
