/**
 * LiveMatchCard Component
 * 
 * Displays the live match score from football-data.org.
 * Shows team names, scores, status, half-time scores, and penalties.
 * Auto-refreshes when the match is in play.
 */

import { motion, AnimatePresence } from 'framer-motion'
import { STATUS_LABELS, STATUS_COLORS } from '../../lib/liveMatch'

export default function LiveMatchCard({
  match,
  loading,
  error,
  lastUpdated,
  onRefresh,
  isActive,
  isFinished,
  fromCache,
  compact = false,
}) {
  // Loading skeleton
  if (loading && !match) {
    return (
      <div className="glass rounded-2xl p-5">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-white/5 animate-pulse" />
          <div className="w-20 h-4 bg-white/5 rounded animate-pulse" />
        </div>
        <div className="flex items-center justify-center gap-8">
          <div className="flex flex-col items-center gap-2">
            <div className="w-14 h-14 rounded-xl bg-white/5 animate-pulse" />
            <div className="w-16 h-3 bg-white/5 rounded animate-pulse" />
          </div>
          <div className="w-20 h-10 bg-white/5 rounded animate-pulse" />
          <div className="flex flex-col items-center gap-2">
            <div className="w-14 h-14 rounded-xl bg-white/5 animate-pulse" />
            <div className="w-16 h-3 bg-white/5 rounded animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error && !match) {
    return (
      <div className="glass rounded-2xl p-5">
        <div className="flex items-center justify-center gap-2 text-slate-500">
          <span>📡</span>
          <p className="text-sm">{error.message || 'No se pudieron cargar los datos del partido'}</p>
        </div>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="mx-auto mt-3 flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 2v6h-6M3 12a9 9 0 0 1 15-6.7L21 8M3 22v-6h6M21 12a9 9 0 0 1-15 6.7L3 16" />
            </svg>
            Reintentar
          </button>
        )}
      </div>
    )
  }

  // No match found
  if (!match) {
    return (
      <div className="glass rounded-2xl p-5 text-center">
        <span className="text-2xl mb-2 block">📡</span>
        <p className="text-sm text-slate-500">
          Partido no disponible en la API aún
        </p>
      </div>
    )
  }

  const { homeTeam, awayTeam, score, status, utcDate } = match
  const statusLabel = STATUS_LABELS[status] || status
  const statusColor = STATUS_COLORS[status] || 'text-slate-400'
  const showScores = ['IN_PLAY', 'PAUSED', 'FINISHED', 'SUSPENDED'].includes(status)
  const showHalftime = score.halfTime?.home !== null
  const showPenalties = score.penalties?.home !== null

  if (compact) {
    return (
      <div className="flex items-center justify-between glass rounded-xl px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-base">🇨🇴</span>
          <span className="font-display text-sm font-bold text-white">COL</span>
          {showScores && (
            <span className="font-display text-lg font-black text-white ml-1">
              {score.fullTime.home ?? 0}
            </span>
          )}
        </div>

        <div className="flex flex-col items-center">
          {isActive && (
            <motion.div
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1.5 h-1.5 rounded-full bg-red-500 mb-1"
            />
          )}
          <span className={`text-[10px] font-semibold uppercase tracking-wider ${statusColor}`}>
            {statusLabel}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {showScores && (
            <span className="font-display text-lg font-black text-white mr-1">
              {score.fullTime.away ?? 0}
            </span>
          )}
          <span className="font-display text-sm font-bold text-white">POR</span>
          <span className="text-base">🇵🇹</span>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass rounded-2xl p-5 sm:p-6 relative overflow-hidden ${
        isActive ? 'ring-1 ring-red-500/30' : ''
      }`}
    >
      {/* Active indicator glow */}
      {isActive && (
        <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 via-transparent to-red-500/5 pointer-events-none" />
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-widest">
            Resultado en vivo
          </span>
          {fromCache && (
            <span className="text-[9px] text-slate-600 bg-white/5 px-1.5 py-0.5 rounded">
              cache
            </span>
          )}
        </div>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition-colors"
            title="Actualizar"
          >
            <motion.svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              animate={loading ? { rotate: 360 } : {}}
              transition={loading ? { duration: 1, repeat: Infinity, ease: 'linear' } : {}}
            >
              <path d="M21 2v6h-6M3 12a9 9 0 0 1 15-6.7L21 8M3 22v-6h6M21 12a9 9 0 0 1-15 6.7L3 16" />
            </motion.svg>
          </button>
        )}
      </div>

      {/* Status Badge */}
      <div className="flex justify-center mb-4">
        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full glass-light ${
          isActive ? 'border-red-500/20' : ''
        }`}>
          {isActive && (
            <motion.div
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="w-2 h-2 rounded-full bg-red-500"
            />
          )}
          <span className={`text-xs font-bold uppercase tracking-wider ${statusColor}`}>
            {statusLabel}
          </span>
        </div>
      </div>

      {/* Score Display */}
      <div className="flex items-center justify-between gap-3 mb-4">
        {/* Home Team (Colombia) */}
        <div className="flex flex-col items-center gap-2 flex-1">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-colombia-yellow/20 to-colombia-blue/10 border border-colombia-yellow/20 flex items-center justify-center">
            {homeTeam.crest ? (
              <img src={homeTeam.crest} alt="COL" className="w-9 h-9 sm:w-10 sm:h-10 object-contain" />
            ) : (
              <span className="text-3xl sm:text-4xl">🇨🇴</span>
            )}
          </div>
          <span className="font-display text-xs sm:text-sm font-bold text-colombia-yellow tracking-wider">
            COLOMBIA
          </span>
        </div>

        {/* Score */}
        <div className="flex items-center gap-2 sm:gap-3">
          <AnimatePresence mode="popLayout">
            <motion.span
              key={`home-${score.fullTime.home}`}
              initial={{ y: -15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 15, opacity: 0 }}
              className="font-display text-5xl sm:text-6xl font-black text-white tabular-nums"
            >
              {showScores ? (score.fullTime.home ?? '·') : '·'}
            </motion.span>
          </AnimatePresence>

          <span className="font-display text-2xl text-slate-600 font-bold">-</span>

          <AnimatePresence mode="popLayout">
            <motion.span
              key={`away-${score.fullTime.away}`}
              initial={{ y: -15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 15, opacity: 0 }}
              className="font-display text-5xl sm:text-6xl font-black text-white tabular-nums"
            >
              {showScores ? (score.fullTime.away ?? '·') : '·'}
            </motion.span>
          </AnimatePresence>
        </div>

        {/* Away Team (Portugal) */}
        <div className="flex flex-col items-center gap-2 flex-1">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-portugal-green/20 to-portugal-red/10 border border-portugal-green/20 flex items-center justify-center">
            {awayTeam.crest ? (
              <img src={awayTeam.crest} alt="POR" className="w-9 h-9 sm:w-10 sm:h-10 object-contain" />
            ) : (
              <span className="text-3xl sm:text-4xl">🇵🇹</span>
            )}
          </div>
          <span className="font-display text-xs sm:text-sm font-bold text-emerald-400 tracking-wider">
            PORTUGAL
          </span>
        </div>
      </div>

      {/* Half-time & Penalties */}
      {(showHalftime || showPenalties) && (
        <div className="flex items-center justify-center gap-4 mb-3 text-xs">
          {showHalftime && (
            <span className="text-slate-500">
              MT: {score.halfTime.home} - {score.halfTime.away}
            </span>
          )}
          {showPenalties && (
            <span className="text-amber-400 font-semibold">
              Pen: {score.penalties.home} - {score.penalties.away}
            </span>
          )}
        </div>
      )}

      {/* Match Date (if scheduled) */}
      {!showScores && utcDate && (
        <div className="text-center mb-3">
          <p className="text-xs text-slate-500">
            {new Date(utcDate).toLocaleString('es-CO', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              hour: '2-digit',
              minute: '2-digit',
              timeZoneName: 'short',
            })}
          </p>
        </div>
      )}

      {/* Last Updated */}
      {lastUpdated && (
        <div className="text-center">
          <p className="text-[10px] text-slate-600">
            Actualizado: {lastUpdated.toLocaleTimeString('es-CO', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            })}
          </p>
        </div>
      )}
    </motion.div>
  )
}
