import { motion } from 'framer-motion'
import { formatMatchDate, formatMatchTime } from '../../lib/date-utils'

/**
 * MatchHero — premium bold
 * Big flag with fire emoji for Colombia, giant VS, colored team names.
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

      {/* Big flag with fire */}
      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 14, delay: 0.05 }}
        className="inline-flex items-center justify-center gap-1.5 mb-4"
      >
        <span
          className="text-6xl sm:text-7xl leading-none"
          style={{ filter: 'drop-shadow(0 0 16px rgba(252, 209, 22, 0.4))' }}
          aria-hidden
        >
          🇨🇴
        </span>
        <motion.span
          initial={{ scale: 0, rotate: 20 }}
          animate={{
            scale: [0, 1.3, 1],
            rotate: [20, -10, 0],
          }}
          transition={{ duration: 0.6, delay: 0.3, times: [0, 0.6, 1] }}
          className="text-3xl sm:text-4xl leading-none -ml-2"
          aria-hidden
        >
          🔥
        </motion.span>
      </motion.div>

      {/* Team names with colors + giant VS */}
      <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3">
        <motion.h1
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight"
          style={{
            background: 'linear-gradient(135deg, #FCD116 0%, #ffffff 50%, #003893 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Colombia
        </motion.h1>

        <motion.span
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 250, damping: 14, delay: 0.25 }}
          className="font-display text-3xl sm:text-4xl font-black tracking-tighter text-slate-400"
        >
          VS
        </motion.span>

        <motion.h1
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight"
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

      {/* Date and time */}
      {(dateText || timeText) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-xs text-slate-400"
        >
          {dateText && <span className="capitalize">{dateText}</span>}
          {dateText && timeText && <span className="mx-1.5 text-slate-600">·</span>}
          {timeText && <span>{timeText} <span className="text-slate-500">COL</span></span>}
        </motion.div>
      )}
    </motion.div>
  )
}
