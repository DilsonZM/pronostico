import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button, MatchHero, CountdownDisplay, NameEntryForm } from '../components/ui'
import { PageContainer } from '../components/layout'
import { MATCH_DEADLINE } from '../lib/supabase'

export default function Landing() {
  const [showName, setShowName] = useState(false)

  return (
    <PageContainer py="py-12 sm:py-16" gap="gap-8">
      <div className="text-center">
        <p className="text-[10px] font-semibold tracking-[0.22em] uppercase text-slate-500 mb-2">
          Mundial FIFA 2026
        </p>
        <p className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Colombia <span className="text-slate-500 font-light">vs</span> Portugal
        </p>
        <p className="text-[11px] text-slate-500 mt-2">
          Sábado, 27 de junio · 6:30 PM COL
        </p>
      </div>

      <CountdownDisplay deadline={MATCH_DEADLINE.toISOString()} />

      {showName ? (
        <div className="bg-slate-900/85 border border-white/10 rounded-2xl p-6">
          <div className="text-center mb-5">
            <h2 className="text-lg font-semibold text-white">¿Cómo te llamas?</h2>
            <p className="text-xs text-slate-400 mt-1">
              Solo necesitamos tu nombre para registrar tu pronóstico
            </p>
          </div>
          <NameEntryForm onSuccess={() => {}} onBack={() => setShowName(false)} />
        </div>
      ) : (
        <div className="space-y-2">
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
        </div>
      )}
    </PageContainer>
  )
}
