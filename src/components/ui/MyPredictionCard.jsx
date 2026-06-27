import { motion } from 'framer-motion'

/**
 * MyPredictionCard — premium hero
 * Big score with flag framing, animated result badge, subtle.
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
  const resultBg =
    result === 'Victoria Colombia' ? 'bg-yellow-500/10 border-yellow-400/20'
      : result === 'Victoria Portugal' ? 'bg-emerald-500/10 border-emerald-400/20'
        : 'bg-slate-700/30 border-white/5'
  const resultEmoji =
    result === 'Victoria Colombia' ? '🇨🇴' : result === 'Victoria Portugal' ? '🇵🇹' : '🤝'

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 220, damping: 22 }}
      className="text-center py-3"
    >
      <div className="flex items-center justify-center gap-3 sm:gap-5">
        <motion.span
          initial={{ x: -16, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-3xl sm:text-4xl"
          aria-hidden
        >
          🇨🇴
        </motion.span>
        <div className="flex items-baseline gap-2 sm:gap-3">
          <motion.span
            key={c}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 320, damping: 18 }}
            className="font-display text-5xl sm:text-6xl font-black text-white tabular-nums leading-none"
          >
            {c}
          </motion.span>
          <span className="font-display text-2xl text-slate-600 font-light">–</span>
          <motion.span
            key={p}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 320, damping: 18 }}
            className="font-display text-5xl sm:text-6xl font-black text-white tabular-nums leading-none"
          >
            {p}
          </motion.span>
        </div>
        <motion.span
          initial={{ x: 16, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-3xl sm:text-4xl"
          aria-hidden
        >
          🇵🇹
        </motion.span>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className={`mt-5 inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border ${resultBg}`}
      >
        <span aria-hidden>{resultEmoji}</span>
        <span className={resultColor}>{result}</span>
      </motion.div>
    </motion.div>
  )
}
