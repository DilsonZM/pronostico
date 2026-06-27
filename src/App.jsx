import { useMemo, useState, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useAuth } from './context/AuthContext'
import { Header, Footer } from './components/layout'
import { LoadingScreen, ChatBot } from './components/ui'
import { Landing, Login, Prediction, MyPrediction, Admin } from './pages'
import { useRealtimePredictions } from './hooks/useRealtimePredictions'
import { useLiveMatch } from './hooks/useLiveMatch'

const PAGES = {
  LANDING: 'landing',
  LOGIN: 'login',
  PREDICTION: 'prediction',
  MY_PREDICTION: 'my_prediction',
  ADMIN: 'admin',
}

const pageTransition = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.3, ease: 'easeInOut' },
}

export default function App() {
  const { isAuthenticated, loading: authLoading } = useAuth()
  const [currentPage, setCurrentPage] = useState(PAGES.LANDING)

  const navigate = useCallback((page) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  if (authLoading) {
    return <LoadingScreen message="Preparando tu experiencia..." />
  }

  const getPage = () => {
    if (!isAuthenticated) {
      switch (currentPage) {
        case PAGES.LOGIN:
          return (
            <Login
              onSuccess={() => navigate(PAGES.PREDICTION)}
              onBack={() => navigate(PAGES.LANDING)}
            />
          )
        default:
          return <Landing />
      }
    }

    switch (currentPage) {
      case PAGES.ADMIN:
        return <Admin onBack={() => navigate(PAGES.PREDICTION)} />
      case PAGES.MY_PREDICTION:
        return (
          <MyPrediction
            onEdit={() => navigate(PAGES.PREDICTION)}
            onBack={() => navigate(PAGES.PREDICTION)}
          />
        )
      case PAGES.PREDICTION:
      default:
        return (
          <Prediction
            onViewPrediction={() => navigate(PAGES.MY_PREDICTION)}
          />
        )
    }
  }

  const showHeader = isAuthenticated

  return (
    <div
      className="min-h-[100dvh] flex flex-col"
      style={{ background: '#020617' }}
    >
      {showHeader && (
        <Header onAdminClick={() => navigate(PAGES.ADMIN)} />
      )}

      <main className="flex-1 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            {...pageTransition}
            className="min-h-full"
          >
            {getPage()}
          </motion.div>
        </AnimatePresence>
      </main>

      <Footer />

      {/* Floating chat bot (only when authenticated) */}
      {isAuthenticated && <ChatBotWrapper />}
    </div>
  )
}

/**
 * ChatBotWrapper — gathers live match + family predictions and passes
 * them to the ChatBot as context. The bot uses this to give specific
 * advice and refuse off-topic questions.
 */
function ChatBotWrapper() {
  const { predictions } = useRealtimePredictions()
  const { match: liveMatch } = useLiveMatch()

  const context = useMemo(() => ({
    family_predictions: predictions.map((p) => ({
      display_name: p.profile?.display_name || 'Anónimo',
      colombia: p.colombia_score,
      portugal: p.portugal_score,
    })),
    match: liveMatch
      ? {
          home: liveMatch.homeTeam?.name || 'Colombia',
          away: liveMatch.awayTeam?.name || 'Portugal',
          status: liveMatch.status,
          score: liveMatch.score?.fullTime
            ? { home: liveMatch.score.fullTime.home, away: liveMatch.score.fullTime.away }
            : null,
          kickoff: liveMatch.utcDate,
          competition: liveMatch.competition || 'Mundial FIFA 2026',
        }
      : {
          home: 'Colombia',
          away: 'Portugal',
          status: 'TIMED',
          competition: 'Mundial FIFA 2026',
        },
  }), [predictions, liveMatch])

  return <ChatBot context={context} />
}
