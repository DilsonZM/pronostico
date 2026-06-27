import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

/**
 * BotSuggestion — non-intrusive short suggestion banner from DilBot.
 *
 * Auto-retries up to 3 times if the bot returns an empty or
 * suspiciously short response (which can happen when DeepSeek's
 * reasoning mode uses all the tokens for thinking and leaves
 * little for the final answer).
 */
export default function BotSuggestion({ prediction, familyPredictions = [], match = null }) {
  const [loading, setLoading] = useState(false)
  const [suggestion, setSuggestion] = useState('')
  const [dismissed, setDismissed] = useState(false)
  const [error, setError] = useState('')
  const [retryNonce, setRetryNonce] = useState(0)
  const [attempt, setAttempt] = useState(0)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])

  useEffect(() => {
    if (!prediction || !prediction.user_id) return
    let cancelled = false
    setLoading(true)
    setError('')
    setSuggestion('')
    setAttempt(0)

    const family = (familyPredictions || [])
      .filter((p) => p && p.user_id !== prediction.user_id)
      .map((p) => ({
        display_name: p.profile?.display_name || 'Anónimo',
        colombia: p.colombia_score,
        portugal: p.portugal_score,
      }))

    const matchContext = match || { home: 'Colombia', away: 'Portugal', status: 'TIMED' }

    async function callBot() {
      const res = await fetch('/api/analisis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: 'Mi pronóstico es ' + prediction.colombia_score + '-' + prediction.portugal_score + '. Dame una sugerencia MUY breve (máx 25 palabras) sobre si debería mantenerlo o ajustarlo. Sin repetir el marcador. Solo un consejo directo.',
            },
          ],
          context: {
            family_predictions: family,
            match: {
              home: matchContext.home || 'Colombia',
              away: matchContext.away || 'Portugal',
              status: matchContext.status || 'TIMED',
              score: matchContext.score || null,
              competition: matchContext.competition || 'Mundial FIFA 2026',
            },
          },
        }),
      })
      return res
    }

    async function fetchWithRetry() {
      const MAX_ATTEMPTS = 3
      for (let i = 0; i < MAX_ATTEMPTS; i++) {
        if (cancelled || !mountedRef.current) return
        setAttempt(i + 1)
        try {
          const res = await callBot()
          if (cancelled || !mountedRef.current) return
          if (!res.ok) {
            const data = await res.json().catch(() => ({}))
            if (mountedRef.current) setError(data?.message || 'No pude consultar a DilBot')
            return
          }
          const data = await res.json()
          if (cancelled || !mountedRef.current) return
          const reply = (data?.reply || '').trim()
          // Treat suspiciously short / "Sin respuesta" as failure → retry
          if (reply && reply.length >= 8 && !/^sin respuesta/i.test(reply)) {
            if (mountedRef.current) setSuggestion(reply)
            return
          }
          // Otherwise loop and retry
        } catch (err) {
          if (cancelled || !mountedRef.current) return
          if (i === MAX_ATTEMPTS - 1 && mountedRef.current) {
            setError(err?.message || 'Error de red')
          }
        }
        // Small backoff between attempts
        await new Promise((r) => setTimeout(r, 600))
      }
      if (mountedRef.current && !cancelled) {
        setError('DilBot no respondió. Intenta de nuevo.')
      }
    }

    fetchWithRetry()

    return () => { cancelled = true }
  }, [prediction?.id, prediction?.colombia_score, prediction?.portugal_score, retryNonce])

  if (dismissed) return null

  return (
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
              Sugerencia de DilBot
            </p>
            <div className="flex items-center gap-1">
              {(error || (!loading && !suggestion)) && (
                <button
                  onClick={() => setRetryNonce((n) => n + 1)}
                  className="text-[10px] text-yellow-300 hover:text-yellow-200 transition-colors"
                  title="Reintentar"
                >
                  ↻
                </button>
              )}
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
          </div>
          {loading && (
            <p className="text-xs text-slate-400 flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-yellow-300/60 animate-pulse" />
              {attempt > 1 ? `DilBot pensando (intento ${attempt}/3)…` : 'DilBot analizando tu pronóstico…'}
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
  )
}
