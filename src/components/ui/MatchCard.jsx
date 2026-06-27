import { motion } from 'framer-motion'

export default function MatchCard({ compact = false }) {
  if (compact) {
    return (
      <div className="flex items-center justify-center gap-4">
        <TeamBadge
          code="COL"
          flag="🇨🇴"
          name="Colombia"
          color="colombia-yellow"
        />
        <div className="flex flex-col items-center">
          <span className="font-display text-lg text-dark-400 font-medium">VS</span>
        </div>
        <TeamBadge
          code="POR"
          flag="🇵🇹"
          name="Portugal"
          color="portugal-green"
        />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: 'rgba(30, 41, 59, 0.7)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
      }}
      className="rounded-3xl p-6 sm:p-8"
    >
      <div className="text-center mb-4">
        <span className="text-xs font-medium text-slate-400 uppercase tracking-widest">
          Último partido de grupos · Mundial FIFA 2026
        </span>
      </div>

      <div className="flex items-center justify-between gap-4">
        <TeamBadge
          code="COL"
          flag="🇨🇴"
          name="Colombia"
          color="colombia-yellow"
          large
        />
        <div className="flex flex-col items-center gap-1">
          <div className="font-display text-3xl sm:text-4xl font-bold text-white/20">
            VS
          </div>
          <span className="text-xs text-slate-400">27 Jun 2026</span>
        </div>
        <TeamBadge
          code="POR"
          flag="🇵🇹"
          name="Portugal"
          color="portugal-green"
          large
        />
      </div>
    </motion.div>
  )
}

function TeamBadge({ code, flag, name, color, large = false }) {
  const colorMap = {
    'colombia-yellow': 'from-colombia-yellow/20 to-colombia-blue/10 border-colombia-yellow/20',
    'portugal-green': 'from-portugal-green/20 to-portugal-red/10 border-portugal-green/20',
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`
        rounded-2xl bg-gradient-to-br ${colorMap[color]}
        border flex items-center justify-center
        ${large ? 'w-20 h-20 sm:w-24 sm:h-24' : 'w-12 h-12'}
      `}>
        <span className={large ? 'text-4xl sm:text-5xl' : 'text-2xl'}>{flag}</span>
      </div>
      <div className="text-center">
        <div className={`font-display font-bold text-white ${large ? 'text-lg sm:text-xl' : 'text-sm'}`}>
          {code}
        </div>
        {large && (
          <div className="text-xs text-dark-400">{name}</div>
        )}
      </div>
    </div>
  )
}
