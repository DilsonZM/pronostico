/**
 * Vercel Serverless Function: /api/analisis
 *
 * Calls DeepSeek to produce a pre-match / live-match analysis
 * for the family prediction game. The API key is kept server-side.
 *
 * POST body: {
 *   family_predictions: [{ display_name, colombia, portugal }],
 *   match: { home, away, status, score, kickoff, competition },
 *   user_prediction?: { colombia, portugal } | null
 * }
 */

const DEEPSEEK_URL = 'https://api.deepseek.com/v1/chat/completions'
const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL || 'deepseek-chat'

// Compact, family-friendly system prompt in Spanish
const SYSTEM_PROMPT = `Eres un analista deportivo amigable que ayuda a una familia a divertirse pronosticando un partido de fútbol. Tu tono es cercano, claro y visual (usas emojis y bullets). Hablas en español de Colombia.

REGLAS:
- Sé BREVE. Máximo 200 palabras.
- Da una recomendación clara: a quién le va mejor, o si conviene el empate.
- Considera: estado del partido (si está en juego, finalizado o por empezar), marcador real si existe, y los pronósticos de la familia.
- Si los pronósticos están muy divididos, menciónalo y recomienda al "consenso" o al "underdog" según el caso.
- NO inventes datos que no te di. Si falta información, trabaja solo con lo que recibiste.
- Si hay marcador en vivo, úsalo para decir si el partido va "abierto" o "sentenciado".
- Responde con markdown breve: ## Análisis · 🎯 Recomendación · 📊 Tendencia familiar · ⚠️ Dato clave`

function buildUserPrompt(body) {
  const { family_predictions = [], match = {}, user_prediction = null } = body
  const isLive = match.status === 'IN_PLAY' || match.status === 'PAUSED' || match.status === 'FINISHED'
  const statusText = isLive
    ? `EN VIVO${match.score ? ` — Marcador actual: ${match.score.home}-${match.score.away}` : ''}`
    : 'AÚN NO EMPIEZA'

  const lines = []
  lines.push(`Partido: ${match.home || 'Colombia'} vs ${match.away || 'Portugal'}`)
  lines.push(`Competición: ${match.competition || 'Mundial FIFA 2026'}`)
  lines.push(`Estado: ${statusText}`)
  if (match.kickoff) lines.push(`Kickoff: ${match.kickoff}`)

  if (family_predictions.length) {
    lines.push('')
    lines.push(`Pronósticos de la familia (${family_predictions.length}):`)
    for (const p of family_predictions) {
      lines.push(`- ${p.display_name}: ${p.colombia}-${p.portugal}`)
    }
    // consensus
    const tally = {}
    for (const p of family_predictions) {
      const key = `${p.colombia}-${p.portugal}`
      tally[key] = (tally[key] || 0) + 1
    }
    const top = Object.entries(tally).sort((a, b) => b[1] - a[1])[0]
    if (top) {
      lines.push('')
      lines.push(`Consenso (el más votado): ${top[0]} con ${top[1]} votos`)
    }
  } else {
    lines.push('')
    lines.push('Aún no hay pronósticos de la familia.')
  }

  if (user_prediction) {
    lines.push('')
    lines.push(`El usuario que pide el análisis va: ${user_prediction.colombia}-${user_prediction.portugal}`)
  }

  lines.push('')
  lines.push('Da un análisis breve, una recomendación clara y un dato clave. Tono familiar y cercano.')
  return lines.join('\n')
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    res.statusCode = 405
    res.end(JSON.stringify({ error: 'method_not_allowed' }))
    return
  }

  const apiKey = process.env.DEEPSEEK_API_KEY
  if (!apiKey) {
    res.statusCode = 503
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({
      error: 'no_api_key',
      message: 'DeepSeek no está configurado. Agrega DEEPSEEK_API_KEY en Vercel.',
    }))
    return
  }

  let body = req.body
  // Vercel a veces entrega body como string si no se parseó
  if (typeof body === 'string') {
    try { body = JSON.parse(body) } catch { body = {} }
  }
  body = body || {}

  const userPrompt = buildUserPrompt(body)

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
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 600,
        temperature: 0.8,
        stream: false,
      }),
    })

    if (!upstream.ok) {
      const errText = await upstream.text().catch(() => '')
      res.statusCode = upstream.status
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({
        error: 'upstream_error',
        status: upstream.status,
        message: errText.slice(0, 200) || 'DeepSeek rechazó la solicitud',
      }))
      return
    }

    const data = await upstream.json()
    const content = data?.choices?.[0]?.message?.content || ''

    res.setHeader('Content-Type', 'application/json')
    res.setHeader('Cache-Control', 'no-store')
    res.statusCode = 200
    res.end(JSON.stringify({
      analysis: content,
      model: DEEPSEEK_MODEL,
    }))
  } catch (err) {
    console.error('[api/analisis]', err)
    res.statusCode = 502
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({
      error: 'network',
      message: err?.message || 'Error de red al consultar DeepSeek',
    }))
  }
}
