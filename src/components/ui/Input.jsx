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
        <label className="block text-sm font-medium text-dark-300 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400 text-lg">
            {icon}
          </span>
        )}
        <input
          ref={ref}
          className={`
            w-full px-4 py-3.5 rounded-xl
            glass text-white text-lg font-medium
            placeholder:text-dark-500
            focus:outline-none focus:ring-2 focus:ring-colombia-yellow/50 focus:border-colombia-yellow/50
            transition-all duration-200
            ${icon ? 'pl-12' : ''}
            ${error ? 'ring-2 ring-red-500/50 border-red-500/50' : ''}
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
