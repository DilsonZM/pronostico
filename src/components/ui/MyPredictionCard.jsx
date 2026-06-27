import { motion } from 'framer-motion'
import { formatShortDateTime, isPast } from '../../lib/date-utils'
import { MATCH_DEADLINE } from '../../lib/supabase'

/**
 * MyPredictionCard
 *
 * Hero card that shows the user's own prediction in large format.
 * Used both in MyPrediction and at the top of the Prediction screen.
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
  const editable = !isPast(MATCH_DEADLINE)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 220, damping: 22 }}
      className="w-full rounded-3xl bg-slate-900/75 border border-white/10 p-6 sm:p-8 text-center backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.45)]"
    >
      <p className="text-[10px] sm:text-xs font-semibold tracking-[0.22em] uppercase text-slate-400 mb-2">
        Tu pronóstico
      </p>

      <div className="flex items-center justify-between gap-2 sm:gap-3">
        <TeamSide flag="🇨🇴" code="COL" color="text-yellow-300" />
        <div className="flex items-baseline gap-2 sm:gap-3">
          <motion.span
            key={c}
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 18 }}
            className="font-display text-5xl sm:text-6xl font-black text-white tabular-nums leading-none"
          >
            {c}
          </motion.span>
          <span className="font-display text-2xl sm:text-3xl text-slate-600 font-light">–</span>
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
        <TeamSide flag="🇵🇹" code="POR" color="text-emerald-400" />
      </div>

      <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-slate-800/60 border border-white/8 px-3.5 py-1.5">
        <span aria-hidden>{resultEmoji}</span>
        <span className={`text-sm font-semibold ${resultColor}`}>{result}</span>
      </div>

      <div className="mt-5 pt-5 border-t border-white/8 grid grid-cols-2 gap-4 text-left">
        <Field label="Estado" value={editable ? '🟢 Abierto' : '🔒 Cerrado'} />
        <Field label="Editado" value={formatShortDateTime(prediction.updated_at || prediction.created_at)} />
      </div>
    </motion.div>
  )
}

function Field({ label, value }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">{label}</p>
      <p className="text-xs sm:text-sm text-white font-medium mt-0.5">{value}</p>
    </div>
  )
}

function TeamSide({ flag, code, color }) {
  return (
    <div className="flex flex-col items-center gap-1 min-w-[56px]">
      <span className="text-3xl sm:text-4xl leading-none">{flag}</span>
      <span className={`font-display text-[10px] sm:text-xs font-bold tracking-widest ${color}`}>{code}</span>
    </div>
  )
}
