import { motion } from 'framer-motion'
import { formatMatchDate, formatMatchTime } from '../../lib/date-utils'

/**
 * MatchHero — premium compact
 * Single row: flag · team name · vs · flag · team name.
 * Date/time on a second line. No redundant badges.
 */
export default function MatchHero({ kickoffISO, competition = 'Mundial FIFA 2026' }) {
  const dateText = kickoffISO ? formatMatchDate(kickoffISO) : ''
  const timeText = kickoffISO ? formatMatchTime(kickoffISO) : ''

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className="text-center"
    >
      <p className="text-[10px] font-semibold tracking-[0.22em] uppercase text-slate-500 mb-3">
        {competition}
      </p>

      <div className="flex items-center justify-center gap-3 sm:gap-5">
        <TeamSide flag="🇨🇴" code="COL" align="right" />
        <motion.span
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15, type: 'spring', stiffness: 220, damping: 16 }}
          className="font-display text-xs font-bold tracking-[0.3em] text-slate-500"
        >
          VS
        </motion.span>
        <TeamSide flag="🇵🇹" code="POR" align="left" />
      </div>

      {(dateText || timeText) && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="text-xs text-slate-400 mt-3"
        >
          {dateText && <span className="capitalize">{dateText}</span>}
          {dateText && timeText && <span className="mx-1.5 text-slate-600">·</span>}
          {timeText && <span>{timeText} <span className="text-slate-500">COL</span></span>}
        </motion.p>
      )}
    </motion.div>
  )
}

function TeamSide({ flag, code, align }) {
  return (
    <div className={`flex items-center gap-2 ${align === 'right' ? 'flex-row-reverse' : ''}`}>
      <motion.span
        initial={{ scale: 0, rotate: align === 'right' ? -45 : 45 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 240, damping: 16, delay: 0.1 }}
        className="text-3xl sm:text-4xl leading-none"
        aria-hidden
      >
        {flag}
      </motion.span>
      <span className="font-display text-xs sm:text-sm font-bold text-white tracking-widest">
        {code}
      </span>
    </div>
  )
}
