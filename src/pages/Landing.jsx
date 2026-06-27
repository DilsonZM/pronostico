import { motion } from 'framer-motion'
import { Button, MatchHero, CountdownCard, NameEntryForm } from '../components/ui'
import { useState } from 'react'
import SectionCard from '../components/ui/SectionCard'
import { MATCH_DEADLINE } from '../lib/supabase'

export default function Landing() {
  const [view, setView] = useState('intro') // 'intro' | 'name'

  if (view === 'name') {
    return (
      <PageShell>
        <MatchHero kickoffISO={MATCH_DEADLINE.toISOString()} />

        <SectionCard
          eyebrow="Paso 1 de 1"
          title="Ingresa tu nombre"
          delay={0.1}
        >
          <NameEntryForm onSuccess={() => {}} onBack={() => setView('intro')} />
        </SectionCard>
      </PageShell>
    )
  }

  return (
    <PageShell>
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 180, damping: 18 }}
        className="flex items-center justify-center"
      >
        <div className="w-20 h-20 rounded-3xl bg-slate-900/70 border border-white/10 flex items-center justify-center text-5xl">
          ⚽
        </div>
      </motion.div>

      <MatchHero kickoffISO={MATCH_DEADLINE.toISOString()} />

      <CountdownCard deadline={MATCH_DEADLINE.toISOString()} />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="w-full space-y-3"
      >
        <Button
          size="lg"
          fullWidth
          onClick={() => setView('name')}
          icon="🎯"
        >
          Hacer mi pronóstico
        </Button>
        <p className="text-center text-[11px] text-slate-500">
          Solo necesitas tu nombre · Gratis · 1 minuto
        </p>
      </motion.div>
    </PageShell>
  )
}

function PageShell({ children }) {
  return (
    <div
      className="min-h-[100dvh] flex flex-col items-center px-4 sm:px-6 py-8 sm:py-12"
      style={{
        background: 'radial-gradient(ellipse at top, #1e293b 0%, #0f172a 50%, #020617 100%)',
      }}
    >
      <div className="w-full max-w-md flex flex-col items-stretch gap-6 sm:gap-7">
        {children}
      </div>
    </div>
  )
}
