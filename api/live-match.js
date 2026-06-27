/**
 * Vercel Serverless Function: /api/live-match
 * 
 * Proxies requests to football-data.org to keep the API key server-side.
 * Fetches World Cup matches and filters for Colombia vs Portugal.
 * 
 * Features:
 * - 60-second cache via Cache-Control
 * - Fallback from /competitions/2000/matches to /matches
 * - Tolerant team name matching
 * - Graceful error handling for rate limits and missing data
 */

const API_BASE = 'https://api.football-data.org/v4'
const COMPETITION_ID = process.env.FOOTBALL_DATA_COMPETITION_ID || '2000'
const CACHE_MAX_AGE = 60 // seconds

// Team name normalization for tolerant matching
function normalizeTeamName(name) {
  if (!name) return ''
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

function isColombia(teamName) {
  const normalized = normalizeTeamName(teamName)
  return normalized === 'colombia' || normalized === 'col'
}

function isPortugal(teamName) {
  const normalized = normalizeTeamName(teamName)
  return normalized === 'portugal' || normalized === 'por' || normalized === 'prt'
}

function isColombiaVsPortugal(match) {
  const home = match.homeTeam?.name || match.homeTeam?.shortName || ''
  const away = match.awayTeam?.name || match.awayTeam?.shortName || ''
  return (
    (isColombia(home) && isPortugal(away)) ||
    (isColombia(away) && isPortugal(home))
  )
}

function normalizeMatchData(match) {
  if (!match) return null

  const homeName = match.homeTeam?.name || match.homeTeam?.shortName || 'Colombia'
  const awayName = match.awayTeam?.name || match.awayTeam?.shortName || 'Portugal'

  // Ensure Colombia is always home for display consistency
  const isColombiaHome = isColombia(homeName)

  return {
    id: match.id,
    status: match.status,
    stage: match.stage || 'REGULAR_SEASON',
    matchday: match.matchday,
    utcDate: match.utcDate,
    venue: match.venue || null,
    homeTeam: {
      name: isColombiaHome ? homeName : awayName,
      shortName: isColombiaHome ? (match.homeTeam?.shortName || 'COL') : (match.awayTeam?.shortName || 'POR'),
      crest: isColombiaHome ? match.homeTeam?.crest : match.awayTeam?.crest,
    },
    awayTeam: {
      name: isColombiaHome ? awayName : homeName,
      shortName: isColombiaHome ? (match.awayTeam?.shortName || 'POR') : (match.homeTeam?.shortName || 'COL'),
      crest: isColombiaHome ? match.awayTeam?.crest : match.homeTeam?.crest,
    },
    score: {
      winner: match.score?.winner || null,
      duration: match.score?.duration || null,
      fullTime: {
        home: isColombiaHome
          ? (match.score?.fullTime?.home ?? null)
          : (match.score?.fullTime?.away ?? null),
        away: isColombiaHome
          ? (match.score?.fullTime?.away ?? null)
          : (match.score?.fullTime?.home ?? null),
      },
      halfTime: {
        home: isColombiaHome
          ? (match.score?.halfTime?.home ?? null)
          : (match.score?.halfTime?.away ?? null),
        away: isColombiaHome
          ? (match.score?.halfTime?.away ?? null)
          : (match.score?.halfTime?.home ?? null),
      },
      penalties: {
        home: isColombiaHome
          ? (match.score?.penalties?.home ?? null)
          : (match.score?.penalties?.away ?? null),
        away: isColombiaHome
          ? (match.score?.penalties?.away ?? null)
          : (match.score?.penalties?.home ?? null),
      },
    },
    lastUpdated: new Date().toISOString(),
  }
}

async function fetchFromFootballData(path, apiKey) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'X-Auth-Token': apiKey,
    },
  })

  if (response.status === 429) {
    throw new Error('RATE_LIMIT')
  }

  if (response.status === 403) {
    throw new Error('ACCESS_DENIED')
  }

  if (!response.ok) {
    throw new Error(`API_ERROR_${response.status}`)
  }

  return response.json()
}

export default async function handler(req, res) {
  // Only allow GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.FOOTBALL_DATA_API_KEY

  if (!apiKey) {
    return res.status(500).json({
      error: 'API key not configured',
      message: 'FOOTBALL_DATA_API_KEY is not set in environment variables',
    })
  }

  // Set cache headers (60s CDN, 30s browser)
  res.setHeader('Cache-Control', `public, s-maxage=${CACHE_MAX_AGE}, stale-while-revalidate=30`)

  try {
    let match = null
    let source = null

    // Strategy 1: Try competition-specific endpoint (World Cup)
    try {
      const data = await fetchFromFootballData(
        `/competitions/${COMPETITION_ID}/matches`,
        apiKey
      )

      if (data.matches && Array.isArray(data.matches)) {
        match = data.matches.find(isColombiaVsPortugal)
        if (match) source = `competition_${COMPETITION_ID}`
      }
    } catch (err) {
      // If competition endpoint fails, we'll try the general /matches
      if (err.message === 'RATE_LIMIT') {
        return res.status(429).json({
          error: 'Rate limit exceeded',
          message: 'Too many requests to football-data.org. Please try again later.',
          retryAfter: 60,
        })
      }
      // For other errors, continue to fallback
    }

    // Strategy 2: Fallback to general /matches endpoint
    if (!match) {
      try {
        const data = await fetchFromFootballData('/matches', apiKey)

        if (data.matches && Array.isArray(data.matches)) {
          match = data.matches.find(isColombiaVsPortugal)
          if (match) source = 'matches_general'
        }
      } catch (err) {
        if (err.message === 'RATE_LIMIT') {
          return res.status(429).json({
            error: 'Rate limit exceeded',
            message: 'Too many requests. Please try again later.',
            retryAfter: 60,
          })
        }
        // Continue - will return not found
      }
    }

    // No match found
    if (!match) {
      return res.status(200).json({
        found: false,
        message: 'El partido Colombia vs Portugal no se encontró en la API. Es posible que aún no esté programado o que la competición no esté disponible en el plan gratuito.',
        lastChecked: new Date().toISOString(),
      })
    }

    // Return normalized match data
    const normalized = normalizeMatchData(match)

    return res.status(200).json({
      found: true,
      match: normalized,
      source,
      lastChecked: new Date().toISOString(),
    })

  } catch (err) {
    console.error('[live-match] Unexpected error:', err)
    return res.status(500).json({
      error: 'Internal error',
      message: 'Could not fetch match data. Please try again later.',
    })
  }
}
