'use client'

import { useState, useMemo } from 'react'
import { PlusCircle, Trash2, TrendingUp, MapPin, Users, DollarSign, Stethoscope, Sparkles } from 'lucide-react'
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, Cell } from 'recharts'
import { scoreMarkets } from '@/lib/calculations'
import { DEFAULT_MARKETS } from '@/lib/defaults'
import type { Market, ScoredMarket } from '@/lib/types'
import MetricCard from '@/app/components/ui/MetricCard'
import SectionHeader from '@/app/components/ui/SectionHeader'

const EMPTY_MARKET = (): Market => ({
  id: Date.now().toString(),
  city: '',
  population: 500_000,
  medianIncome: 75_000,
  concierge: 30,
  medSpas: 50,
  specialtyClinics: 25,
  healthScore: 7,
})

const TIER_COLORS: Record<number, string> = {
  1: '#3DD68C',
  2: '#F5C842',
  3: '#484F58',
}

function TierBadge({ tier }: { tier: 1 | 2 | 3 }) {
  const labels = { 1: 'Tier 1', 2: 'Tier 2', 3: 'Tier 3' }
  const cls = { 1: 'tier-1', 2: 'tier-2', 3: 'tier-3' }
  return <span className={cls[tier]}>{labels[tier]}</span>
}

function ScoreBar({ score }: { score: number }) {
  const color = score >= 85 ? '#3DD68C' : score >= 70 ? '#F5C842' : '#484F58'
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-obsidian-700 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${score}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-sm font-mono font-medium w-8 text-right" style={{ color }}>
        {score}
      </span>
    </div>
  )
}

interface MarketFormProps {
  market: Market
  onChange: (m: Market) => void
  onRemove: () => void
  index: number
}

function MarketForm({ market, onChange, onRemove, index }: MarketFormProps) {
  const set = (field: keyof Market, val: number | string) =>
    onChange({ ...market, [field]: val })

  return (
    <div className="card p-4 animate-fade-up" style={{ animationDelay: `${index * 60}ms`, animationFillMode: 'both' }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MapPin size={14} className="text-jade-400" />
          <input
            type="text"
            value={market.city}
            onChange={e => set('city', e.target.value)}
            placeholder="City name..."
            className="bg-transparent text-sm font-medium text-white placeholder-obsidian-600 focus:outline-none border-b border-transparent focus:border-jade-500 pb-0.5 transition-colors"
          />
        </div>
        <button onClick={onRemove} className="p-1 text-obsidian-600 hover:text-crimson-400 transition-colors rounded">
          <Trash2 size={14} />
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {[
          { label: 'Population', field: 'population' as keyof Market, step: 10000 },
          { label: 'Median Income', field: 'medianIncome' as keyof Market, prefix: '$', step: 1000 },
          { label: 'Concierge Practices', field: 'concierge' as keyof Market, step: 1 },
          { label: 'Med Spas', field: 'medSpas' as keyof Market, step: 1 },
          { label: 'Specialty Clinics', field: 'specialtyClinics' as keyof Market, step: 1 },
        ].map(({ label, field, prefix, step }) => (
          <div key={field}>
            <label className="block text-xs text-obsidian-500 mb-1">{label}</label>
            <div className="relative">
              {prefix && <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-obsidian-500 text-xs">{prefix}</span>}
              <input
                type="number"
                value={market[field] as number}
                step={step}
                min={0}
                onChange={e => set(field, parseFloat(e.target.value) || 0)}
                className={`input-field text-sm ${prefix ? 'pl-5' : ''}`}
              />
            </div>
          </div>
        ))}

        <div>
          <label className="block text-xs text-obsidian-500 mb-1">
            Health Score <span className="text-jade-400">{market.healthScore}/10</span>
          </label>
          <input
            type="range"
            min={1} max={10} step={1}
            value={market.healthScore}
            onChange={e => set('healthScore', parseInt(e.target.value))}
            className="w-full mt-2"
          />
        </div>
      </div>
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-obsidian-800 border border-obsidian-600 rounded-lg px-3 py-2 text-xs">
      <p className="text-white font-medium mb-1">{label}</p>
      <p className="text-jade-400">Score: {payload[0]?.value}</p>
    </div>
  )
}

export default function MarketScoring() {
  const [markets, setMarkets] = useState<Market[]>(DEFAULT_MARKETS)
  const [selectedId, setSelectedId] = useState<string | null>(DEFAULT_MARKETS[0]?.id || null)

  const scored = useMemo(() => scoreMarkets(markets), [markets])

  const addMarket = () => {
    const m = EMPTY_MARKET()
    setMarkets(prev => [...prev, m])
    setSelectedId(m.id)
  }

  const updateMarket = (id: string, updated: Market) =>
    setMarkets(prev => prev.map(m => m.id === id ? updated : m))

  const removeMarket = (id: string) => {
    setMarkets(prev => prev.filter(m => m.id !== id))
    if (selectedId === id) setSelectedId(null)
  }

  const tier1 = scored.filter(m => m.tier === 1).length
  const tier2 = scored.filter(m => m.tier === 2).length
  const tier3 = scored.filter(m => m.tier === 3).length
  const avgScore = scored.length
    ? Math.round(scored.reduce((s, m) => s + m.score, 0) / scored.length)
    : 0

  const selectedMarket = scored.find(m => m.id === selectedId)

  const radarData = selectedMarket ? [
    { subject: 'Population', value: Math.round(selectedMarket.breakdown.population) },
    { subject: 'Income', value: Math.round(selectedMarket.breakdown.income) },
    { subject: 'Concierge', value: Math.round(selectedMarket.breakdown.concierge) },
    { subject: 'Med Spas', value: Math.round(selectedMarket.breakdown.medSpas) },
    { subject: 'Health', value: Math.round(selectedMarket.breakdown.health) },
  ] : []

  const chartData = scored.map(m => ({
    city: m.city.length > 10 ? m.city.slice(0, 10) + '…' : m.city,
    score: m.score,
    tier: m.tier,
  }))

  return (
    <div className="space-y-6">
      {/* Summary metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard label="Markets Analyzed" value={markets.length.toString()} icon={<MapPin size={16} />} accent="azure" delay={0} />
        <MetricCard label="Avg Opp Score" value={avgScore.toString()} icon={<TrendingUp size={16} />} accent="jade" delay={60} />
        <MetricCard label="Tier 1 Markets" value={tier1.toString()} sub="Score 85+" icon={<Sparkles size={16} />} accent="jade" delay={120} />
        <MetricCard label="Tier 2 Markets" value={tier2.toString()} sub="Score 70–84" icon={<TrendingUp size={16} />} accent="gold" delay={180} />
      </div>

      {/* Charts row */}
      {scored.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Bar chart */}
          <div className="card p-4">
            <h3 className="text-sm font-medium text-obsidian-400 mb-4">Opportunity Scores by Market</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData} margin={{ top: 0, right: 8, left: -20, bottom: 0 }}>
                <XAxis dataKey="city" tick={{ fontSize: 11, fill: '#484F58' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#484F58' }} axisLine={false} tickLine={false} domain={[0, 100]} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="score" radius={[4, 4, 0, 0]} maxBarSize={40}>
                  {chartData.map((entry, i) => (
                    <Cell key={i} fill={TIER_COLORS[entry.tier]} opacity={0.85} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Radar chart for selected market */}
          <div className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-obsidian-400">Factor Breakdown</h3>
              <select
                value={selectedId || ''}
                onChange={e => setSelectedId(e.target.value)}
                className="text-xs bg-obsidian-800 border border-obsidian-600 rounded px-2 py-1 text-white focus:outline-none focus:border-jade-500"
              >
                {scored.map(m => (
                  <option key={m.id} value={m.id}>{m.city || 'Unnamed'}</option>
                ))}
              </select>
            </div>
            {selectedMarket ? (
              <ResponsiveContainer width="100%" height={200}>
                <RadarChart data={radarData} margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
                  <PolarGrid stroke="#21262D" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#484F58' }} />
                  <Radar dataKey="value" stroke="#3DD68C" fill="#3DD68C" fillOpacity={0.15} strokeWidth={2} />
                  <Tooltip
                    contentStyle={{ background: '#161B22', border: '1px solid #30363D', borderRadius: 8, fontSize: 12 }}
                    labelStyle={{ color: '#E6EDF3' }}
                    itemStyle={{ color: '#3DD68C' }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-obsidian-600 text-sm">
                Select a market to view breakdown
              </div>
            )}
          </div>
        </div>
      )}

      {/* Rankings table */}
      {scored.length > 0 && (
        <div className="card overflow-hidden">
          <div className="px-4 py-3 border-b border-obsidian-700 flex items-center justify-between">
            <h3 className="text-sm font-medium text-white">Market Rankings</h3>
            <div className="flex gap-3 text-xs text-obsidian-500">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-jade-400 inline-block" />Tier 1</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gold-400 inline-block" />Tier 2</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-obsidian-500 inline-block" />Tier 3</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Market</th>
                  <th>Score</th>
                  <th>Tier</th>
                  <th className="hidden md:table-cell">Population</th>
                  <th className="hidden md:table-cell">Income</th>
                  <th className="hidden lg:table-cell">Concierge</th>
                  <th className="hidden lg:table-cell">Med Spas</th>
                  <th className="hidden lg:table-cell">Specialty</th>
                </tr>
              </thead>
              <tbody>
                {scored.map((m, i) => (
                  <tr
                    key={m.id}
                    className="cursor-pointer"
                    onClick={() => setSelectedId(m.id)}
                  >
                    <td className="text-obsidian-500 font-mono text-xs w-8">{i + 1}</td>
                    <td className="font-medium text-white">{m.city || <span className="text-obsidian-600">Unnamed</span>}</td>
                    <td className="w-40"><ScoreBar score={m.score} /></td>
                    <td><TierBadge tier={m.tier} /></td>
                    <td className="hidden md:table-cell text-obsidian-400">{(m.population / 1000).toFixed(0)}K</td>
                    <td className="hidden md:table-cell text-obsidian-400">${(m.medianIncome / 1000).toFixed(0)}K</td>
                    <td className="hidden lg:table-cell text-obsidian-400">{m.concierge}</td>
                    <td className="hidden lg:table-cell text-obsidian-400">{m.medSpas}</td>
                    <td className="hidden lg:table-cell text-obsidian-400">{m.specialtyClinics}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Market input forms */}
      <div>
        <SectionHeader
          title="Configure Markets"
          subtitle="Add or edit market data below"
          action={
            <button
              onClick={addMarket}
              className="flex items-center gap-2 bg-jade-500/10 hover:bg-jade-500/20 border border-jade-500/30 text-jade-400 text-sm px-3 py-1.5 rounded-lg transition-all duration-200"
            >
              <PlusCircle size={14} />
              Add Market
            </button>
          }
        />
        <div className="space-y-3">
          {markets.map((m, i) => (
            <MarketForm
              key={m.id}
              market={m}
              index={i}
              onChange={updated => updateMarket(m.id, updated)}
              onRemove={() => removeMarket(m.id)}
            />
          ))}
          {markets.length === 0 && (
            <div className="card p-10 text-center text-obsidian-600">
              <MapPin size={24} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">No markets yet. Add one to get started.</p>
            </div>
          )}
        </div>
      </div>

      {/* Weights legend */}
      <div className="card p-4">
        <h3 className="text-xs font-medium text-obsidian-500 uppercase tracking-widest mb-3">Scoring Weights</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: 'Median Income', weight: 25, color: '#3DD68C' },
            { label: 'Concierge Practices', weight: 25, color: '#3DD68C' },
            { label: 'Population', weight: 20, color: '#58A6FF' },
            { label: 'Med Spas', weight: 20, color: '#58A6FF' },
            { label: 'Health Score', weight: 10, color: '#F5C842' },
          ].map(w => (
            <div key={w.label} className="flex flex-col gap-1">
              <div className="flex justify-between text-xs">
                <span className="text-obsidian-400">{w.label}</span>
                <span className="font-mono" style={{ color: w.color }}>{w.weight}%</span>
              </div>
              <div className="h-1 bg-obsidian-700 rounded-full">
                <div className="h-full rounded-full" style={{ width: `${w.weight * 4}%`, backgroundColor: w.color, opacity: 0.7 }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
