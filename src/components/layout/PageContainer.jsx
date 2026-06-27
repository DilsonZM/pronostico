/**
 * PageContainer — minimal padding, sans-serif everywhere
 */
export default function PageContainer({
  children,
  className = '',
  py = 'py-5 sm:py-7',
  gap = 'gap-5',
}) {
  return (
    <div className={`min-h-[100dvh] ${className}`} style={{ background: '#020617' }}>
      <div className="w-full max-w-md mx-auto px-5 sm:px-6 py-6 flex flex-col gap-5">
        {children}
      </div>
    </div>
  )
}
