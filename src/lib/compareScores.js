/**
 * Score Comparison Utility
 * 
 * Compares a user's prediction against the live/final match score.
 * Returns match results with accuracy details.
 */

/**
 * Compare a prediction against actual match result
 * @param {Object} prediction - { colombia_score, portugal_score }
 * @param {Object} liveMatch - Live match data from API
 * @returns {Object} Comparison result
 */
export function comparePredictionWithLive(prediction, liveMatch) {
  if (!prediction || !liveMatch) return null

  const predCol = prediction.colombia_score
  const predPor = prediction.portugal_score
  const liveCol = liveMatch.score?.fullTime?.home
  const livePor = liveMatch.score?.fullTime?.away

  // Match hasn't finished yet — no comparison possible
  if (liveCol === null || livePor === null) {
    return {
      status: 'pending',
      message: 'El partido aún no ha finalizado',
      exactMatch: false,
      resultMatch: false,
      scoreDiff: null,
    }
  }

  const exactMatch = predCol === liveCol && predPor === livePor

  // Determine predicted and actual result
  const predResult = predCol > predPor ? 'home' : predCol < predPor ? 'away' : 'draw'
  const actualResult = liveCol > livePor ? 'home' : liveCol < livePor ? 'away' : 'draw'
  const resultMatch = predResult === actualResult

  // Goal difference accuracy
  const predDiff = predCol - predPor
  const actualDiff = liveCol - livePor
  const diffAccuracy = Math.abs(predDiff - actualDiff)

  // Points system (FIFA style)
  let points = 0
  let badge = ''
  let label = ''
  let color = ''

  if (exactMatch) {
    points = 3
    badge = '🎯'
    label = '¡Predicción perfecta!'
    color = 'text-emerald-400'
  } else if (resultMatch) {
    points = 1
    badge = '✅'
    label = 'Resultado correcto'
    color = 'text-colombia-yellow'
  } else if (diffAccuracy <= 1) {
    points = 0
    badge = '🤏'
    label = 'Casi...'
    color = 'text-amber-400'
  } else {
    points = 0
    badge = '❌'
    label = 'Sin puntos'
    color = 'text-slate-400'
  }

  return {
    status: 'completed',
    exactMatch,
    resultMatch,
    points,
    badge,
    label,
    color,
    scoreDiff: diffAccuracy,
    prediction: { colombia: predCol, portugal: predPor },
    actual: { colombia: liveCol, portugal: livePor },
  }
}

/**
 * Calculate leaderboard from all predictions and live match
 * @param {Array} predictions - All user predictions
 * @param {Object} liveMatch - Live match data
 * @returns {Array} Sorted leaderboard
 */
export function calculateLeaderboard(predictions, liveMatch) {
  if (!predictions || !liveMatch) return []

  const scored = predictions.map(pred => {
    const comparison = comparePredictionWithLive(pred, liveMatch)
    return {
      ...pred,
      displayName: pred.profiles?.display_name || 'Sin nombre',
      comparison,
      points: comparison?.points || 0,
    }
  })

  // Sort by points desc, then by exact score diff, then by date
  scored.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points
    if (a.comparison?.scoreDiff !== b.comparison?.scoreDiff) {
      return (a.comparison?.scoreDiff || 99) - (b.comparison?.scoreDiff || 99)
    }
    return new Date(a.created_at) - new Date(b.created_at)
  })

  return scored.map((entry, index) => ({
    ...entry,
    rank: index + 1,
  }))
}
