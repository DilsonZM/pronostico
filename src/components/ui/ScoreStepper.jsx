import { motion } from 'framer-motion'

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
    if (!disabled && value < max) {
      onChange(value + 1)
    }
  }

  const decrement = () => {
    if (!disabled && value > min) {
      onChange(value - 1)
    }
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
      btn: 'bg-colombia-yellow/10 text-colombia-yellow hover:bg-colombia-yellow/20',
      value: 'text-colombia-yellow',
      border: 'border-colombia-yellow/20',
    },
    'portugal-green': {
      btn: 'bg-portugal-green/10 text-emerald-400 hover:bg-portugal-green/20',
      value: 'text-emerald-400',
      border: 'border-portugal-green/20',
    },
  }

  const colors = colorClasses[teamColor] || colorClasses['colombia-yellow']

  return (
    <div className="flex flex-col items-center gap-3">
      <span className="text-xs font-medium text-slate-400 uppercase tracking-widest">
        {teamName}
      </span>
      <div className={`
        number-stepper glass rounded-2xl overflow-hidden
        ${colors.border}
        ${disabled ? 'opacity-50' : ''}
      `}>
        <motion.button
          type="button"
          whileTap={{ scale: 0.9 }}
          onClick={decrement}
          disabled={disabled || value <= min}
          className={`${colors.btn} disabled:opacity-30 rounded-l-2xl`}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M5 10h10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
        </motion.button>
        <input
          type="number"
          className={`score-input ${colors.value} font-display`}
          value={value}
          onChange={handleInputChange}
          min={min}
          max={max}
          disabled={disabled}
        />
        <motion.button
          type="button"
          whileTap={{ scale: 0.9 }}
          onClick={increment}
          disabled={disabled || value >= max}
          className={`${colors.btn} disabled:opacity-30 rounded-r-2xl`}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 5v10M5 10h10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
        </motion.button>
      </div>
    </div>
  )
}
