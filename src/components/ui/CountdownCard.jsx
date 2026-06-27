import { useEffect, useState } from 'react'
import { getTimeLeft, isPast } from '../../lib/date-utils'

/**
 * CountdownCard — inline slim version
 */
export function CountdownDisplay({ deadline }) {
  const [time, setTime] = useState(() => getTimeLeft(deadline))
  const [past, setPast] = useState(() => isPast(deadline))

  useEffect(() => {
    const t = setInterval(() => {
      setTime(getTimeLeft(deadline))
      setPast(isPast(deadline))
    }, 1000)
    return () => clearInterval(t)
  }, [deadline])

  if (past) {
    return (
      <div className="rounded-2xl bg-slate-900/70 border border-slate-700/50 px-4 py-3 text-center text-sm font-medium text-slate-300">
        El partido ya comenzó
      </div>
    )
  }

  return (
    <div className="rounded-2xl bg-slate-900/70 border border-white/8 px-4 py-3">
      <div className="flex items-center justify-center gap-1.5">
        <span className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-semibold">Cierra en</span>
        <span className="font-mono font-bold text-white tabular-nums tracking-wider text-sm ml-1">
          {String(time.hours).padStart(2, '0')}
          <span className="text-slate-600">:</span>
          {String(time.minutes).padStart(2, '0')}
          <span className="text-slate-600">:</span>
          {String(time.seconds).padStart(2, '0')}
        </span>
      </div>
    </div>
  )
}

export default function CountdownCard({ deadline, prefix = 'Cierra en' }) {
  const [time, setTime] = useState(() => getTimeLeft(deadline))
  const [past, setPast] = useState(() => isPast(deadline))

  useEffect(() => {
    const t = setInterval(() => {
      setTime(getTimeLeft(deadline))
      setPast(isPast(deadline))
    }, 1000)
    return () => clearInterval(t)
  }, [deadline])

  if (past) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
        Cerrado
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-slate-300">
      <span className="text-slate-500">{prefix}</span>
      <span className="font-mono font-bold tabular-nums text-white tracking-wider">
        {String(time.hours).padStart(2, '0')}
        <span className="text-slate-600">:</span>
        {String(time.minutes).padStart(2, '0')}
        <span className="text-slate-600">:</span>
        {String(time.seconds).padStart(2, '0')}
      </span>
    </span>
  )
}
