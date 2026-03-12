interface SectionHeaderProps {
  title: string
  subtitle?: string
  action?: React.ReactNode
}

export default function SectionHeader({ title, subtitle, action }: SectionHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
      <div>
        <h2 className="text-lg font-display text-white">{title}</h2>
        {subtitle && <p className="text-sm text-obsidian-500 mt-0.5">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
