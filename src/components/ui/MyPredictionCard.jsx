/**
 * MyPredictionCard — clean, sans-serif, big score, generous padding
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

  return (
    <div className="text-center py-4">
      <div className="flex items-center justify-center gap-3 sm:gap-4">
        <div className="flex flex-col items-center gap-1.5 min-w-[60px]">
          <span className="text-2xl sm:text-3xl" aria-hidden>🇨🇴</span>
          <span className="text-[10px] font-semibold tracking-widest text-slate-400">COL</span>
        </div>
        <div className="flex items-baseline gap-2 sm:gap-3">
          <span className="font-mono text-6xl sm:text-7xl font-black text-white tabular-nums leading-none">
            {c}
          </span>
          <span className="font-mono text-3xl sm:text-4xl text-slate-600 font-light">–</span>
          <span className="font-mono text-6xl sm:text-7xl font-black text-white tabular-nums leading-none">
            {p}
          </span>
        </div>
        <div className="flex flex-col items-center gap-1.5 min-w-[60px]">
          <span className="text-2xl sm:text-3xl" aria-hidden>🇵🇹</span>
          <span className="text-[10px] font-semibold tracking-widest text-slate-400">POR</span>
        </div>
      </div>
      <p className={`mt-4 text-sm font-semibold ${resultColor}`}>{result}</p>
    </div>
  )
}
