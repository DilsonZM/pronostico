import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Button from './Button'

/**
 * BotAnalisis — modal that calls /api/analisis (DeepSeek) and shows
 * a family-friendly breakdown of the match with the family predictions.
 *
 * - Open: button "🤖 Análisis con IA" at the bottom
 * - Loading: spinner + "Pensando..." indicator
 * - Error: friendly message + retry
 * - Success: animated reveal of the markdown-style analysis
 */
export default function BotAnalisis({
  familyPredictions = [],
  match = {},
  userPrediction = null,
  triggerLabel = '🤖 Análisis con IA',
  triggerIcon = '🤖',
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [analysis, setAnalysis] = useState('')
  const [error, setError] = useState('')

  async function runAnalysis() {
    setLoading(true)
    setError('')
    setAnalysis('')
    try {
      const res = await fetch('/api/analisis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          family_predictions: familyPredictions.map((p) => ({
            display_name: p.profile?.display_name || 'Anónimo',
            colombia: p.colombia_score,
            portugal: p.portugal_score,
          })),
          match: {
            home: match?.homeTeam?.name || 'Colombia',
            away: match?.awayTeam?.name || 'Portugal',
            status: match?.status || 'TIMED',
            score: match?.score?.fullTime
              ? { home: match.score.fullTime.home, away: match.score.fullTime.away }
              : null,
            kickoff: match?.utcDate,
            competition: match?.competition || 'Mundial FIFA 2026',
          },
          user_prediction: userPrediction,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data?.message || data?.error || 'No pude contactar al bot')
        return
      }
      setAnalysis(data.analysis || 'Sin respuesta del bot.')
    } catch (err) {
      setError(err?.message || 'Error de red')
    } finally {
      setLoading(false)
    }
  }

  function handleOpen() {
    setOpen(true)
    if (!analysis && !loading) runAnalysis()
  }

  function handleClose() {
    setOpen(false)
  }

  return (
    <>
      <Button
        size="md"
        fullWidth
        variant="secondary"
        onClick={handleOpen}
        icon={triggerIcon}
      >
        {triggerLabel}
      </Button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
            style={{ background: 'rgba(2, 6, 23, 0.75)', backdropFilter: 'blur(8px)' }}
            onClick={handleClose}
          >
            <motion.div
              initial={{ y: 30, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 30, opacity: 0, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 280, damping: 24 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md max-h-[85vh] overflow-hidden flex flex-col
                rounded-t-3xl sm:rounded-3xl
                bg-slate-900/95 border border-white/10 backdrop-blur-xl
                shadow-[0_-8px_40px_rgba(0,0,0,0.5),0_8px_40px_rgba(0,0,0,0.4)]
                mx-auto"
            >
              {/* Header */}
              <header className="flex items-center justify-between gap-3 px-5 py-4 border-b border-white/5">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-lg shrink-0"
                    style={{
                      background: 'linear-gradient(135deg, #006600 0%, #FCD116 100%)',
                      boxShadow: '0 0 16px rgba(0,102,0,0.4)',
                    }}
                    aria-hidden
                  >
                    🤖
                  </div>
                  <div className="min-w-0">
                    <h2 className="font-display text-sm sm:text-base font-bold text-white tracking-wide">
                      Análisis con IA
                    </h2>
                    <p className="text-[10px] text-slate-400 leading-tight">
                      Powered by DeepSeek · Familiar y honesto
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="w-8 h-8 rounded-full text-slate-400 hover:text-white hover:bg-white/5 flex items-center justify-center transition-colors"
                  aria-label="Cerrar"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </header>

              {/* Body */}
              <div className="flex-1 overflow-y-auto px-5 py-4">
                {loading && <LoadingState />}
                {error && <ErrorState message={error} onRetry={runAnalysis} />}
                {!loading && !error && analysis && (
                  <AnalysisRenderer text={analysis} />
                )}
              </div>

              {/* Footer */}
              <footer className="flex items-center justify-between gap-2 px-5 py-3 border-t border-white/5">
                <span className="text-[10px] text-slate-500">
                  {familyPredictions.length} pronóstico{familyPredictions.length === 1 ? '' : 's'} analizado{familyPredictions.length === 1 ? '' : 's'}
                </span>
                <button
                  onClick={runAnalysis}
                  disabled={loading}
                  className="text-xs font-semibold text-yellow-300 hover:text-yellow-200 transition-colors disabled:opacity-40"
                >
                  {loading ? 'Analizando…' : '↻ Re-analizar'}
                </button>
              </footer>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-10 gap-3">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
        className="w-12 h-12 rounded-full border-2 border-white/10 border-t-yellow-300"
      />
      <p className="text-sm text-slate-300">Analizando pronósticos de la familia…</p>
      <p className="text-[10px] text-slate-500">DeepSeek está pensando 🤔</p>
    </div>
  )
}

function ErrorState({ message, onRetry }) {
  return (
    <div className="py-8 text-center">
      <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-3">
        <span className="text-2xl">😕</span>
      </div>
      <p className="text-sm font-semibold text-white mb-1">El bot no responde</p>
      <p className="text-xs text-slate-400 max-w-[260px] mx-auto mb-4">{message}</p>
      <button
        onClick={onRetry}
        className="text-xs font-bold text-yellow-300 hover:text-yellow-200"
      >
        ↻ Reintentar
      </button>
    </div>
  )
}

/**
 * Lightweight markdown renderer tuned to the bot's response shape.
 * Supports: ## headings, **bold**, - bullets, plain paragraphs.
 */
function AnalysisRenderer({ text }) {
  const blocks = []
  const lines = text.split('\n')
  let buf = []
  function flush() {
    if (buf.length) {
      blocks.push({ type: 'p', text: buf.join(' ').trim() })
      buf = []
    }
  }
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) { flush(); continue }
    if (trimmed.startsWith('## ')) {
      flush()
      blocks.push({ type: 'h2', text: trimmed.slice(3).trim() })
      continue
    }
    if (/^[-•*]\s/.test(trimmed)) {
      flush()
      blocks.push({ type: 'li', text: trimmed.replace(/^[-•*]\s/, '') })
      continue
    }
    buf.push(trimmed)
  }
  flush()

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-3"
    >
      {blocks.map((b, i) => {
        if (b.type === 'h2') {
          return (
            <h3
              key={i}
              className="font-display text-sm font-bold text-white tracking-wide mt-4 first:mt-0
                pb-2 border-b border-white/5 flex items-center gap-2"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
              {renderInline(b.text)}
            </h3>
          )
        }
        if (b.type === 'li') {
          return (
            <div key={i} className="flex items-start gap-2 text-sm text-slate-200 leading-relaxed">
              <span className="text-yellow-300 mt-1 shrink-0">›</span>
              <span>{renderInline(b.text)}</span>
            </div>
          )
        }
        return (
          <p key={i} className="text-sm text-slate-200 leading-relaxed">
            {renderInline(b.text)}
          </p>
        )
      })}
    </motion.div>
  )
}

function renderInline(text) {
  // Replace **bold** with <strong> and emojis are left as-is
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((p, i) => {
    if (p.startsWith('**') && p.endsWith('**')) {
      return <strong key={i} className="font-semibold text-white">{p.slice(2, -2)}</strong>
    }
    return <span key={i}>{p}</span>
  })
}
