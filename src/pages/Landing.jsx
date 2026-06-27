import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button, MatchHero, CountdownDisplay, NameEntryForm } from '../components/ui'
import { PageContainer } from '../components/layout'
import { MATCH_DEADLINE } from '../lib/supabase'

/**
 * Landing — floating island layout
 * Plenty of lateral breathing room. Each block is a visual island.
 */
export default function Landing() {
  const [showName, setShowName] = useState(false)

  return (
    <PageContainer py="py-10 sm:py-14" gap="gap-7">
      {/* Match hero island */}
      <div className="rounded-3xl bg-slate-900/55 border border-white/8 backdrop-blur-xl p-5 sm:p-6 shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
        <MatchHero kickoffISO={MATCH_DEADLINE.toISOString()} />
      </div>

      {/* Countdown island */}
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
    </PageContainer>
  )
}
