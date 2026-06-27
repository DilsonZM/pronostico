/**
 * MatchHero — clean, no glow, sans-serif team names
 */
export default function MatchHero({ kickoffISO, competition = 'Mundial FIFA 2026' }) {
  const dateText = kickoffISO ? formatDate(kickoffISO) : ''
  const timeText = kickoffISO ? formatTime(kickoffISO) : ''

  return (
    <div className="text-center">
      <p className="text-[10px] font-semibold tracking-[0.22em] uppercase text-slate-500 mb-2">
        {competition}
      </p>
      <div className="flex items-center justify-center gap-2 sm:gap-3">
        <span className="text-3xl sm:text-4xl" aria-hidden>🇨🇴</span>
        <span className="text-base sm:text-lg font-semibold text-white">Colombia</span>
        <span className="text-sm text-slate-500 font-medium">vs</span>
        <span className="text-base sm:text-lg font-semibold text-white">Portugal</span>
        <span className="text-3xl sm:text-4xl" aria-hidden>🇵🇹</span>
      </div>
      {(dateText || timeText) && (
        <p className="text-[11px] text-slate-500 mt-2">
          {dateText && <span className="capitalize">{dateText}</span>}
          {dateText && timeText && <span className="mx-1.5 text-slate-700">·</span>}
          {timeText && <span>{timeText} COL</span>}
        </p>
      )}
    </div>
  )
}

function formatDate(iso) {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  return new Intl.DateTimeFormat('es-CO', {
    timeZone: 'America/Bogota',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(d)
}

function formatTime(iso) {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  return new Intl.DateTimeFormat('es-CO', {
    timeZone: 'America/Bogota',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(d)
}
