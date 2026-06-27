import { motion } from 'framer-motion'

/**
 * ScoreStepper — clean, with team color
 */
export default function ScoreStepper({
  value = 0,
  onChange,
  teamName,
  teamColor = 'colombia-yellow',
  disabled = false,
  min = 0,
  max = 99,
}) {
  const increment = () => {
    if (!disabled && value < max) onChange(value + 1)
  }
  const decrement = () => {
    if (!disabled && value > min) onChange(value - 1)
  }

  const handleInputChange = (e) => {
    const val = parseInt(e.target.value, 10)
    if (!isNaN(val) && val >= min && val <= max) {
      onChange(val)
    } else if (e.target.value === '') {
      onChange(0)
    }
  }

  const colorClasses = {
    'colombia-yellow': {
      btn: 'bg-yellow-500/10 text-yellow-300 hover:bg-yellow-500/20',
      value: 'text-yellow-300',
      border: 'border-yellow-500/20',
    },
    'portugal-green': {
      btn: 'bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20',
      value: 'text-emerald-300',
      border: 'border-emerald-500/20',
    },
  }
  const colors = colorClasses[teamColor] || colorClasses['colombia-yellow']

  return (
    <div className="flex flex-col items-center gap-2">
      {teamName && (
        <span className="text-[10px] font-semibold tracking-widest text-slate-500">
          {teamName}
        </span>
      )}
      <div className={`
        number-stepper rounded-xl overflow-hidden
        bg-slate-900/70 border ${colors.border}
        ${disabled ? 'opacity-50' : ''}
      `}>
        <motion.button
          type="button"
          whileTap={{ scale: 0.9 }}
          onClick={decrement}
          disabled={disabled || value <= min}
          className={`${colors.btn} disabled:opacity-30 rounded-l-xl`}
          aria-label="Disminuir"
        >
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
            <path d="M5 10h10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
        </motion.button>
        <input
          type="number"
          className={`score-input ${colors.value} font-mono font-bold`}
          value={value}
          onChange={handleInputChange}
          min={min}
          max={max}
          disabled={disabled}
          aria-label="Goles"
        />
        <motion.button
          type="button"
          whileTap={{ scale: 0.9 }}
          onClick={increment}
          disabled={disabled || value >= max}
          className={`${colors.btn} disabled:opacity-30 rounded-r-xl`}
          aria-label="Aumentar"
        >
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
            <path d="M10 5v10M5 10h10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
        </motion.button>
      </div>
    </div>
  )
}
