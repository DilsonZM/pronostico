import { motion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import { Button } from '../ui'

export default function Header({ onAdminClick }) {
  const { isAuthenticated, profile, signOut } = useAuth()

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-40 glass border-b border-white/5"
    >
      <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xl">⚽</span>
          <div>
            <h1 className="font-display text-sm font-bold text-white tracking-wider">
              PRONÓSTICO
            </h1>
            <p className="text-[10px] text-dark-500 uppercase tracking-widest">
              Colombia vs Portugal
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isAuthenticated && (
            <>
              <button
                onClick={onAdminClick}
                className="p-2 rounded-lg text-dark-400 hover:text-white hover:bg-white/5 transition-colors"
                title="Admin"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M12 1v6m0 6v6m-7.7-3.7 4.2-4.2m4.2-4.2 4.2-4.2M1 12h6m6 0h6M4.3 4.3l4.2 4.2m4.2 4.2 4.2 4.2"/>
                </svg>
              </button>
              <button
                onClick={signOut}
                className="p-2 rounded-lg text-dark-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                title="Salir"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
              </button>
            </>
          )}
        </div>
      </div>
    </motion.header>
  )
}
