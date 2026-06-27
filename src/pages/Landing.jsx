import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button, MatchHero, CountdownCard, NameEntryForm } from '../components/ui'
import { MATCH_DEADLINE } from '../lib/supabase'

/**
 * Landing — premium tight
 * Narrow column, big hero, single CTA.
 */
export default function Landing() {
  const [showName, setShowName] = useState(false)

  return (
    <div
      className="min-h-[100dvh] px-4 sm:px-6 py-10 sm:py-12"
      style={{
        background: 'radial-gradient(ellipse at top, #1e293b 0%, #0f172a 50%, #020617 100%)',
      }}
    >
      <div className="w-full max-w-[340px] mx-auto flex flex-col gap-7">
        <MatchHero kickoffISO={MATCH_DEADLINE.toISOString()} />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center"
        >
          <CountdownCard deadline={MATCH_DEADLINE.toISOString()} prefix="Cierra en" />
        </motion.div>

        {showName ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl p-6 sm:p-7 shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
          >
            <NameEntryForm onSuccess={() => {}} onBack={() => setShowName(false)} />
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-2.5"
          >
            <Button
              size="lg"
              fullWidth
              onClick={() => setShowName(true)}
              icon="🎯"
            >
              Hacer mi pronóstico
            </Button>
            <p className="text-center text-[11px] text-slate-500">
              Solo necesitas tu nombre · 1 minuto
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}
