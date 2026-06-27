import { motion } from 'framer-motion'
import { formatMatchDate, formatMatchTime } from '../../lib/date-utils'

/**
 * MatchHero
 *
 * The premium hero block for "Colombia vs Portugal".
 * Clean visual hierarchy: eyebrow (comp), title (match), meta (date+venue),
 * team flags row, single "VS" divider.
 */
export default function MatchHero({ kickoffISO, competition = 'Último partido de grupos · Mundial FIFA 2026', venue = 'Copa Mundial FIFA 2026' }) {
  const dateText = kickoffISO ? formatMatchDate(kickoffISO) : ''
  const timeText = kickoffISO ? formatMatchTime(kickoffISO) : ''

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="w-full"
    >
      {/* Eyebrow + date row */}
      <div className="text-center mb-4">
        <p className="text-[10px] sm:text-xs font-semibold tracking-[0.22em] uppercase text-slate-400 mb-2">
          {competition}
        </p>
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight leading-none">
          <span className="bg-gradient-to-r from-yellow-300 via-white to-emerald-400 bg-clip-text text-transparent">
            COLOMBIA
          </span>
          <span className="mx-3 text-slate-500 font-light">vs</span>
          <span className="bg-gradient-to-r from-emerald-400 via-white to-red-400 bg-clip-text text-transparent">
            PORTUGAL
          </span>
        </h1>
      </div>

      {/* Team flags */}
      <div className="flex items-center justify-center gap-4 sm:gap-6 my-5">
        <TeamFlag code="COL" flag="🇨🇴" name="Colombia" align="right" />
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border border-white/10 bg-slate-800/60 flex items-center justify-center">
            <span className="font-display text-xs font-bold text-slate-300 tracking-widest">VS</span>
          </div>
        </div>
        <TeamFlag code="POR" flag="🇵🇹" name="Portugal" align="left" />
      </div>

      {/* Meta: date · time · venue */}
      <div className="text-center space-y-1">
        <p className="text-sm sm:text-base font-semibold text-white capitalize">
          {dateText || 'Fecha por confirmar'}
        </p>
        <p className="text-xs sm:text-sm text-slate-400">
          {timeText ? `${timeText} (hora Colombia)` : 'Hora por confirmar'}
        </p>
        <p className="text-[11px] text-slate-500 uppercase tracking-widest pt-1">{venue}</p>
      </div>
    </motion.div>
  )
}

function TeamFlag({ flag, code, name, align }) {
  return (
    <div className={`flex flex-col items-center gap-1 ${align === 'right' ? 'text-right' : 'text-left'}`}>
      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-800/60 border border-white/10 flex items-center justify-center text-3xl sm:text-4xl">
        {flag}
      </div>
      <span className="font-display text-[10px] font-bold text-white tracking-widest">{code}</span>
      <span className="text-[10px] text-slate-500">{name}</span>
    </div>
  )
}
