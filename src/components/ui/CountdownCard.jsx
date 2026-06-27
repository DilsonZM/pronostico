import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getTimeLeft, isPast } from '../../lib/date-utils'

/**
 * CountdownCard
 *
 * Premium countdown that displays the time left until a deadline.
 * Single, calm visual unit. Used in Landing + Prediction.
 */
export default function CountdownCard({ deadline, label = 'Cierre de pronósticos' }) {
  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(deadline))
  const [past, setPast] = useState(() => isPast(deadline))

  useEffect(() => {
    setTimeLeft(getTimeLeft(deadline))
    setPast(isPast(deadline))
    const t = setInterval(() => {
      setTimeLeft(getTimeLeft(deadline))
      setPast(isPast(deadline))
    }, 1000)
    return () => clearInterval(t)
  }, [deadline])

  if (past) {
    return (
      <div className="w-full rounded-2xl bg-slate-900/70 border border-red-500/20 px-5 py-4 text-center">
        <span className="inline-flex items-center gap-2 text-sm font-semibold text-red-400">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          Pronósticos cerrados
        </span>
      </div>
    )
  }

  return (
    <div className="w-full rounded-2xl bg-slate-900/60 border border-white/8 px-5 py-4">
      <p className="text-center text-[10px] sm:text-xs font-semibold tracking-[0.22em] uppercase text-slate-400 mb-3">
        {label}
      </p>
      <div className="flex items-center justify-center gap-2 sm:gap-3">
        <TimeUnit value={timeLeft.days} label="Días" />
        <Separator />
        <TimeUnit value={timeLeft.hours} label="Hrs" />
        <Separator />
        <TimeUnit value={timeLeft.minutes} label="Min" />
        <Separator />
        <TimeUnit value={timeLeft.seconds} label="Seg" />
      </div>
    </div>
  )
}

function TimeUnit({ value, label }) {
  return (
    <div className="flex flex-col items-center min-w-[44px] sm:min-w-[56px]">
      <div className="relative h-8 sm:h-9 w-full flex items-center justify-center overflow-hidden">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={value}
            initial={{ y: -16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 16, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="font-display text-2xl sm:text-3xl font-bold text-white tabular-nums"
          >
            {String(value).padStart(2, '0')}
          </motion.span>
        </AnimatePresence>
      </div>
      <span className="text-[9px] sm:text-[10px] text-slate-500 uppercase tracking-widest font-medium mt-1">
        {label}
      </span>
    </div>
  )
}

function Separator() {
  return <span className="text-slate-600 font-light text-xl sm:text-2xl leading-none">:</span>
}
