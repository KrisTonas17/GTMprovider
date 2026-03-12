'use client'

import { type ReactNode } from 'react'
import clsx from 'clsx'

interface MetricCardProps {
  label: string
  value: string | ReactNode
  sub?: string
  accent?: 'jade' | 'gold' | 'azure' | 'crimson'
  icon?: ReactNode
  className?: string
  delay?: number
}

const accentStyles = {
  jade:    { border: 'border-jade-500/20',   text: 'text-jade-400',   glow: 'metric-glow-jade',   dot: 'bg-jade-400' },
  gold:    { border: 'border-gold-400/20',   text: 'text-gold-400',   glow: 'metric-glow-gold',   dot: 'bg-gold-400' },
  azure:   { border: 'border-azure-400/20',  text: 'text-azure-400',  glow: 'metric-glow-azure',  dot: 'bg-azure-400' },
  crimson: { border: 'border-crimson-400/20',text: 'text-crimson-400',glow: '',                    dot: 'bg-crimson-400' },
}

export default function MetricCard({
  label, value, sub, accent = 'jade', icon, className, delay = 0,
}: MetricCardProps) {
  const s = accentStyles[accent]
  return (
    <div
      className={clsx(
        'card p-5 flex flex-col gap-2 animate-fade-up',
        s.border, s.glow, className
      )}
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'both' }}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-obsidian-500 uppercase tracking-widest">{label}</span>
        {icon && <span className={clsx('opacity-60', s.text)}>{icon}</span>}
      </div>
      <div className={clsx('text-2xl font-display font-semibold', s.text)}>
        {value}
      </div>
      {sub && <p className="text-xs text-obsidian-500">{sub}</p>}
    </div>
  )
}
