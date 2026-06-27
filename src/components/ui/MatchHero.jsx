import { motion } from 'framer-motion'
import { formatMatchDate, formatMatchTime } from '../../lib/date-utils'

/**
 * MatchHero — minimal
 * One line for the matchup, one line for date/time. No redundant badges.
 */
export default function MatchHero({ kickoffISO, competition = 'Mundial FIFA 2026' }) {
  const dateText = kickoffISO ? formatMatchDate(kickoffISO) : ''
  const timeText = kickoffISO ? formatMatchTime(kickoffISO) : ''

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="text-center"
    >
      <p className="text-[10px] font-semibold tracking-[0.22em] uppercase text-slate-500 mb-1.5">
        {competition}
      </p>
      <h1 className="font-display text-2xl sm:text-3xl font-extrabold leading-none">
        <span className="bg-gradient-to-r from-yellow-300 to-yellow-100 bg-clip-text text-transparent">Colombia</span>
        <span className="mx-2 text-slate-600 font-light text-lg align-middle">vs</span>
        <span className="bg-gradient-to-r from-emerald-300 to-emerald-100 bg-clip-text text-transparent">Portugal</span>
      </h1>
      {(dateText || timeText) && (
        <p className="text-xs text-slate-400 mt-2">
          {dateText && <span className="capitalize">{dateText}</span>}
          {dateText && timeText && <span className="mx-1.5 text-slate-600">·</span>}
          {timeText && <span>{timeText} <span className="text-slate-500">COL</span></span>}
        </p>
      )}
    </motion.div>
  )
}
