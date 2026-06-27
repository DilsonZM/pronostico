import { motion, AnimatePresence } from 'framer-motion'
import { formatRelative } from '../../lib/date-utils'
import SectionCard from './SectionCard'

/**
 * LivePredictionsFeed
 *
 * Realtime list of predictions from other users.
 * - Animated entry when a new prediction arrives (highlight ring)
 * - Sorted by most recent first
 * - Empty state when nobody has voted yet
 * - Loading state
 */
export default function LivePredictionsFeed({ predictions = [], loading = false, newIds = new Set() }) {
  const count = predictions.length

  return (
    <SectionCard
      eyebrow="En vivo"
      title="Pronósticos de la familia"
      right={
        <span className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs font-semibold text-slate-400 bg-slate-800/60 border border-white/8 rounded-full px-2.5 py-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          {count} {count === 1 ? 'voto' : 'votos'}
        </span>
      }
    >
      {loading && count === 0 ? (
        <FeedSkeleton />
      ) : count === 0 ? (
        <EmptyState />
      ) : (
        <ul className="space-y-2.5">
          <AnimatePresence initial={false}>
            {predictions.map((p) => (
              <PredictionListItem
                key={p.id}
                prediction={p}
                isNew={newIds.has(p.id)}
              />
            ))}
          </AnimatePresence>
        </ul>
      )}
    </SectionCard>
  )
}

function PredictionListItem({ prediction, isNew }) {
  const name = prediction.profile?.display_name || 'Anónimo'
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join('')
  const relative = formatRelative(prediction.updated_at || prediction.created_at)

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: -8 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`
        relative flex items-center justify-between
        rounded-2xl border bg-slate-900/55 px-3 sm:px-4 py-2.5
        ${isNew
          ? 'border-yellow-300/40 shadow-[0_0_0_3px_rgba(252,209,22,0.12)]'
          : 'border-white/8'
        }
      `}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div
          className="w-9 h-9 shrink-0 rounded-full flex items-center justify-center font-display text-[11px] font-bold text-slate-900"
          style={{ background: 'linear-gradient(135deg, #FCD116 0%, #006600 100%)' }}
          aria-hidden="true"
        >
          {initials || '👤'}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white truncate max-w-[140px]">{name}</p>
          <p className="text-[10px] text-slate-500">{relative || 'hace un momento'}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <span className="text-xl sm:text-2xl font-display font-black tabular-nums text-white">
          {prediction.colombia_score}
          <span className="text-slate-500 mx-1 font-light">–</span>
          {prediction.portugal_score}
        </span>
      </div>
    </motion.li>
  )
}

function FeedSkeleton() {
  return (
    <ul className="space-y-2.5">
      {[0, 1, 2].map((i) => (
        <li
          key={i}
          className="flex items-center gap-3 rounded-2xl border border-white/5 bg-slate-900/40 px-3 py-2.5"
        >
          <div className="w-9 h-9 rounded-full bg-slate-800/80 animate-pulse" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3 w-24 rounded bg-slate-800/80 animate-pulse" />
            <div className="h-2 w-16 rounded bg-slate-800/60 animate-pulse" />
          </div>
          <div className="h-5 w-12 rounded bg-slate-800/80 animate-pulse" />
        </li>
      ))}
    </ul>
  )
}

function EmptyState() {
  return (
    <div className="py-6 text-center">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-800/60 border border-white/8 mb-3">
        <span className="text-2xl">⚽</span>
      </div>
      <p className="text-sm font-semibold text-white">Sé el primero en votar</p>
      <p className="text-xs text-slate-500 mt-1 max-w-[260px] mx-auto">
        Cuando alguien más vote, su pronóstico aparecerá aquí en tiempo real
      </p>
    </div>
  )
}
