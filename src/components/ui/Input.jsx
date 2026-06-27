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
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl pointer-events-none z-10">
            {icon}
          </span>
        )}
        <input
          ref={ref}
          style={{
            background: 'rgba(15, 23, 42, 0.7)',
            color: '#ffffff',
            border: error ? '2px solid #ef4444' : '1px solid rgba(255, 255, 255, 0.15)',
          }}
          className={`
            w-full px-4 py-4 rounded-xl
            text-white text-lg font-medium
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
