'use client'

import { useState, useMemo } from 'react'
import { MapPin, TrendingUp, Users, DollarSign, Zap, ChevronUp, ChevronDown } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts'
import { scoreMarkets, simulateTerritory, formatCurrency } from '@/lib/calculations'
import { DEFAULT_MARKETS } from '@/lib/defaults'
import MetricCard from '@/app/components/ui/MetricCard'

const TIER_COLORS = { 1: '#3DD68C', 2: '#F5C842', 3: '#484F58' }

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string }[]; label?: string }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-obsidian-800 border border-obsidian-600 rounded-lg px-3 py-2 text-xs">
      <p className="text-white font-medium mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-jade-400">{p.name}: {p.name === 'Revenue' ? formatCurrency(p.value) : p.value}</p>
      ))}
    </div>
  )
}

export default function TerritorySimulator() {
  const scored = useMemo(() => scoreMarkets(DEFAULT_MARKETS), [])

  const [allocations, setAllocations] = useState<Record<string, number>>(
    Object.fromEntries(scored.map(m => [m.id, m.tier === 1 ? 3 : m.tier === 2 ? 2 : 1]))
  )

  const setReps = (id: string, val: number) =>
    setAllocations(prev => ({ ...prev, [id]: Math.max(0, Math.min(10, val)) }))

  const allocationList = useMemo(
    () => Object.entries(allocations).map(([marketId, reps]) => ({ marketId, reps })),
    [allocations]
  )

  const result = useMemo(
    () => simulateTerritory(scored, allocationList),
    [scored, allocationList]
  )

  const totalReps = allocationList.reduce((s, a) => s + a.reps, 0)
  const avgRevPerRep = totalReps > 0 ? result.totalRevenue / totalReps : 0

  const barData = result.allocations.map(a => ({
    city: a.market.city.length > 12 ? a.market.city.slice(0, 12) + '…' : a.market.city,
    Revenue: Math.round(a.revenue),
    tier: a.market.tier,
  }))

  const pieData = result.allocations.map(a => ({
    name: a.market.city,
    value: Math.round(a.revenue),
    tier: a.market.tier,
  }))

  return (
    <div className="space-y-6">
      {/* Header callout */}
      <div className="card p-4 border-azure-400/20 bg-azure-400/5 flex items-start gap-3">
        <Zap size={16} className="text-azure-400 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-medium text-white">Territory Scenario Simulator</p>
          <p className="text-xs text-obsidian-400 mt-0.5">
            Allocate reps across markets to project total territory revenue. Tier 1 markets yield 1.4× baseline; Tier 2 = 1.1×; Tier 3 = 0.85×. Baseline: $800K/rep/year.
          </p>
        </div>
      </div>

      {/* Summary metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard
          label="Total Revenue"
          value={formatCurrency(result.totalRevenue)}
          sub="Projected annual"
          icon={<DollarSign size={16} />}
          accent="jade"
          delay={0}
        />
        <MetricCard
          label="Total Reps"
          value={totalReps.toString()}
          sub="Across all markets"
          icon={<Users size={16} />}
          accent="azure"
          delay={60}
        />
        <MetricCard
          label="Rev / Rep"
          value={formatCurrency(avgRevPerRep)}
          sub="Blended average"
          icon={<TrendingUp size={16} />}
          accent="gold"
          delay={120}
        />
        <MetricCard
          label="Total Partnerships"
          value={result.allocations.reduce((s, a) => s + a.partnerships, 0).toLocaleString()}
          sub="Annual across territory"
          icon={<MapPin size={16} />}
          accent="jade"
          delay={180}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Allocation controls */}
        <div className="card overflow-hidden">
          <div className="px-4 py-3 border-b border-obsidian-700">
            <h3 className="text-sm font-medium text-white">Rep Allocation</h3>
            <p className="text-xs text-obsidian-500 mt-0.5">Set reps per market (0–10)</p>
          </div>
          <div className="divide-y divide-obsidian-800">
            {scored.map(market => {
              const reps = allocations[market.id] || 0
              const alloc = result.allocations.find(a => a.market.id === market.id)
              return (
                <div key={market.id} className="px-4 py-3 flex items-center gap-4 hover:bg-obsidian-800/40 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-medium text-white truncate">{market.city}</span>
                      <span
                        className="text-xs px-1.5 py-0.5 rounded-full border font-medium shrink-0"
                        style={{
                          color: TIER_COLORS[market.tier],
                          backgroundColor: `${TIER_COLORS[market.tier]}15`,
                          borderColor: `${TIER_COLORS[market.tier]}30`,
                        }}
                      >
                        T{market.tier}
                      </span>
                    </div>
                    <p className="text-xs text-obsidian-500">
                      {reps > 0 ? formatCurrency(alloc?.revenue || 0) + ' projected' : 'No reps assigned'}
                    </p>
                  </div>

                  {/* Rep counter */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setReps(market.id, reps - 1)}
                      className="w-7 h-7 rounded-md bg-obsidian-700 hover:bg-obsidian-600 flex items-center justify-center text-obsidian-400 hover:text-white transition-all"
                    >
                      <ChevronDown size={14} />
                    </button>
                    <span className="w-8 text-center font-mono text-sm font-medium text-white">
                      {reps}
                    </span>
                    <button
                      onClick={() => setReps(market.id, reps + 1)}
                      className="w-7 h-7 rounded-md bg-obsidian-700 hover:bg-jade-500/20 flex items-center justify-center text-obsidian-400 hover:text-jade-400 transition-all"
                    >
                      <ChevronUp size={14} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Quick allocate buttons */}
          <div className="px-4 py-3 border-t border-obsidian-700 flex flex-wrap gap-2">
            <span className="text-xs text-obsidian-500 self-center">Quick set:</span>
            {[
              { label: 'Tier-weighted', fn: () => setAllocations(Object.fromEntries(scored.map(m => [m.id, m.tier === 1 ? 3 : m.tier === 2 ? 2 : 1]))) },
              { label: 'Equal (2 each)', fn: () => setAllocations(Object.fromEntries(scored.map(m => [m.id, 2]))) },
              { label: 'Tier 1 only', fn: () => setAllocations(Object.fromEntries(scored.map(m => [m.id, m.tier === 1 ? 4 : 0]))) },
              { label: 'Reset all', fn: () => setAllocations(Object.fromEntries(scored.map(m => [m.id, 0]))) },
            ].map(opt => (
              <button
                key={opt.label}
                onClick={opt.fn}
                className="text-xs px-2.5 py-1 bg-obsidian-800 hover:bg-obsidian-700 border border-obsidian-600 hover:border-obsidian-500 rounded text-obsidian-400 hover:text-white transition-all"
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Charts */}
        <div className="space-y-4">
          <div className="card p-4">
            <h3 className="text-sm font-medium text-obsidian-400 mb-4">Revenue by Market</h3>
            {barData.length > 0 && barData.some(d => d.Revenue > 0) ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={barData} margin={{ top: 0, right: 8, left: -10, bottom: 0 }}>
                  <XAxis dataKey="city" tick={{ fontSize: 11, fill: '#484F58' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#484F58' }} axisLine={false} tickLine={false}
                    tickFormatter={v => `$${(v / 1000000).toFixed(1)}M`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="Revenue" radius={[4, 4, 0, 0]} maxBarSize={50}>
                    {barData.map((entry, i) => (
                      <Cell key={i} fill={TIER_COLORS[entry.tier as 1 | 2 | 3]} opacity={0.85} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-obsidian-600 text-sm">
                Assign reps to see projections
              </div>
            )}
          </div>

          {/* Summary table */}
          {result.allocations.length > 0 && (
            <div className="card overflow-hidden">
              <div className="px-4 py-2 border-b border-obsidian-700">
                <h3 className="text-sm font-medium text-obsidian-400">Scenario Summary</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full data-table">
                  <thead>
                    <tr>
                      <th>Market</th>
                      <th>Reps</th>
                      <th>Revenue</th>
                      <th>Partnerships</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.allocations.map(a => (
                      <tr key={a.market.id}>
                        <td className="font-medium text-white">{a.market.city}</td>
                        <td className="font-mono text-azure-400">{a.reps}</td>
                        <td className="font-mono text-jade-400">{formatCurrency(a.revenue)}</td>
                        <td className="text-obsidian-400">{a.partnerships}</td>
                      </tr>
                    ))}
                    <tr className="bg-obsidian-800/60">
                      <td className="font-semibold text-white">Total</td>
                      <td className="font-mono font-semibold text-azure-400">{totalReps}</td>
                      <td className="font-mono font-semibold text-jade-400">{formatCurrency(result.totalRevenue)}</td>
                      <td className="font-semibold text-obsidian-300">
                        {result.allocations.reduce((s, a) => s + a.partnerships, 0)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
