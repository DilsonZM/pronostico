import { motion } from 'framer-motion'
import { formatMatchDate, formatMatchTime } from '../../lib/date-utils'

/**
 * MatchHero — premium with flags (fire + star), giant VS, color team names
 */
export default function MatchHero({ kickoffISO, competition = 'Mundial FIFA 2026' }) {
  const dateText = kickoffISO ? formatMatchDate(kickoffISO) : ''
  const timeText = kickoffISO ? formatMatchTime(kickoffISO) : ''

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="text-center"
    >
      <p className="text-[10px] font-semibold tracking-[0.22em] uppercase text-slate-500 mb-4">
        {competition}
      </p>

      {/* Big flags with team glow */}
      <div className="flex items-center justify-center gap-3 mb-4">
        {/* Colombia with fire */}
        <motion.div
          initial={{ x: -20, opacity: 0, scale: 0.6 }}
          animate={{ x: 0, opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 220, damping: 14, delay: 0.1 }}
          className="relative"
        >
          <span
            className="text-5xl sm:text-6xl leading-none block"
            style={{
              filter: 'drop-shadow(0 0 12px rgba(252, 209, 22, 0.5))',
            }}
            aria-hidden
          >
            🇨🇴
          </span>
          <motion.span
            initial={{ scale: 0, rotate: 30 }}
            animate={{ scale: [0, 1.4, 1], rotate: [30, -10, 0] }}
            transition={{ duration: 0.6, delay: 0.4, times: [0, 0.6, 1] }}
            className="absolute -bottom-1 -right-1.5 text-xl leading-none"
            aria-hidden
          >
            🔥
          </motion.span>
        </motion.div>

        {/* Giant VS */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 280, damping: 12, delay: 0.25 }}
          className="flex flex-col items-center px-1.5"
        >
          <span className="font-mono text-2xl sm:text-3xl font-black tracking-tighter text-slate-300 leading-none">
            VS
          </span>
        </motion.div>

        {/* Portugal with star */}
        <motion.div
          initial={{ x: 20, opacity: 0, scale: 0.6 }}
          animate={{ x: 0, opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 220, damping: 14, delay: 0.1 }}
          className="relative"
        >
          <span
            className="text-5xl sm:text-6xl leading-none block"
            style={{
              filter: 'drop-shadow(0 0 12px rgba(0, 102, 0, 0.5))',
            }}
            aria-hidden
          >
            🇵🇹
          </span>
          <motion.span
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: [0, 1.4, 1], rotate: [-30, 10, 0] }}
            transition={{ duration: 0.6, delay: 0.4, times: [0, 0.6, 1] }}
            className="absolute -bottom-1 -left-1.5 text-xl leading-none"
            aria-hidden
          >
            ⭐
          </motion.span>
        </motion.div>
      </div>

      {/* Team names with colors */}
      <div className="flex items-center justify-center gap-2 sm:gap-3">
        <motion.h1
          initial={{ x: -15, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-lg sm:text-xl font-extrabold tracking-tight"
          style={{
            background: 'linear-gradient(135deg, #FCD116 0%, #ffffff 50%, #003893 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Colombia
        </motion.h1>
        <span className="text-slate-600 text-xs">·</span>
        <motion.h1
          initial={{ x: 15, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-lg sm:text-xl font-extrabold tracking-tight"
          style={{
            background: 'linear-gradient(135deg, #006600 0%, #ffffff 50%, #FF0000 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Portugal
        </motion.h1>
      </div>

      {(dateText || timeText) && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-[11px] text-slate-500 mt-2"
        >
          {dateText && <span className="capitalize">{dateText}</span>}
          {dateText && timeText && <span className="mx-1.5 text-slate-700">·</span>}
          {timeText && <span>{timeText} COL</span>}
        </motion.p>
      )}
    </motion.div>
  )
}
