import { motion } from 'framer-motion'
import { Button, MatchCard, CountdownTimer } from '../components/ui'
import { MATCH_DEADLINE } from '../lib/supabase'

export default function Landing({ onEnter }) {
  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center px-4 py-8 bg-pitch-pattern">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -left-20 w-60 h-60 rounded-full bg-colombia-yellow/5 blur-3xl" />
        <div className="absolute bottom-20 -right-20 w-60 h-60 rounded-full bg-portugal-green/5 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-white/[0.02] blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md flex flex-col items-center gap-8">
        {/* Logo / Badge */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.2 }}
          className="relative"
        >
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-colombia-yellow/20 to-portugal-green/20 border border-white/10 flex items-center justify-center animate-pulse-ring">
            <span className="text-5xl">⚽</span>
          </div>
          <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-emerald-500 border-4 border-dark-900 flex items-center justify-center">
            <span className="text-xs">✓</span>
          </div>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center"
        >
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-gradient-match tracking-tight">
            COLOMBIA
          </h1>
          <div className="flex items-center justify-center gap-4 my-2">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/20" />
            <span className="font-display text-xl text-dark-400 font-medium">VS</span>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/20" />
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-gradient-match tracking-tight">
            PORTUGAL
          </h1>
        </motion.div>

        {/* Subtitle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center space-y-2"
        >
          <p className="text-dark-300 text-lg font-medium">
            Último partido de grupos · Mundial FIFA 2026
          </p>
          <p className="text-dark-500 text-sm">
            27 de Junio · 6:30 PM <span className="text-dark-600">(Hora Colombia 🇨🇴)</span>
          </p>
        </motion.div>

        {/* Countdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="w-full glass rounded-2xl p-5"
        >
          <p className="text-center text-xs text-dark-500 uppercase tracking-widest mb-4 font-medium">
            Tiempo restante para pronosticar
          </p>
          <CountdownTimer deadline={MATCH_DEADLINE} />
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="w-full space-y-3"
        >
          <Button
            size="lg"
            fullWidth
            onClick={onEnter}
            icon="🎯"
          >
            Hacer mi pronóstico
          </Button>
          <p className="text-center text-xs text-dark-600">
            Solo necesitas tu nombre · Gratis · 1 minuto
          </p>
        </motion.div>

        {/* Stats teaser */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="flex items-center justify-center gap-6 text-center"
        >
          <div>
            <div className="text-lg font-bold text-white">⚡</div>
            <div className="text-[10px] text-dark-500 uppercase tracking-wider">Rápido</div>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div>
            <div className="text-lg font-bold text-white">🔒</div>
            <div className="text-[10px] text-dark-500 uppercase tracking-wider">Seguro</div>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div>
            <div className="text-lg font-bold text-white">🌍</div>
            <div className="text-[10px] text-dark-500 uppercase tracking-wider">Online</div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
