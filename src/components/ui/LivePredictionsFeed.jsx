import { motion, AnimatePresence } from 'framer-motion'
import { formatRelative } from '../../lib/date-utils'
import SectionCard from './SectionCard'

/**
 * LivePredictionsFeed — clean cards, uniform score format, badges
 */
export default function LivePredictionsFeed({
  predictions = [],
  loading = false,
  newIds = new Set(),
  liveMatch = null,
  consensus = null,
  onDelete = null,
}) {
  const count = predictions.length

  return (
    <SectionCard
      title="Pronósticos en vivo"
      right={
        <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 bg-slate-800/70 border border-white/5 rounded-full px-2.5 py-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
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
            {deduplicate(predictions).map((p) => {
              const verdict = computeVerdict(p, liveMatch, consensus)
              return (
                <PredictionListItem
                  key={p.id}
                  prediction={p}
                  isNew={newIds.has(p.id)}
                  verdict={verdict}
                  onDelete={onDelete ? () => onDelete(p.id, p.profile?.display_name) : null}
                />
              )
            })}
          </AnimatePresence>
        </ul>
      )}
    </SectionCard>
  )
}

function deduplicate(arr) {
  const seen = new Set()
  const out = []
  for (const p of arr) {
    if (!p || !p.id) continue
    if (seen.has(p.id)) continue
    seen.add(p.id)
    out.push(p)
  }
  return out
}

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

  if (consensus && consensus.total > 0) {
    const c = prediction.colombia_score
    const p = prediction.portugal_score
    if (c === consensus.col && p === consensus.por) {
      return { tone: 'consensus', label: 'El más votado', icon: '⭐' }
    }
    if ((c > p) === (consensus.col > consensus.por) && (c !== p || consensus.col === consensus.por)) {
      return { tone: 'side', label: 'Va con la mayoría', icon: '👍' }
    }
    return { tone: 'outlier', label: 'Apuesta distinta', icon: '🎲' }
  }

  return null
}

function PredictionListItem({ prediction, isNew, verdict, onDelete }) {
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
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className={`
        relative flex items-center gap-3
        rounded-2xl border bg-slate-800/40 px-4 py-3
        ${isNew ? 'border-yellow-300/30' : 'border-white/5'}
      `}
    >
      <div
        className="w-9 h-9 shrink-0 rounded-full flex items-center justify-center text-xs font-bold text-slate-900"
        style={{ background: 'linear-gradient(135deg, #FCD116 0%, #006600 100%)' }}
        aria-hidden
      >
        {initials || '👤'}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white truncate">{name}</p>
        <p className="text-[10px] text-slate-500">{relative || 'hace un momento'}</p>
      </div>
      <div className="flex items-center gap-1.5">
        {verdict && <VerdictBadge verdict={verdict} />}
        <span className="font-mono text-base font-bold text-white tabular-nums whitespace-nowrap flex items-center gap-0.5">
          <span className="text-sm" aria-hidden>🇨🇴</span>
          <span>{prediction.colombia_score}</span>
          <span className="text-slate-500 mx-0.5">–</span>
          <span>{prediction.portugal_score}</span>
          <span className="text-sm" aria-hidden>🇵🇹</span>
        </span>
        {onDelete && (
          <button
            onClick={onDelete}
            className="ml-1 w-7 h-7 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 flex items-center justify-center transition-colors"
            title="Eliminar"
            aria-label="Eliminar pronóstico"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14z" />
            </svg>
          </button>
        )}
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
    side: 'bg-slate-700/40 border-white/10 text-slate-300',
    outlier: 'bg-slate-800/60 border-white/10 text-slate-400',
  }
  return (
    <span
      className={`
        hidden sm:inline-flex items-center gap-1
        text-[9px] font-bold uppercase tracking-wider
        px-1.5 py-0.5 rounded-full border whitespace-nowrap
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
        <li key={i} className="flex items-center gap-3 rounded-2xl border border-white/5 bg-slate-800/30 px-4 py-3">
          <div className="w-9 h-9 rounded-full bg-slate-700/50 animate-pulse" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3 w-24 rounded bg-slate-700/50 animate-pulse" />
            <div className="h-2 w-16 rounded bg-slate-700/30 animate-pulse" />
          </div>
          <div className="h-4 w-10 rounded bg-slate-700/50 animate-pulse" />
        </li>
      ))}
    </ul>
  )
}

function EmptyState() {
  return (
    <div className="py-6 text-center">
      <p className="text-sm font-medium text-white">Sé el primero en votar</p>
      <p className="text-xs text-slate-500 mt-1">Cuando alguien más vote, aparecerá aquí en vivo</p>
    </div>
  )
}
