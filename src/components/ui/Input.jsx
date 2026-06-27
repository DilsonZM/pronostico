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
        <label className="block text-sm font-medium text-white mb-2 font-semibold">
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
            background: 'rgba(15, 23, 42, 0.9) !important',
            color: '#ffffff !important',
            border: error ? '2px solid #ef4444' : '1px solid rgba(255, 255, 255, 0.15)',
            fontSize: '1.125rem',
            fontWeight: '500',
          }}
          className={`
            w-full px-4 py-4 rounded-xl
            placeholder:text-slate-500
            focus:outline-none focus:ring-2 focus:ring-colombia-yellow
            transition-all duration-200
            ${icon ? 'pl-14' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 text-sm text-red-400 flex items-center gap-1"
        >
          <span>⚠</span> {error}
        </motion.p>
      )}
    </div>
  )
})

export default Input
