import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { getTimeLeft, isPast } from '../../lib/date-utils'

/**
 * CountdownDisplay — LED style hero
 * Big numeric countdown with a glowing border, used in the Landing.
 * Reads like a stadium scoreboard for an upcoming event.
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
      <div className="rounded-2xl border-2 border-red-500/40 bg-red-500/10 px-4 py-3 text-center">
        <span className="inline-flex items-center gap-2 text-sm font-semibold text-red-400">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          El partido ya comenzó
        </span>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="relative"
    >
      {/* LED panel */}
      <div
        className="relative rounded-2xl border-2 border-yellow-400/30 bg-slate-950/80 backdrop-blur-md p-4 sm:p-5 overflow-hidden"
        style={{
          boxShadow: '0 0 40px -8px rgba(252, 209, 22, 0.4), inset 0 0 24px -8px rgba(252, 209, 22, 0.2)',
        }}
      >
        {/* Scanline effect */}
        <div
          className="absolute inset-0 pointer-events-none opacity-30"
          style={{
            background: 'repeating-linear-gradient(0deg, transparent 0px, transparent 2px, rgba(252, 209, 22, 0.04) 2px, rgba(252, 209, 22, 0.04) 3px)',
          }}
        />

        {/* Header */}
        <div className="relative flex items-center justify-center gap-2 mb-3">
          <motion.span
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1.5 h-1.5 rounded-full bg-yellow-400"
          />
          <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-yellow-300/90">
            Arranca en
          </p>
          <motion.span
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1.5 h-1.5 rounded-full bg-yellow-400"
          />
        </div>

        {/* LED numbers */}
        <div className="relative flex items-center justify-center gap-1.5 sm:gap-2 font-mono">
          {time.days > 0 && (
            <>
              <LEDUnit value={time.days} label="D" small />
              <LEDSeparator />
            </>
          )}
          <LEDUnit value={time.hours} label="H" />
          <LEDSeparator />
          <LEDUnit value={time.minutes} label="M" />
          <LEDSeparator />
          <LEDUnit value={time.seconds} label="S" />
        </div>
      </div>
    </motion.div>
  )
}

function LEDUnit({ value, label, small = false }) {
  return (
    <div className="flex flex-col items-center">
      <div
        className={`relative ${small ? 'min-w-[44px]' : 'min-w-[56px]'} px-1 py-1 rounded-lg bg-slate-900/60 border border-yellow-400/20`}
        style={{
          boxShadow: 'inset 0 0 12px rgba(252, 209, 22, 0.15)',
        }}
      >
        <span
          className={`block ${small ? 'text-2xl' : 'text-4xl sm:text-5xl'} font-black tabular-nums text-center leading-none`}
          style={{
            color: '#FCD116',
            textShadow: '0 0 8px rgba(252, 209, 22, 0.7), 0 0 16px rgba(252, 209, 22, 0.4), 0 0 24px rgba(252, 209, 22, 0.2)',
            fontFamily: '"Courier New", monospace',
            letterSpacing: '0.05em',
          }}
        >
          {String(value).padStart(2, '0')}
        </span>
      </div>
      <span className="text-[9px] font-bold tracking-widest text-yellow-300/40 mt-1.5">
        {label}
      </span>
    </div>
  )
}

function LEDSeparator() {
  return (
    <span
      className="text-2xl sm:text-3xl font-black leading-none -mt-3"
      style={{
        color: '#FCD116',
        textShadow: '0 0 8px rgba(252, 209, 22, 0.7)',
        fontFamily: '"Courier New", monospace',
      }}
    >
      :
    </span>
  )
}

// Inline version used in the live status strip
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
