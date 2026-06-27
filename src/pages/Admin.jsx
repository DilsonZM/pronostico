import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button, Input, LiveMatchCard } from '../components/ui'
import { usePrediction } from '../context/PredictionContext'
import { useLiveMatch } from '../hooks/useLiveMatch'
import { comparePredictionWithLive } from '../lib/compareScores'
import { ADMIN_PIN, MATCH_DEADLINE } from '../lib/supabase'

export default function Admin({ onBack }) {
  const { getAllPredictions, getPredictionCount } = usePrediction()
  const { match: liveMatch, loading: liveLoading, error: liveError, refresh: refreshLive, isActive, isFinished, lastUpdated: liveLastUpdated, fromCache } = useLiveMatch()
  const [authenticated, setAuthenticated] = useState(false)
  const [pin, setPin] = useState('')
  const [pinError, setPinError] = useState('')
  const [predictions, setPredictions] = useState([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [sortBy, setSortBy] = useState('created_at')

  const handlePinSubmit = (e) => {
    e.preventDefault()
    if (pin === ADMIN_PIN) {
      setAuthenticated(true)
      setPinError('')
    } else {
      setPinError('PIN incorrecto')
      setPin('')
    }
  }

  const loadData = async () => {
    setLoading(true)
    const [predResult, count] = await Promise.all([
      getAllPredictions(),
      getPredictionCount(),
    ])
    if (predResult.data) setPredictions(predResult.data)
    setTotalCount(count)
    setLoading(false)
  }

  useEffect(() => {
    if (authenticated) {
      loadData()
    }
  }, [authenticated])

  const sortedPredictions = [...predictions].sort((a, b) => {
    if (sortBy === 'created_at') return new Date(b.created_at) - new Date(a.created_at)
    if (sortBy === 'name') return (a.profiles?.display_name || '').localeCompare(b.profiles?.display_name || '')
    if (sortBy === 'colombia') return b.colombia_score - a.colombia_score
    if (sortBy === 'points' && liveMatch) {
      const aComp = comparePredictionWithLive(a, liveMatch)
      const bComp = comparePredictionWithLive(b, liveMatch)
      return (bComp?.points || 0) - (aComp?.points || 0)
    }
    return 0
  })

  // Stats
  const colombiaWins = predictions.filter(p => p.colombia_score > p.portugal_score).length
  const portugalWins = predictions.filter(p => p.portugal_score > p.colombia_score).length
  const draws = predictions.filter(p => p.colombia_score === p.portugal_score).length
  const avgColombia = predictions.length ? (predictions.reduce((s, p) => s + p.colombia_score, 0) / predictions.length).toFixed(1) : '0'
  const avgPortugal = predictions.length ? (predictions.reduce((s, p) => s + p.portugal_score, 0) / predictions.length).toFixed(1) : '0'

  if (!authenticated) {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center px-4 py-8">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-40 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full bg-white/3 blur-3xl" />
        </div>

        <div className="relative z-10 w-full max-w-sm">
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={onBack}
            className="mb-6 flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Volver
          </motion.button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-3xl p-8"
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🔐</span>
              </div>
              <h2 className="font-display text-xl font-bold text-white">
                Panel Admin
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Ingresa el PIN de administrador
              </p>
            </div>

            <form onSubmit={handlePinSubmit} className="space-y-4">
              <Input
                label="PIN"
                type="password"
                placeholder="••••"
                icon="🔑"
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value)
                  setPinError('')
                }}
                error={pinError}
                maxLength={10}
                autoFocus
              />
              <Button type="submit" size="lg" fullWidth disabled={!pin.trim()}>
                Acceder
              </Button>
            </form>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[100dvh] flex flex-col px-4 py-6">
      <div className="w-full max-w-2xl mx-auto flex flex-col gap-6 flex-1">
        {/* Header */}
        <div className="flex items-center justify-between">
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={onBack}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Volver
          </motion.button>
          <Button size="sm" variant="ghost" onClick={loadData} loading={loading}>
            🔄 Actualizar
          </Button>
        </div>

        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-2xl font-bold text-white tracking-wide"
        >
          Panel de Administración
        </motion.h1>

        {/* Live Match Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <LiveMatchCard
            match={liveMatch}
            loading={liveLoading}
            error={liveError}
            lastUpdated={liveLastUpdated}
            onRefresh={refreshLive}
            isActive={isActive}
            isFinished={isFinished}
            fromCache={fromCache}
          />
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3"
        >
          <StatCard label="Total" value={totalCount} icon="📊" />
          <StatCard label="Victoria COL" value={colombiaWins} icon="🇨🇴" color="text-colombia-yellow" />
          <StatCard label="Empates" value={draws} icon="🤝" color="text-slate-300" />
          <StatCard label="Victoria POR" value={portugalWins} icon="🇵🇹" color="text-emerald-400" />
        </motion.div>

        {/* Averages */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass rounded-2xl p-4 flex items-center justify-around"
        >
          <div className="text-center">
            <span className="text-xs text-slate-500 uppercase tracking-wider">Promedio COL</span>
            <p className="font-display text-2xl font-bold text-colombia-yellow">{avgColombia}</p>
          </div>
          <div className="w-px h-12 bg-white/10" />
          <div className="text-center">
            <span className="text-xs text-slate-500 uppercase tracking-wider">Promedio POR</span>
            <p className="font-display text-2xl font-bold text-emerald-400">{avgPortugal}</p>
          </div>
        </motion.div>

        {/* Sort */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Ordenar:</span>
          {[
            { key: 'created_at', label: 'Fecha' },
            { key: 'name', label: 'Nombre' },
            { key: 'colombia', label: 'Goles COL' },
            ...(liveMatch?.score?.fullTime?.home !== null ? [{ key: 'points', label: 'Puntos' }] : []),
          ].map(opt => (
            <button
              key={opt.key}
              onClick={() => setSortBy(opt.key)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                sortBy === opt.key
                  ? 'bg-white/10 text-white'
                  : 'text-slate-500 hover:text-white'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Predictions Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          {sortedPredictions.length === 0 ? (
            <div className="glass rounded-2xl p-8 text-center">
              <span className="text-4xl mb-4 block">📭</span>
              <p className="text-slate-400">No hay pronósticos aún</p>
            </div>
          ) : (
            sortedPredictions.map((pred, i) => {
              const comparison = liveMatch?.score?.fullTime?.home !== null
                ? comparePredictionWithLive(pred, liveMatch)
                : null

              return (
              <motion.div
                key={pred.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`glass rounded-2xl p-4 ${
                  comparison?.exactMatch
                    ? 'ring-1 ring-emerald-500/30'
                    : comparison?.resultMatch
                    ? 'ring-1 ring-colombia-yellow/20'
                    : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center flex-shrink-0">
                      <span className="text-lg font-bold text-white">
                        {(pred.profiles?.display_name || '?')[0].toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-white truncate">
                          {pred.profiles?.display_name || 'Sin nombre'}
                        </p>
                        {comparison && (
                          <span className="text-xs flex-shrink-0" title={comparison.label}>
                            {comparison.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500">
                        {new Date(pred.created_at).toLocaleString('es-CO', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                        {pred.updated_at !== pred.created_at && ' (editado)'}
                        {comparison?.points > 0 && (
                          <span className="text-emerald-400 ml-1">+{comparison.points}pts</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                    <span className="text-lg">🇨🇴</span>
                    <span className="font-display text-xl font-bold text-white">
                      {pred.colombia_score}
                    </span>
                    <span className="text-slate-600 font-bold">-</span>
                    <span className="font-display text-xl font-bold text-white">
                      {pred.portugal_score}
                    </span>
                    <span className="text-lg">🇵🇹</span>
                  </div>
                </div>
              </motion.div>
              )
            })
          )}
        </motion.div>

        {/* Deadline info */}
        <div className="glass rounded-2xl p-4 text-center">
          <p className="text-xs text-slate-500">
            🔒 Deadline: {MATCH_DEADLINE.toLocaleString('es-CO', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              timeZoneName: 'short',
            })}
          </p>
          <p className="text-xs text-slate-600 mt-1">
            {new Date() >= MATCH_DEADLINE ? '⚠️ Pronósticos cerrados' : '✅ Pronósticos abiertos'}
          </p>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, icon, color = 'text-white' }) {
  return (
    <div className="glass rounded-2xl p-4 text-center">
      <span className="text-xl">{icon}</span>
      <p className={`font-display text-2xl font-bold ${color} mt-1`}>{value}</p>
      <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-1">{label}</p>
    </div>
  )
}
