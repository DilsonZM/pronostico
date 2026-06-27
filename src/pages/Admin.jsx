import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { Button, Input, LiveMatchStrip, SectionCard } from '../components/ui'
import { PageContainer } from '../components/layout'
import { usePrediction } from '../context/PredictionContext'
import { useLiveData } from '../context/LiveDataContext'
import { comparePredictionWithLive } from '../lib/compareScores'
import { isPast } from '../lib/date-utils'
import { ADMIN_PIN, MATCH_DEADLINE } from '../lib/supabase'

export default function Admin({ onBack }) {
  const { getAllPredictions, getPredictionCount, deletePrediction } = usePrediction()
  const { liveMatch, liveLoading, liveError, refreshLive, isActive, isFinished, liveLastUpdated } = useLiveData()
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
      toast.success('Panel admin desbloqueado')
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
    if (authenticated) loadData()
  }, [authenticated])

  const handleDelete = async (id, name) => {
    if (!window.confirm(`¿Eliminar el pronóstico de "${name}"?`)) return
    const { error } = await deletePrediction(id)
    if (error) {
      toast.error('No se pudo eliminar')
    } else {
      toast.success(`Pronóstico de ${name} eliminado`)
      setPredictions((prev) => prev.filter((p) => p.id !== id))
      setTotalCount((c) => Math.max(0, c - 1))
    }
  }

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

  const colombiaWins = predictions.filter(p => p.colombia_score > p.portugal_score).length
  const portugalWins = predictions.filter(p => p.portugal_score > p.colombia_score).length
  const draws = predictions.filter(p => p.colombia_score === p.portugal_score).length
  const avgColombia = predictions.length ? (predictions.reduce((s, p) => s + p.colombia_score, 0) / predictions.length).toFixed(1) : '0'
  const avgPortugal = predictions.length ? (predictions.reduce((s, p) => s + p.portugal_score, 0) / predictions.length).toFixed(1) : '0'

  if (!authenticated) {
    return (
      <PageContainer>
        <button
          onClick={onBack}
          className="self-start inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Volver
        </button>
        <div className="bg-slate-900/70 border border-white/8 rounded-2xl p-6 sm:p-8">
          <div className="text-center mb-5">
            <div className="w-12 h-12 rounded-xl bg-slate-800/70 border border-white/10 flex items-center justify-center mx-auto mb-3 text-2xl">
              🔐
            </div>
            <h2 className="text-lg font-semibold text-white">Panel Admin</h2>
            <p className="text-xs text-slate-400 mt-1">Ingresa el PIN de administrador</p>
          </div>
          <form onSubmit={handlePinSubmit} className="flex flex-col gap-4">
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
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer gap="gap-5">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Volver
        </button>
        <button
          onClick={loadData}
          disabled={loading}
          className="text-xs text-slate-400 hover:text-white transition-colors"
        >
          {loading ? 'Cargando…' : '↻ Actualizar'}
        </button>
      </div>

      <h1 className="text-xl font-semibold text-white">Panel de Administración</h1>

      <LiveMatchStrip
        match={liveMatch}
        loading={liveLoading}
        error={liveError}
        deadline={MATCH_DEADLINE.toISOString()}
        isActive={isActive}
        isFinished={isFinished}
        lastUpdated={liveLastUpdated}
        onRefresh={refreshLive}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <StatCard label="Total" value={totalCount} />
        <StatCard label="COL" value={colombiaWins} color="text-yellow-300" />
        <StatCard label="Empate" value={draws} color="text-slate-300" />
        <StatCard label="POR" value={portugalWins} color="text-emerald-300" />
      </div>

      {/* Averages */}
      <div className="bg-slate-900/70 border border-white/8 rounded-2xl px-4 py-3 flex items-center justify-around">
        <div className="text-center">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">Promedio COL</p>
          <p className="font-mono text-2xl font-bold text-yellow-300">{avgColombia}</p>
        </div>
        <div className="w-px h-10 bg-white/10" />
        <div className="text-center">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">Promedio POR</p>
          <p className="font-mono text-2xl font-bold text-emerald-300">{avgPortugal}</p>
        </div>
      </div>

      {/* Sort + count */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">Ordenar:</span>
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

      {/* Predictions list */}
      <SectionCard title="Lista de pronósticos" delay={0.1}>
        {loading && predictions.length === 0 ? (
          <p className="text-center text-slate-500 text-sm py-6">Cargando…</p>
        ) : sortedPredictions.length === 0 ? (
          <p className="text-center text-slate-500 text-sm py-6">No hay pronósticos aún</p>
        ) : (
          <ul className="space-y-2.5">
            {sortedPredictions.map((pred) => {
              const comparison = liveMatch?.score?.fullTime?.home !== null
                ? comparePredictionWithLive(pred, liveMatch)
                : null
              return (
                <li
                  key={pred.id}
                  className={`
                    flex items-center gap-3 rounded-2xl border bg-slate-800/40 px-4 py-3
                    ${comparison?.exactMatch ? 'border-emerald-500/30' : 'border-white/5'}
                  `}
                >
                  <div
                    className="w-9 h-9 shrink-0 rounded-full flex items-center justify-center text-xs font-bold text-slate-900"
                    style={{ background: 'linear-gradient(135deg, #FCD116 0%, #006600 100%)' }}
                  >
                    {(pred.profiles?.display_name || '?')[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
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
                      {comparison?.points > 0 && (
                        <span className="text-emerald-400 ml-1">+{comparison.points}pts</span>
                      )}
                    </p>
                  </div>
                  <span className="font-mono text-sm font-bold text-white tabular-nums whitespace-nowrap">
                    {pred.colombia_score}<span className="text-slate-500 mx-1">–</span>{pred.portugal_score}
                  </span>
                  <button
                    onClick={() => handleDelete(pred.id, pred.profiles?.display_name || 'este usuario')}
                    className="ml-1 w-8 h-8 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 flex items-center justify-center transition-colors shrink-0"
                    title="Eliminar pronóstico"
                    aria-label="Eliminar"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14z" />
                    </svg>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </SectionCard>

      <p className="text-center text-[10px] text-slate-500">
        {isPast(MATCH_DEADLINE) ? '🔒 Pronósticos cerrados' : '✅ Pronósticos abiertos'} · {MATCH_DEADLINE.toLocaleString('es-CO', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
      </p>
    </PageContainer>
  )
}

function StatCard({ label, value, color = 'text-white' }) {
  return (
    <div className="bg-slate-900/70 border border-white/8 rounded-2xl px-3 py-3 text-center">
      <p className={`font-mono text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">{label}</p>
    </div>
  )
}
