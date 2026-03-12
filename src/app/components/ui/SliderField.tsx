'use client'

interface SliderFieldProps {
  label: string
  value: number
  onChange: (val: number) => void
  min: number
  max: number
  step?: number
  display?: (v: number) => string
}

export default function SliderField({
  label, value, onChange, min, max, step = 1, display,
}: SliderFieldProps) {
  const pct = ((value - min) / (max - min)) * 100

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <label className="text-xs font-medium text-obsidian-500 uppercase tracking-wider">
          {label}
        </label>
        <span className="text-sm font-mono text-jade-400 font-medium">
          {display ? display(value) : value}
        </span>
      </div>
      <div className="relative">
        <div className="absolute top-1/2 -translate-y-1/2 left-0 h-1 bg-jade-500/40 rounded-full pointer-events-none"
          style={{ width: `${pct}%` }}
        />
        <input
          type="range"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={e => onChange(parseFloat(e.target.value))}
          className="w-full relative z-10"
        />
      </div>
      <div className="flex justify-between text-xs text-obsidian-600">
        <span>{display ? display(min) : min}</span>
        <span>{display ? display(max) : max}</span>
      </div>
    </div>
  )
}
