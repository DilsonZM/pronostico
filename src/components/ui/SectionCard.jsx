import { motion } from 'framer-motion'

/**
 * SectionCard
 *
 * Reusable container with consistent padding, border-radius,
 * border, and background. The building block of every screen.
 *
 * - `eyebrow` (small uppercase label) + `title` (display heading)
 *   establishes a clear visual hierarchy.
 * - Optional `right` slot for actions like a refresh button.
 */
export default function SectionCard({
  children,
  eyebrow,
  title,
  right,
  className = '',
  as: Tag = motion.section,
  delay = 0,
  variant = 'default',
}) {
  const variantClass = variant === 'solid'
    ? 'bg-slate-900/85 border-white/10'
    : 'bg-slate-800/55 border-white/8'

  return (
    <Tag
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: 'easeOut' }}
      className={`
        relative w-full rounded-3xl
        border ${variantClass}
        shadow-[0_8px_30px_rgba(0,0,0,0.35)]
        backdrop-blur-xl
        p-5 sm:p-6
        ${className}
      `}
    >
      {(eyebrow || title || right) && (
        <header className="flex items-start justify-between gap-3 mb-4">
          <div className="min-w-0">
            {eyebrow && (
              <p className="text-[10px] sm:text-xs font-semibold tracking-[0.18em] uppercase text-slate-400 mb-1">
                {eyebrow}
              </p>
            )}
            {title && (
              <h2 className="font-display text-lg sm:text-xl font-bold text-white tracking-wide leading-tight">
                {title}
              </h2>
            )}
          </div>
          {right && <div className="shrink-0">{right}</div>}
        </header>
      )}
      {children}
    </Tag>
  )
}
