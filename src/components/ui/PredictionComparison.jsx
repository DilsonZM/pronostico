/**
 * PredictionComparison Component
 * 
 * Shows the user's prediction compared to the live/final match result.
 * Displays points earned, accuracy badges, and detailed comparison.
 */

import { motion } from 'framer-motion'
import { comparePredictionWithLive } from '../../lib/compareScores'

export default function PredictionComparison({ prediction, liveMatch }) {
  if (!prediction || !liveMatch) return null

  const result = comparePredictionWithLive(prediction, liveMatch)
  if (!result) return null

  // Match hasn't finished yet
  if (result.status === 'pending') {
    return (
      <div className="glass rounded-2xl p-4">
        <div className="flex items-center gap-3">
          <span className="text-xl">⏳</span>
          <div>
            <p className="text-sm font-medium text-dark-300">
              Comparación pendiente
            </p>
            <p className="text-xs text-dark-500">
              Se comparará tu pronóstico cuando el partido termine
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`glass rounded-2xl p-5 ${
        result.exactMatch
          ? 'ring-1 ring-emerald-500/30 bg-emerald-500/5'
          : result.resultMatch
          ? 'ring-1 ring-colombia-yellow/20 bg-colombia-yellow/5'
          : ''
      }`}
    >
      <div className="text-center mb-4">
        <span className="text-3xl mb-1 block">{result.badge}</span>
        <p className={`text-sm font-bold ${result.color}`}>{result.label}</p>
        {result.points > 0 && (
          <p className="text-xs text-dark-500 mt-1">
            +{result.points} {result.points === 1 ? 'punto' : 'puntos'}
          </p>
        )}
      </div>

      {/* Side by side comparison */}
      <div className="grid grid-cols-2 gap-3">
        {/* Your Prediction */}
        <div className="glass-light rounded-xl p-3 text-center">
          <span className="text-[10px] text-dark-500 uppercase tracking-wider block mb-2">
            Tu pronóstico
          </span>
          <div className="flex items-center justify-center gap-2">
            <span className="text-sm">🇨🇴</span>
            <span className="font-display text-xl font-bold text-white">
              {result.prediction.colombia}
            </span>
            <span className="text-dark-600 font-bold">-</span>
            <span className="font-display text-xl font-bold text-white">
              {result.prediction.portugal}
            </span>
            <span className="text-sm">🇵🇹</span>
          </div>
        </div>

        {/* Actual Result */}
        <div className="glass-light rounded-xl p-3 text-center">
          <span className="text-[10px] text-dark-500 uppercase tracking-wider block mb-2">
            Resultado real
          </span>
          <div className="flex items-center justify-center gap-2">
            <span className="text-sm">🇨🇴</span>
            <span className="font-display text-xl font-bold text-white">
              {result.actual.colombia}
            </span>
            <span className="text-dark-600 font-bold">-</span>
            <span className="font-display text-xl font-bold text-white">
              {result.actual.portugal}
            </span>
            <span className="text-sm">🇵🇹</span>
          </div>
        </div>
      </div>

      {/* Accuracy detail */}
      {result.exactMatch && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-3 text-center"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <span className="text-xs">🎯</span>
            <span className="text-xs font-semibold text-emerald-400">
              ¡Predicción perfecta!
            </span>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
