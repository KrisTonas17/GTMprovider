'use client'

interface InputFieldProps {
  label: string
  value: number | string
  onChange: (val: number) => void
  type?: 'number' | 'text'
  min?: number
  max?: number
  step?: number
  prefix?: string
  suffix?: string
  hint?: string
}

export default function InputField({
  label, value, onChange, type = 'number',
  min, max, step = 1, prefix, suffix, hint,
}: InputFieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-obsidian-500 uppercase tracking-wider">
        {label}
      </label>
      <div className="relative flex items-center">
        {prefix && (
          <span className="absolute left-3 text-obsidian-500 text-sm pointer-events-none">
            {prefix}
          </span>
        )}
        <input
          type={type}
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={e => onChange(parseFloat(e.target.value) || 0)}
          className={`input-field ${prefix ? 'pl-7' : ''} ${suffix ? 'pr-12' : ''}`}
        />
        {suffix && (
          <span className="absolute right-3 text-obsidian-500 text-xs pointer-events-none">
            {suffix}
          </span>
        )}
      </div>
      {hint && <p className="text-xs text-obsidian-600">{hint}</p>}
    </div>
  )
}
