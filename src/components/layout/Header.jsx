import { motion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import { UserBadge } from '../ui'

/**
 * Header
 *
 * Top bar: brand on the left, optional user badge + actions on the right.
 * Never overlaps the central logo — the user badge sits in the right slot.
 */
export default function Header({ onAdminClick }) {
  const { isAuthenticated, profile, signOut } = useAuth()

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="sticky top-0 z-40 border-b border-white/8 bg-slate-900/85 backdrop-blur-xl"
    >
      <div className="max-w-lg mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-slate-800/70 border border-white/10 flex items-center justify-center text-base shrink-0">
            ⚽
          </div>
          <div className="min-w-0">
            <h1 className="font-display text-xs sm:text-sm font-bold text-white tracking-widest leading-none">
              PRONÓSTICO
            </h1>
            <p className="text-[9px] sm:text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">
              Colombia vs Portugal
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isAuthenticated && profile && (
            <UserBadge name={profile.display_name} />
          )}

          {isAuthenticated && (
            <>
              {onAdminClick && (
                <button
                  onClick={onAdminClick}
                  className="w-9 h-9 rounded-xl text-slate-400 hover:text-white hover:bg-white/8 transition-colors flex items-center justify-center"
                  title="Admin"
                  aria-label="Admin"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M12 1v6m0 6v6m-7.7-3.7 4.2-4.2m4.2-4.2 4.2-4.2M1 12h6m6 0h6" />
                  </svg>
                </button>
              )}
              <button
                onClick={signOut}
                className="w-9 h-9 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors flex items-center justify-center"
                title="Salir"
                aria-label="Salir"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>
    </motion.header>
  )
}
