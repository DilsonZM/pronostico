import { motion } from 'framer-motion'

export default function LoadingScreen({ message = 'Cargando...' }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark-900">
      <div className="flex flex-col items-center gap-6">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="relative w-16 h-16"
        >
          <div className="absolute inset-0 rounded-full border-2 border-colombia-yellow/20" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-colombia-yellow" />
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-dark-400 text-sm font-medium tracking-wide"
        >
          {message}
        </motion.p>
      </div>
    </div>
  )
}
