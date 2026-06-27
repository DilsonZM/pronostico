import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button, MatchHero, CountdownCard, NameEntryForm, SectionCard } from '../components/ui'
import { MATCH_DEADLINE } from '../lib/supabase'

/**
 * Landing — minimal
 * One matchup line, one date line, one countdown, one CTA.
 */
export default function Landing() {
  const [showName, setShowName] = useState(false)

  return (
    <div
      className="min-h-[100dvh] px-4 sm:px-6 py-10 sm:py-14"
      style={{
        background: 'radial-gradient(ellipse at top, #1e293b 0%, #0f172a 50%, #020617 100%)',
      }}
    >
      <div className="w-full max-w-md mx-auto flex flex-col gap-8">
        <MatchHero kickoffISO={MATCH_DEADLINE.toISOString()} />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-center"
        >
          <CountdownCard deadline={MATCH_DEADLINE.toISOString()} prefix="Cierra en" />
        </motion.div>

        {showName ? (
          <SectionCard title="Ingresa tu nombre" delay={0.05}>
            <NameEntryForm onSuccess={() => {}} onBack={() => setShowName(false)} />
          </SectionCard>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-2"
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
