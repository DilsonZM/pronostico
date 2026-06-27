import { motion } from 'framer-motion'

/**
 * PageContainer
 *
 * Single source of truth for the centered content column across the app.
 * - Same width as Header so brand and content align perfectly
 * - Same horizontal padding as Header so edges line up
 * - Vertical padding is customisable per page
 */
export default function PageContainer({
  children,
  className = '',
  py = 'py-6 sm:py-8',
  gap = 'gap-6',
  background = 'radial-gradient(ellipse at top, #1e293b 0%, #0f172a 50%, #020617 100%)',
}) {
  return (
    <div
      className={`min-h-[100dvh] ${className}`}
      style={{ background }}
    >
      <div className={`w-full max-w-md mx-auto px-4 sm:px-6 ${py} flex flex-col ${gap}`}>
        {children}
      </div>
    </div>
  )
}
