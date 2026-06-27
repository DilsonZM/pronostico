import { motion } from 'framer-motion'
import { comparePredictionWithLive } from '../../lib/compareScores'
import SectionCard from './SectionCard'

/**
 * Winners — premium banner shown when the match is finished.
 *
 * - Compares every prediction against the final score
 * - Shows the winners in a "trophy podium" with animations
 * - Renders nothing if the match isn't finished yet
 */
export default function Winners({ predictions = [], match = null }) {
  if (!match || match.status !== 'FINISHED') return null
  if (!predictions.length) return null

  const live = match.score?.fullTime
  if (live?.home === null || live?.away === null) return null

  const evaluated = predictions
    .map((p) => ({ p, result: comparePredictionWithLive(p, match) }))
    .filter((x) => x.result)

  const exact = evaluated.filter((x) => x.result.exactMatch)
  const partial = evaluated.filter((x) => !x.result.exactMatch && x.result.resultMatch)
  const miss = evaluated.filter((x) => !x.result.exactMatch && !x.result.resultMatch)

  const total = evaluated.length
  const finalScore = `${live.home}-${live.away}`

  if (total === 0) return null

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-3xl border-2 border-yellow-400/40 bg-gradient-to-br from-yellow-500/10 via-slate-900/60 to-slate-900/60 backdrop-blur-xl p-5 sm:p-6 shadow-[0_0_40px_-8px_rgba(252,209,22,0.4)]"
    >
      {/* Header */}
      <header className="text-center mb-5">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 180, damping: 12, delay: 0.2 }}
          className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-2 text-3xl"
          style={{
            background: 'linear-gradient(135deg, #FCD116 0%, #FFA500 100%)',
            boxShadow: '0 0 24px rgba(252, 209, 22, 0.5)',
          }}
          aria-hidden
        >
          🏆
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="font-display text-xl sm:text-2xl font-extrabold tracking-tight leading-tight"
        >
          <span className="bg-gradient-to-r from-yellow-300 via-yellow-100 to-amber-300 bg-clip-text text-transparent">
            ¡Ganadores!
          </span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
          className="text-xs text-slate-400 mt-1"
        >
          Resultado final: <span className="font-mono font-bold text-white">{finalScore}</span> · {exact.length} {exact.length === 1 ? 'acertó' : 'acertaron'} el marcador
        </motion.p>
      </header>

      {/* Winners list */}
      {exact.length > 0 && (
        <div className="mb-4">
          <p className="text-[10px] uppercase tracking-widest text-yellow-300/80 font-bold mb-2 px-1">
            🎯 Marcador exacto
          </p>
          <div className="flex flex-wrap gap-2">
            {exact.map((x, i) => (
              <WinnerChip key={x.p.id} winner={x.p} delay={0.5 + i * 0.1} tone="exact" />
            ))}
          </div>
        </div>
      )}

      {partial.length > 0 && (
        <div className="mb-4">
          <p className="text-[10px] uppercase tracking-widest text-emerald-300/80 font-bold mb-2 px-1">
            ✅ Acertó el resultado
          </p>
          <div className="flex flex-wrap gap-2">
            {partial.map((x, i) => (
              <WinnerChip key={x.p.id} winner={x.p} delay={0.6 + i * 0.08} tone="result" />
            ))}
          </div>
        </div>
      )}

      {miss.length > 0 && (
        <div>
          <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2 px-1">
            ❌ No acertó
          </p>
          <div className="flex flex-wrap gap-2">
            {miss.map((x, i) => (
              <WinnerChip key={x.p.id} winner={x.p} delay={0.7 + i * 0.06} tone="miss" />
            ))}
          </div>
        </div>
      )}
    </motion.section>
  )
}

function WinnerChip({ winner, delay, tone }) {
  const name = winner.profile?.display_name || 'Anónimo'
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join('')

  const toneMap = {
    exact: 'border-yellow-400/40 bg-yellow-500/10 text-yellow-200',
    result: 'border-emerald-400/30 bg-emerald-500/10 text-emerald-200',
    miss: 'border-white/5 bg-slate-800/40 text-slate-400',
  }
  const scoreText = `${winner.colombia_score}–${winner.portugal_score}`

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.7, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 220, damping: 14, delay }}
      whileHover={{ y: -2 }}
      className={`
        inline-flex items-center gap-2
        rounded-full border px-3 py-1.5
        ${toneMap[tone] || toneMap.miss}
      `}
    >
      <div
        className="w-7 h-7 shrink-0 rounded-full flex items-center justify-center text-[11px] font-bold text-slate-900"
        style={{
          background: tone === 'exact'
            ? 'linear-gradient(135deg, #FCD116 0%, #FFA500 100%)'
            : tone === 'result'
              ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
              : 'linear-gradient(135deg, #475569 0%, #334155 100%)',
        }}
        aria-hidden
      >
        {tone === 'exact' ? '🏆' : initials || '👤'}
      </div>
      <div className="flex flex-col leading-none">
        <span className="text-sm font-semibold">{name}</span>
        <span className="text-[10px] opacity-80 font-mono mt-0.5 flex items-center gap-0.5">
          <span aria-hidden>🇨🇴</span>{winner.colombia_score}
          <span className="opacity-50">–</span>
          {winner.portugal_score}<span aria-hidden>🇵🇹</span>
        </span>
      </div>
    </motion.div>
  )
}
