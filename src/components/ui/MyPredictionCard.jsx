import { motion } from 'framer-motion'

/**
 * MyPredictionCard — premium hero with flags framing big score.
 * Optionally shows an edit icon button in the top-right corner.
 */
export default function MyPredictionCard({ prediction, onEdit }) {
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
    <div className="relative text-center py-3 w-full">
      {/* Edit icon button in top-right corner */}
      {onEdit && (
        <button
          onClick={onEdit}
          className="absolute top-1 right-1 w-8 h-8 rounded-lg text-slate-400 hover:text-yellow-300 hover:bg-yellow-500/10 flex items-center justify-center transition-colors"
          aria-label="Editar marcador"
          title="Editar marcador"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </button>
      )}

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
