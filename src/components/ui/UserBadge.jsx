import { motion } from 'framer-motion'

/**
 * UserBadge
 *
 * Discrete user pill shown in the header. The first letter of the display name
 * lives inside a small avatar. Never overlaps the central logo.
 */
export default function UserBadge({ name, align = 'right' }) {
  if (!name) return null
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join('')

  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`inline-flex items-center gap-2 rounded-full bg-slate-800/70 border border-white/8 pl-1 pr-3 py-1 ${
        align === 'left' ? 'flex-row' : 'flex-row-reverse'
      }`}
    >
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center font-display text-[11px] font-bold text-slate-900"
        style={{
          background: 'linear-gradient(135deg, #FCD116 0%, #006600 100%)',
        }}
        aria-hidden="true"
      >
        {initials || '👤'}
      </div>
      <span className="text-xs font-semibold text-white max-w-[120px] truncate">{name}</span>
    </motion.div>
  )
}
