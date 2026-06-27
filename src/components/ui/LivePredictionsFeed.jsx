import { motion, AnimatePresence } from 'framer-motion'
import { formatRelative } from '../../lib/date-utils'
import SectionCard from './SectionCard'

/**
 * LivePredictionsFeed
 *
 * Each item shows a small badge indicating whether the prediction
 * is "Winning" / "Losing" / "Draw" compared to the live score
 * (if the match is in play or finished). If no live score is
 * available, the consensus is computed from the family of
 * predictions and items are labelled "Most picked" / "Outlier".
 */
export default function LivePredictionsFeed({
  predictions = [],
  loading = false,
  newIds = new Set(),
  liveMatch = null,
  consensus = null, // { col, por, total }
}) {
  const count = predictions.length

  return (
    <SectionCard
      title="Pronósticos en vivo"
      right={
        <span className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs font-semibold text-slate-400 bg-slate-800/60 border border-white/5 rounded-full px-2.5 py-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          {count}
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
            {predictions.map((p) => {
              const verdict = computeVerdict(p, liveMatch, consensus)
              return (
                <PredictionListItem
                  key={p.id}
                  prediction={p}
                  isNew={newIds.has(p.id)}
                  verdict={verdict}
                />
              )
            })}
          </AnimatePresence>
        </ul>
      )}
    </SectionCard>
  )
}

/**
 * Decide what badge to show next to a prediction.
 * 1. If the match has a live / final score, compare to that.
 * 2. Otherwise, compare to the family consensus (most popular score).
 */
function computeVerdict(prediction, liveMatch, consensus) {
  if (liveMatch && (liveMatch.status === 'IN_PLAY' || liveMatch.status === 'PAUSED' || liveMatch.status === 'FINISHED')) {
    const lc = liveMatch.score?.fullTime?.home ?? 0
    const lp = liveMatch.score?.fullTime?.away ?? 0
    const c = prediction.colombia_score
    const p = prediction.portugal_score
    if (c === lc && p === lp) {
      return { tone: 'exact', label: 'En vivo: exacto', icon: '🎯' }
    }
    const predResult = c > p ? 'colombia' : c < p ? 'portugal' : 'draw'
    const liveResult = lc > lp ? 'colombia' : lc < lp ? 'portugal' : 'draw'
    if (predResult === liveResult) {
      return { tone: 'result', label: 'Va ganando', icon: '✅' }
    }
    return { tone: 'miss', label: 'Va perdiendo', icon: '❌' }
  }

  // No live score → compare to consensus
  if (consensus && consensus.total > 0) {
    const c = prediction.colombia_score
    const p = prediction.portugal_score
    if (c === consensus.col && p === consensus.por) {
      return { tone: 'consensus', label: 'El más votado', icon: '⭐' }
    }
    // Same result as consensus
    if ((c > p) === (consensus.col > consensus.por) && (c !== p || consensus.col === consensus.por)) {
      return { tone: 'side', label: 'Va con la mayoría', icon: '👍' }
    }
    return { tone: 'outlier', label: 'Apuesta distinta', icon: '🎲' }
  }

  return null
}

function PredictionListItem({ prediction, isNew, verdict }) {
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
      initial={{ opacity: 0, y: 12, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: -10, scale: 0.96 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={`
        relative flex items-center justify-between gap-3
        rounded-2xl border bg-slate-900/55 px-3 sm:px-4 py-2.5
        transition-shadow duration-500
        ${isNew ? 'border-yellow-300/40 shadow-[0_0_0_3px_rgba(252,209,22,0.12)]' : 'border-white/5'}
      `}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
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
        {verdict && <VerdictBadge verdict={verdict} />}
      </div>
    </motion.li>
  )
}

function VerdictBadge({ verdict }) {
  const toneMap = {
    exact: 'bg-emerald-500/15 border-emerald-400/30 text-emerald-300',
    result: 'bg-emerald-500/10 border-emerald-400/20 text-emerald-300',
    miss: 'bg-red-500/10 border-red-400/20 text-red-300',
    consensus: 'bg-yellow-500/15 border-yellow-400/30 text-yellow-300',
    side: 'bg-slate-700/50 border-white/10 text-slate-300',
    outlier: 'bg-slate-800/60 border-white/10 text-slate-400',
  }
  return (
    <span
      className={`
        hidden sm:inline-flex items-center gap-1
        text-[9px] font-bold uppercase tracking-wider
        px-2 py-0.5 rounded-full border whitespace-nowrap
        ${toneMap[verdict.tone] || toneMap.side}
      `}
      title={verdict.label}
    >
      <span aria-hidden>{verdict.icon}</span>
      <span>{verdict.label}</span>
    </span>
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
