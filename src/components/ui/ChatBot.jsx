import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * ChatBot — FAB + chat panel
 * - No auto-focus (user can click to focus)
 * - Sans-serif, clean, no glow
 */
export default function ChatBot({ context = {} }) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: '¡Hola! Soy **DilBot** 🤖⚽. Pregúntame sobre el partido o los pronósticos de la familia. Solo respondo temas de pronósticos deportivos 🏟️.',
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const scrollRef = useRef(null)
  const inputRef = useRef(null)

  const suggestions = [
    '¿Quién tiene más chances?',
    '¿Cuál es el consenso?',
    '¿Marcador recomendado?',
    '¿Cómo va el partido?',
  ]

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, loading, open])

  // NOTE: do not auto-focus the textarea. User clicks when ready.

  async function sendMessage(text) {
    const trimmed = text.trim()
    if (!trimmed || loading) return

    const userMsg = { role: 'user', content: trimmed }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/analisis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages, context }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data?.message || data?.error || 'No pude contactar al bot')
        return
      }
      const reply = (data.reply || '').trim()
      const final = reply && reply.length >= 5 ? reply : 'Sin respuesta de DilBot. Intenta de nuevo.'
      setMessages((prev) => [...prev, { role: 'assistant', content: final }])
    } catch (err) {
      setError(err?.message || 'Error de red')
    } finally {
      setLoading(false)
    }
  }

  function handleSubmit(e) {
    e.preventDefault()
    sendMessage(input)
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  function handleClear() {
    setMessages([
      { role: 'assistant', content: 'Conversación reiniciada 🤖⚽. ¿Algo del partido?' },
    ])
    setError('')
  }

  return (
    <>
      {/* Floating action button — integrated, less prominent */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 240, damping: 20, delay: 0.4 }}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        onClick={() => setOpen((v) => !v)}
        className="fixed z-40 bottom-5 right-5 w-12 h-12 rounded-full
          flex items-center justify-center text-lg
          border border-white/15
          bg-slate-900/85 backdrop-blur-md text-white"
        aria-label="Abrir chat con DilBot"
        title="DilBot · Chatbot de pronósticos"
      >
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.span key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.18 }} aria-hidden>
              ✕
            </motion.span>
          ) : (
            <motion.span key="bot" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} transition={{ duration: 0.18 }} aria-hidden>
              🤖
            </motion.span>
          )}
        </AnimatePresence>
        {!open && (
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-900" />
        )}
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setOpen(false)}
              className="sm:hidden fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', stiffness: 280, damping: 30 }}
              className="fixed z-50 inset-x-0 bottom-0 sm:inset-auto sm:bottom-24 sm:right-5
                sm:w-[380px] sm:max-w-[calc(100vw-2.5rem)] sm:h-[600px] sm:max-h-[calc(100vh-7rem)]
                h-[90dvh]
                flex flex-col
                rounded-t-2xl sm:rounded-2xl
                bg-slate-900/95 border border-white/10 backdrop-blur-xl
                shadow-[0_-12px_50px_rgba(0,0,0,0.5)]
                overflow-hidden"
            >
              <header className="flex items-center justify-between gap-3 px-4 py-3 border-b border-white/5 bg-slate-900/80">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0"
                    style={{ background: 'linear-gradient(135deg, #006600 0%, #FCD116 100%)' }}
                    aria-hidden
                  >
                    🤖
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-sm font-semibold text-white leading-tight">DilBot</h2>
                    <p className="text-[10px] text-slate-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      Solo pronósticos deportivos
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={handleClear} className="w-8 h-8 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 flex items-center justify-center transition-colors" aria-label="Reiniciar">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 2v6h-6M3 12a9 9 0 0 1 15-6.7L21 8M3 22v-6h6M21 12a9 9 0 0 1-15 6.7L3 16" />
                    </svg>
                  </button>
                  <button onClick={() => setOpen(false)} className="w-8 h-8 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 flex items-center justify-center transition-colors sm:hidden" aria-label="Cerrar">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </header>

              <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
                style={{ background: 'rgba(2, 6, 23, 0.5)' }}
              >
                {messages.map((m, i) => (
                  <MessageBubble key={i} role={m.role} content={m.content} />
                ))}
                {loading && <TypingBubble />}
                {error && (
                  <div className="text-center">
                    <p className="text-xs text-red-400 inline-block bg-red-500/10 border border-red-500/20 rounded-full px-3 py-1">
                      {error}
                    </p>
                  </div>
                )}

                {messages.length <= 1 && !loading && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="pt-2 space-y-1.5"
                  >
                    <p className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold pl-1">
                      Prueba con:
                    </p>
                    {suggestions.map((s, i) => (
                      <button
                        key={i}
                        onClick={() => sendMessage(s)}
                        disabled={loading}
                        className="w-full text-left text-xs px-3 py-2 rounded-xl
                          bg-slate-800/60 border border-white/5 text-slate-300
                          hover:bg-slate-800 hover:border-white/10 hover:text-white
                          transition-colors disabled:opacity-40"
                      >
                        <span className="text-yellow-300/80">›</span> {s}
                      </button>
                    ))}
                  </motion.div>
                )}
              </div>

              <form onSubmit={handleSubmit} className="border-t border-white/5 p-3 bg-slate-900/80">
                <div className="flex items-end gap-2">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKey}
                    rows={1}
                    maxLength={500}
                    placeholder="Pregúntale al bot…"
                    disabled={loading}
                    className="flex-1 resize-none rounded-2xl bg-slate-950/70 border border-white/10
                      text-white text-sm placeholder:text-slate-500
                      px-3.5 py-2.5 max-h-24
                      focus:outline-none focus:border-yellow-400/40 focus:ring-1 focus:ring-yellow-400/30
                      disabled:opacity-50"
                    style={{ minHeight: '40px' }}
                  />
                  <button
                    type="submit"
                    disabled={loading || !input.trim()}
                    className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center
                      bg-yellow-400 text-slate-900 font-bold
                      hover:bg-yellow-300
                      disabled:opacity-30 disabled:cursor-not-allowed
                      transition-all"
                    aria-label="Enviar"
                  >
                    {loading ? (
                      <span className="w-3.5 h-3.5 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin" />
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                <p className="text-[9px] text-slate-500 text-center mt-2">
                  Solo pronósticos deportivos ⚽ · Enter para enviar
                </p>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

function MessageBubble({ role, content }) {
  const isUser = role === 'user'
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex items-end gap-2 ${isUser ? 'flex-row-reverse' : ''}`}
    >
      {!isUser && (
        <div
          className="w-7 h-7 shrink-0 rounded-full flex items-center justify-center text-sm"
          style={{ background: 'linear-gradient(135deg, #006600 0%, #FCD116 100%)' }}
          aria-hidden
        >
          🤖
        </div>
      )}
      <div
        className={`
          max-w-[78%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed
          ${isUser
            ? 'bg-yellow-400 text-slate-900 rounded-br-md font-medium'
            : 'bg-slate-800/80 border border-white/5 text-slate-100 rounded-bl-md'
          }
        `}
      >
        {isUser ? content : <RenderMarkdown text={content} />}
      </div>
    </motion.div>
  )
}

function TypingBubble() {
  return (
    <div className="flex items-end gap-2">
      <div
        className="w-7 h-7 shrink-0 rounded-full flex items-center justify-center text-sm"
        style={{ background: 'linear-gradient(135deg, #006600 0%, #FCD116 100%)' }}
        aria-hidden
      >
        🤖
      </div>
      <div className="bg-slate-800/80 border border-white/5 rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  )
}

function RenderMarkdown({ text }) {
  const lines = text.split('\n')
  return (
    <div className="space-y-1.5">
      {lines.map((line, i) => {
        const trimmed = line.trim()
        if (!trimmed) return <div key={i} className="h-1" />
        if (trimmed.startsWith('## ')) {
          return (
            <div key={i} className="text-[12px] font-bold text-white pt-1 first:pt-0">
              {renderInline(trimmed.slice(3))}
            </div>
          )
        }
        if (/^[-•*]\s/.test(trimmed)) {
          return (
            <div key={i} className="flex items-start gap-1.5">
              <span className="text-yellow-300/80 mt-0.5 shrink-0">›</span>
              <span>{renderInline(trimmed.replace(/^[-•*]\s/, ''))}</span>
            </div>
          )
        }
        return <p key={i}>{renderInline(trimmed)}</p>
      })}
    </div>
  )
}

function renderInline(text) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((p, i) => {
    if (p.startsWith('**') && p.endsWith('**')) {
      return <strong key={i} className="font-semibold text-white">{p.slice(2, -2)}</strong>
    }
    return <span key={i}>{p}</span>
  })
}
