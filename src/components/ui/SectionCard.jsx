import { motion } from 'framer-motion'

/**
 * SectionCard — sans-serif, generous padding, no glow
 */
export default function SectionCard({
  children,
  eyebrow,
  title,
  right,
  className = '',
  delay = 0,
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35, ease: 'easeOut' }}
      className={`
        w-full rounded-2xl
        bg-slate-900/70 border border-white/8
        px-5 py-5
        ${className}
      `}
    >
      {(eyebrow || title || right) && (
        <header className="flex items-start justify-between gap-3 mb-4">
          <div className="min-w-0">
            {eyebrow && (
              <p className="text-[10px] font-semibold tracking-[0.18em] uppercase text-slate-500 mb-1">
                {eyebrow}
              </p>
            )}
            {title && (
              <h2 className="text-base font-semibold text-white tracking-tight leading-tight">
                {title}
              </h2>
            )}
          </div>
          {right && <div className="shrink-0">{right}</div>}
        </header>
      )}
      {children}
    </motion.section>
  )
}
