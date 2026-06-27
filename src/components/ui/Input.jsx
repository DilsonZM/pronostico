import { forwardRef } from 'react'
import { motion } from 'framer-motion'

const Input = forwardRef(function Input({
  label,
  error,
  icon,
  className = '',
  ...props
}, ref) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-[10px] font-bold tracking-[0.18em] uppercase text-slate-400 mb-2.5">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span
            className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none z-10 flex items-center justify-center"
            style={{ width: '24px', height: '24px', color: '#FCD116' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </span>
        )}
        <input
          ref={ref}
          style={{
            background: 'rgba(2, 6, 23, 0.7)',
            color: '#ffffff',
            border: error ? '2px solid #ef4444' : '1px solid rgba(255, 255, 255, 0.1)',
          }}
          className={`
            w-full px-4 py-3.5 rounded-xl
            text-base font-medium
            placeholder:text-slate-500
            focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400/40
            transition-all duration-200
            ${icon ? 'pl-14' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2.5 text-sm text-red-400 flex items-center gap-1.5"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
          {error}
        </motion.p>
      )}
    </div>
  )
})

export default Input
