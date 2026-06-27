import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * BotSuggestion — non-intrusive suggestion banner from the AI bot
 *
 * Appears when the user opens their "Ver detalles" view.
 * Asks Predicto for a single, brief suggestion. If the bot has
 * something to recommend, it shows the suggestion card. Otherwise
 * the banner stays dismissed.
 */
export default function BotSuggestion({ prediction, familyPredictions = [], match = null }) {
  const [loading, setLoading] = useState(false)
  const [suggestion, setSuggestion] = useState(null)
  const [dismissed, setDismissed] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!prediction || dismissed) return
    let cancelled = false

    async function load() {
      setLoading(true)
      setError('')
      try {
        const res = await fetch('/api/analisis', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [
              {
                role: 'user',
                content: 'Tengo un pronóstico guardado. Dame una sugerencia MUY breve (máx 35 palabras): ¿debería mantenerlo o ajustarlo? No me des el marcador otra vez, solo un consejo directo.',
              },
            ],
            context: {
              family_predictions: familyPredictions.map((p) => ({
                display_name: p.profile?.display_name || 'Anónimo',
                colombia: p.colombia_score,
                portugal: p.portugal_score,
              })),
              match: match || { home: 'Colombia', away: 'Portugal', status: 'TIMED' },
            },
          }),
        })
        const data = await res.json()
        if (cancelled) return
        if (!res.ok) {
          setError(data?.message || 'No pude consultar al bot')
          return
        }
        setSuggestion(data.reply || '')
      } catch (err) {
        if (!cancelled) setError(err?.message || 'Error de red')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [prediction, dismissed])

  if (dismissed) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.35 }}
        className="rounded-2xl border border-yellow-400/20 bg-yellow-500/5 px-4 py-3"
      >
        <div className="flex items-start gap-2.5">
          <div
            className="w-7 h-7 shrink-0 rounded-full flex items-center justify-center text-sm"
            style={{ background: 'linear-gradient(135deg, #006600 0%, #FCD116 100%)' }}
            aria-hidden
          >
            🤖
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <p className="text-[10px] uppercase tracking-widest text-yellow-300/80 font-bold">
                Sugerencia de Predicto
              </p>
              <button
                onClick={() => setDismissed(true)}
                className="text-slate-500 hover:text-white transition-colors"
                aria-label="Cerrar sugerencia"
                title="Cerrar"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            {loading && (
              <p className="text-xs text-slate-400 flex items-center gap-1.5">
                <span className="inline-block w-2 h-2 rounded-full bg-yellow-300/60 animate-pulse" />
                Analizando tu pronóstico…
              </p>
            )}
            {error && !loading && (
              <p className="text-xs text-slate-500">{error}</p>
            )}
            {suggestion && !loading && (
              <p className="text-sm text-slate-100 leading-relaxed">
                {suggestion}
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
