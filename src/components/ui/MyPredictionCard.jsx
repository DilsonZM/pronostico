import { motion } from 'framer-motion'

/**
 * MyPredictionCard — premium hero with flags framing big score
 * Numbers fit inside the container (text-5xl max, with overflow control)
 */
export default function MyPredictionCard({ prediction }) {
  if (!prediction) return null

  const c = prediction.colombia_score
  const p = prediction.portugal_score
  const result =
    c > p ? 'Victoria Colombia' : c < p ? 'Victoria Portugal' : 'Empate'
  const resultColor =
    result === 'Victoria Colombia' ? 'text-yellow-300'
      : result === 'Victoria Portugal' ? 'text-emerald-300'
        : 'text-slate-300'
  const resultEmoji =
    result === 'Victoria Colombia' ? '🇨🇴' : result === 'Victoria Portugal' ? '🇵🇹' : '🤝'

  return (
    <div className="text-center py-3 w-full">
      <div className="flex items-center justify-center gap-2 sm:gap-3 w-full overflow-hidden">
        <div className="flex flex-col items-center gap-1 shrink-0 w-12">
          <span className="text-2xl" aria-hidden>🇨🇴</span>
          <span className="text-[10px] font-semibold tracking-widest text-slate-400">COL</span>
        </div>
        <div className="flex items-baseline gap-1.5 sm:gap-2 shrink-0">
          <motion.span
            key={c}
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 18 }}
            className="font-mono text-5xl sm:text-6xl font-black text-white tabular-nums leading-none"
          >
            {c}
          </motion.span>
          <span className="font-mono text-2xl sm:text-3xl text-slate-600 font-light">–</span>
          <motion.span
            key={p}
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 18 }}
            className="font-mono text-5xl sm:text-6xl font-black text-white tabular-nums leading-none"
          >
            {p}
          </motion.span>
        </div>
        <div className="flex flex-col items-center gap-1 shrink-0 w-12">
          <span className="text-2xl" aria-hidden>🇵🇹</span>
          <span className="text-[10px] font-semibold tracking-widest text-slate-400">POR</span>
        </div>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold"
      >
        <span aria-hidden>{resultEmoji}</span>
        <span className={resultColor}>{result}</span>
      </motion.div>
    </div>
  )
}
