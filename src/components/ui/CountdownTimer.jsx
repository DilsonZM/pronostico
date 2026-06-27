import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function CountdownTimer({ deadline, onExpired }) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(deadline))

  useEffect(() => {
    const timer = setInterval(() => {
      const left = calculateTimeLeft(deadline)
      setTimeLeft(left)
      if (left.total <= 0) {
        clearInterval(timer)
        onExpired?.()
      }
    }, 1000)
    return () => clearInterval(timer)
  }, [deadline, onExpired])

  if (timeLeft.total <= 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/20 border border-red-500/30">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-red-400 text-sm font-semibold tracking-wide uppercase">
            Pronósticos cerrados
          </span>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3">
      <TimeUnit value={timeLeft.days} label="Días" />
      <Separator />
      <TimeUnit value={timeLeft.hours} label="Hrs" />
      <Separator />
      <TimeUnit value={timeLeft.minutes} label="Min" />
      <Separator />
      <TimeUnit value={timeLeft.seconds} label="Seg" />
    </div>
  )
}

function TimeUnit({ value, label }) {
  return (
    <div className="flex flex-col items-center">
      <AnimatePresence mode="popLayout">
        <motion.span
          key={value}
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 10, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="font-display text-2xl sm:text-3xl font-bold text-white tabular-nums"
        >
          {String(value).padStart(2, '0')}
        </motion.span>
      </AnimatePresence>
      <span className="text-[10px] sm:text-xs text-dark-500 uppercase tracking-widest font-medium">
        {label}
      </span>
    </div>
  )
}

function Separator() {
  return (
    <span className="text-dark-600 font-bold text-xl sm:text-2xl self-start mt-1">:</span>
  )
}

function calculateTimeLeft(deadline) {
  const now = new Date().getTime()
  const end = new Date(deadline).getTime()
  const diff = end - now

  if (diff <= 0) {
    return { total: 0, days: 0, hours: 0, minutes: 0, seconds: 0 }
  }

  return {
    total: diff,
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
  }
}
