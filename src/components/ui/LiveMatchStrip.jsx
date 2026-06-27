import { motion } from 'framer-motion'
import { STATUS_LABELS, STATUS_COLORS } from '../../lib/liveMatch'
import { formatRelative } from '../../lib/date-utils'
import CountdownCard from './CountdownCard'

/**
 * LiveMatchStrip — adaptive
 * - When match is scheduled: slim status row
 * - When match is live / finished: prominent score with flags
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
  const halfScore = match?.score?.halfTime
  const penalties = match?.score?.penalties
  const lastUpdateRel = lastUpdated ? formatRelative(lastUpdated.toISOString?.() || lastUpdated) : null

  if (loading && !match) {
    return (
      <div className="rounded-2xl bg-slate-900/60 border border-white/5 px-4 py-4 animate-pulse">
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

  // PROMINENT MODE — match is in play or finished
  if (showScores && score) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className={`
          relative rounded-2xl border backdrop-blur-md
          px-4 py-5 overflow-hidden
          ${isActive
            ? 'border-red-500/30 bg-gradient-to-b from-red-500/5 to-slate-900/70 shadow-[0_0_32px_-12px_rgba(239,68,68,0.5)]'
            : 'border-white/10 bg-slate-900/70'
          }
        `}
      >
        {/* Status row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {isActive && (
              <motion.span
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-2 h-2 rounded-full bg-red-500"
              />
            )}
            <span className={`text-[10px] font-bold uppercase tracking-[0.18em] ${statusColor}`}>
              {statusLabel}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-500">
            {lastUpdateRel && <span className="text-[10px]">{lastUpdateRel}</span>}
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
        </div>

        {/* Big score */}
        <div className="flex items-center justify-center gap-3 sm:gap-4">
          <span className="text-2xl sm:text-3xl" aria-hidden>🇨🇴</span>
          <div className="flex items-baseline gap-2">
            <motion.span
              key={score.home}
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 18 }}
              className="font-display text-4xl sm:text-5xl font-black text-white tabular-nums leading-none"
            >
              {score.home ?? 0}
            </motion.span>
            <span className="font-display text-2xl text-slate-600 font-light">–</span>
            <motion.span
              key={score.away}
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 18 }}
              className="font-display text-4xl sm:text-5xl font-black text-white tabular-nums leading-none"
            >
              {score.away ?? 0}
            </motion.span>
          </div>
          <span className="text-2xl sm:text-3xl" aria-hidden>🇵🇹</span>
        </div>

        {/* Half-time / penalties extras */}
        {(halfScore?.home !== null && halfScore?.home !== undefined) ||
         (penalties?.home !== null && penalties?.home !== undefined) ? (
          <div className="mt-3 flex items-center justify-center gap-3 text-[10px] text-slate-500">
            {halfScore?.home !== null && halfScore?.home !== undefined && (
              <span>HT {halfScore.home}–{halfScore.away}</span>
            )}
            {penalties?.home !== null && penalties?.home !== undefined && (
              <span className="text-yellow-300/80">(P) {penalties.home}–{penalties.away}</span>
            )}
          </div>
        ) : null}
      </motion.div>
    )
  }

  // SLIM MODE — match is scheduled
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="rounded-2xl border border-white/5 bg-slate-900/60 backdrop-blur-md px-4 py-3 flex items-center justify-between gap-3 text-xs"
    >
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-slate-500">⏱️</span>
        <span className="font-semibold uppercase tracking-wider text-slate-400">
          {statusLabel || 'Programado'}
        </span>
      </div>

      {deadline && !isFinished && (
        <div className="shrink-0">
          <CountdownCard deadline={deadline} />
        </div>
      )}

      <div className="flex items-center gap-1.5 shrink-0 text-slate-500">
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
