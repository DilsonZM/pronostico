import { motion } from 'framer-motion'

/**
 * MyPredictionCard — minimal hero
 * Just the score, big. No extra metadata block.
 */
export default function MyPredictionCard({ prediction }) {
  if (!prediction) return null

  const c = prediction.colombia_score
  const p = prediction.portugal_score
  const result =
    c > p ? 'Victoria Colombia' : c < p ? 'Victoria Portugal' : 'Empate'
  const resultColor =
    result === 'Victoria Colombia' ? 'text-yellow-300'
      : result === 'Victoria Portugal' ? 'text-emerald-400'
        : 'text-slate-300'
  const resultEmoji =
    result === 'Victoria Colombia' ? '🇨🇴' : result === 'Victoria Portugal' ? '🇵🇹' : '🤝'

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 220, damping: 22 }}
      className="text-center py-2"
    >
      <div className="flex items-center justify-center gap-2 sm:gap-3">
        <span className="text-2xl" aria-hidden>🇨🇴</span>
        <div className="flex items-baseline gap-2">
          <motion.span
            key={c}
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 18 }}
            className="font-display text-5xl sm:text-6xl font-black text-white tabular-nums leading-none"
          >
            {c}
          </motion.span>
          <span className="font-display text-2xl text-slate-600 font-light">–</span>
          <motion.span
            key={p}
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 18 }}
            className="font-display text-5xl sm:text-6xl font-black text-white tabular-nums leading-none"
          >
            {p}
          </motion.span>
        </div>
        <span className="text-2xl" aria-hidden>🇵🇹</span>
      </div>

      <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold">
        <span aria-hidden>{resultEmoji}</span>
        <span className={resultColor}>{result}</span>
      </div>
    </motion.div>
  )
}
