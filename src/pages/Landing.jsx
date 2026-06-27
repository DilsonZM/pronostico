import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button, MatchHero, CountdownDisplay, NameEntryForm } from '../components/ui'
import { MATCH_DEADLINE } from '../lib/supabase'

/**
 * Landing — premium hero
 * Big matchup · LED countdown · single CTA · clean name form.
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
      <div className="w-full max-w-[360px] mx-auto flex flex-col gap-7">
        <MatchHero kickoffISO={MATCH_DEADLINE.toISOString()} />

        <CountdownDisplay deadline={MATCH_DEADLINE.toISOString()} />

        {showName ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="rounded-3xl bg-slate-900/85 border border-white/10 backdrop-blur-xl p-6 sm:p-7 shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
          >
            <NameEntryForm onSuccess={() => {}} onBack={() => setShowName(false)} />
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
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
