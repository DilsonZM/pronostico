import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/**
 * Vite dev server middleware that emulates the Vercel serverless function
 * /api/live-match. This lets `npm run dev` work without needing Vercel CLI.
 * In production, the real serverless function in /api/live-match.js takes over.
 */
function liveMatchMiddleware(env) {
  const API_BASE = 'https://api.football-data.org/v4'
  const COMPETITION_ID = env.FOOTBALL_DATA_COMPETITION_ID || '2000'
  const API_KEY = env.FOOTBALL_DATA_API_KEY
  const CACHE_MAX_AGE = 60

  function normalizeTeamName(name) {
    if (!name) return ''
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
  }

  function isColombia(t) {
    const n = normalizeTeamName(t)
    return n === 'colombia' || n === 'col'
  }
  function isPortugal(t) {
    const n = normalizeTeamName(t)
    return n === 'portugal' || n === 'por' || n === 'prt'
  }

  function isColombiaVsPortugal(m) {
    const home = m.homeTeam?.name || m.homeTeam?.shortName || ''
    const away = m.awayTeam?.name || m.awayTeam?.shortName || ''
    return (isColombia(home) && isPortugal(away)) || (isPortugal(home) && isColombia(away))
  }

  function normalizeMatchData(match) {
    let home = match.homeTeam
    let away = match.awayTeam
    let homeScore = match.score?.fullTime?.home ?? 0
    let awayScore = match.score?.fullTime?.away ?? 0
    let halfHome = match.score?.halfTime?.home ?? null
    let halfAway = match.score?.halfTime?.away ?? null
    let penHome = match.score?.penalties?.home ?? null
    let penAway = match.score?.penalties?.away ?? null

    if (isPortugal(home.name) && isColombia(away.name)) {
      // swap so Colombia is always "home"
      ;[home, away] = [away, home]
      ;[homeScore, awayScore] = [awayScore, homeScore]
      ;[halfHome, halfAway] = [halfAway, halfHome]
      ;[penHome, penAway] = [penAway, penHome]
    }

    return {
      id: match.id,
      utcDate: match.utcDate,
      status: match.status,
      homeTeam: { id: home.id, name: home.name, shortName: home.shortName, crest: home.crest },
      awayTeam: { id: away.id, name: away.name, shortName: away.shortName, crest: away.crest },
      score: {
        fullTime: { home: homeScore, away: awayScore },
        halfTime: { home: halfHome, away: halfAway },
        penalties: { home: penHome, away: penAway },
      },
      competition: match.competition?.name,
      matchday: match.matchday,
      venue: match.venue,
    }
  }

  async function fetchFromFootballData(url) {
    const res = await fetch(url, { headers: { 'X-Auth-Token': API_KEY || '' } })
    if (!res.ok) {
      const err = new Error(`football-data.org ${res.status}`)
      err.status = res.status
      throw err
    }
    return res.json()
  }

  return async function middleware(req, res, next) {
    if (req.url !== '/api/live-match') return next()
    if (req.method !== 'GET') return next()

    try {
      // Try competition-scoped first, then fall back to all matches
      let data
      try {
        data = await fetchFromFootballData(`${API_BASE}/competitions/${COMPETITION_ID}/matches`)
      } catch (e) {
        if (e.status === 404) {
          data = await fetchFromFootballData(`${API_BASE}/matches`)
        } else {
          throw e
        }
      }

      const matches = data.matches || []
      const target = matches.find(isColombiaVsPortugal)

      if (!target) {
        res.setHeader('Content-Type', 'application/json')
        res.setHeader('Cache-Control', `public, s-maxage=${CACHE_MAX_AGE}, stale-while-revalidate=30`)
        res.statusCode = 200
        res.end(JSON.stringify({ found: false, message: 'Colombia vs Portugal no encontrado en la API' }))
        return
      }

      res.setHeader('Content-Type', 'application/json')
      res.setHeader('Cache-Control', `public, s-maxage=${CACHE_MAX_AGE}, stale-while-revalidate=30`)
      res.statusCode = 200
      res.end(JSON.stringify({ found: true, match: normalizeMatchData(target) }))
    } catch (err) {
      console.error('[api/live-match]', err.message)
      res.setHeader('Content-Type', 'application/json')
      if (err.status === 429) {
        res.statusCode = 429
        res.end(JSON.stringify({ error: 'rate_limited', message: 'Demasiadas solicitudes, intenta en un minuto' }))
      } else {
        res.statusCode = 502
        res.end(JSON.stringify({ error: 'upstream_error', message: err.message || 'Error desconocido' }))
      }
    }
  }
}

/**
 * Dev-only stub for /api/analisis. In production, Vercel runs
 * api/analisis.js as a serverless function. Locally we proxy
 * the request through the same DeepSeek call so the bot works
 * in `npm run dev` too.
 */
function analisisMiddleware(env) {
  const DEEPSEEK_URL = 'https://api.deepseek.com/v1/chat/completions'
  const DEEPSEEK_MODEL = env.DEEPSEEK_MODEL || 'deepseek-chat'

  const SYSTEM_PROMPT = `Eres un analista deportivo amigable que ayuda a una familia a divertirse pronosticando un partido de fútbol. Tu tono es cercano, claro y visual (usas emojis y bullets). Hablas en español de Colombia.

REGLAS:
- Sé BREVE. Máximo 200 palabras.
- Da una recomendación clara.
- Considera: estado del partido, marcador real si existe, y los pronósticos de la familia.
- NO inventes datos que no te di.
- Responde con markdown breve: ## Análisis · 🎯 Recomendación · 📊 Tendencia familiar · ⚠️ Dato clave`

  return async function middleware(req, res, next) {
    if (req.url !== '/api/analisis') return next()
    if (req.method !== 'POST') return next()

    const apiKey = env.DEEPSEEK_API_KEY
    if (!apiKey) {
      res.statusCode = 503
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ error: 'no_api_key', message: 'DeepSeek no está configurado. Agrega DEEPSEEK_API_KEY en .env' }))
      return
    }

    let raw = ''
    req.on('data', chunk => { raw += chunk })
    req.on('end', async () => {
      let body
      try { body = raw ? JSON.parse(raw) : {} } catch { body = {} }
      const family = body.family_predictions || []
      const match = body.match || {}
      const user = body.user_prediction
      const isLive = ['IN_PLAY', 'PAUSED', 'FINISHED'].includes(match.status)
      const lines = []
      lines.push(`Partido: ${match.home || 'Colombia'} vs ${match.away || 'Portugal'}`)
      lines.push(`Competición: ${match.competition || 'Mundial FIFA 2026'}`)
      lines.push(`Estado: ${isLive ? 'EN VIVO' + (match.score ? ` ${match.score.home}-${match.score.away}` : '') : 'AÚN NO EMPIEZA'}`)
      if (match.kickoff) lines.push(`Kickoff: ${match.kickoff}`)
      if (family.length) {
        lines.push('')
        lines.push(`Pronósticos de la familia (${family.length}):`)
        family.forEach(p => lines.push(`- ${p.display_name}: ${p.colombia}-${p.portugal}`))
        const tally = {}
        family.forEach(p => { const k = `${p.colombia}-${p.portugal}`; tally[k] = (tally[k] || 0) + 1 })
        const top = Object.entries(tally).sort((a, b) => b[1] - a[1])[0]
        if (top) lines.push(`Consenso: ${top[0]} con ${top[1]} votos`)
      } else {
        lines.push('')
        lines.push('Aún no hay pronósticos de la familia.')
      }
      if (user) lines.push(`El usuario va: ${user.colombia}-${user.portugal}`)
      lines.push('')
      lines.push('Da un análisis breve, una recomendación clara y un dato clave. Tono familiar.')

      try {
        const upstream = await fetch(DEEPSEEK_URL, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: DEEPSEEK_MODEL,
            messages: [
              { role: 'system', content: SYSTEM_PROMPT },
              { role: 'user', content: lines.join('\n') },
            ],
            max_tokens: 600,
            temperature: 0.8,
          }),
        })
        if (!upstream.ok) {
          res.statusCode = upstream.status
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'upstream_error', status: upstream.status }))
          return
        }
        const data = await upstream.json()
        const content = data?.choices?.[0]?.message?.content || ''
        res.setHeader('Content-Type', 'application/json')
        res.statusCode = 200
        res.end(JSON.stringify({ analysis: content, model: DEEPSEEK_MODEL }))
      } catch (err) {
        res.statusCode = 502
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ error: 'network', message: err?.message || 'Error de red' }))
      }
    })
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'api-middleware',
        configureServer(server) {
          server.middlewares.use(liveMatchMiddleware(env))
          server.middlewares.use(analisisMiddleware(env))
        },
      },
    ],
    server: {
      host: true,
      port: 5173,
    },
  }
})
