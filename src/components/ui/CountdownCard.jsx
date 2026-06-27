import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getTimeLeft, isPast } from '../../lib/date-utils'

/**
 * CountdownCard — premium inline
 * Single row: label · 3 numeric units · subtle separator.
 * Used inline in the live status strip.
 */
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
      <span className="inline-flex items-center gap-1.5 text-xs text-red-400">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
        Cerrado
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-slate-300">
      <span className="text-slate-500">{prefix}</span>
      <span className="font-display font-bold tabular-nums text-white tracking-wider">
        {time.days > 0 && (
          <>
            {String(time.days).padStart(2, '0')}
            <span className="text-slate-500 text-[10px] ml-0.5">d</span>
          </>
        )}
        {String(time.hours).padStart(2, '0')}
        <span className="text-slate-600">:</span>
        {String(time.minutes).padStart(2, '0')}
        <span className="text-slate-600">:</span>
        {String(time.seconds).padStart(2, '0')}
      </span>
    </span>
  )
}
