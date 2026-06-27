import { motion } from 'framer-motion'

/**
 * PageContainer — floating island layout
 *
 * On small viewports the content sits within the viewport with breathing room.
 * On larger viewports (sm+), the content stays at a comfortable max width
 * and the background is visible on both sides, creating the illusion
 * of a floating card on a colored canvas.
 *
 * The content column has the SAME width as the Header so brand and content
 * line up perfectly.
 */
export default function PageContainer({
  children,
  className = '',
  py = 'py-6 sm:py-8',
  gap = 'gap-6',
  background = 'radial-gradient(ellipse at top, #1e293b 0%, #0f172a 50%, #020617 100%)',
  width = 'sm', // 'sm' = max-w-md (default), 'xs' = max-w-sm, 'md' = max-w-md
}) {
  const maxW =
    width === 'xs' ? 'max-w-[360px]'
      : width === 'md' ? 'max-w-md'
        : 'max-w-md'

  return (
    <div
      className={`min-h-[100dvh] ${className}`}
      style={{ background }}
    >
      <div className={`w-full ${maxW} mx-auto px-5 sm:px-7 ${py} flex flex-col ${gap}`}>
        {children}
      </div>
    </div>
  )
}
