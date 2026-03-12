'use client'

import { useState, useMemo } from 'react'
import { DollarSign, Users, Target, TrendingUp, Calculator, Briefcase } from 'lucide-react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from 'recharts'
import { calcRepROI, formatCurrency } from '@/lib/calculations'
import { DEFAULT_REP_COST } from '@/lib/defaults'
import type { RepCost } from '@/lib/types'
import MetricCard from '@/app/components/ui/MetricCard'
import SectionHeader from '@/app/components/ui/SectionHeader'

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: { name: string; value: number }[] }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-obsidian-800 border border-obsidian-600 rounded-lg px-3 py-2 text-xs">
      <p className="text-white font-medium">{payload[0]?.name}</p>
      <p className="text-jade-400">{formatCurrency(payload[0]?.value || 0)}</p>
    </div>
  )
}

export default function RepROI() {
  const [inputs, setInputs] = useState<RepCost>(DEFAULT_REP_COST)

  const set = (field: keyof RepCost, val: number) =>
    setInputs(prev => ({ ...prev, [field]: val }))

  const result = useMemo(() => calcRepROI(inputs), [inputs])

  const pieData = [
    { name: 'Salary', value: inputs.salary, color: '#3DD68C' },
    { name: 'Bonus', value: inputs.bonus, color: '#58A6FF' },
    { name: 'Benefits', value: inputs.benefits, color: '#F5C842' },
    { name: 'Travel', value: inputs.travel, color: '#9B59B6' },
    { name: 'Events', value: inputs.events, color: '#E85555' },
  ]

  const periodData = [
    { period: 'Weekly', revenue: result.weeklyRevenue },
    { period: 'Monthly', revenue: result.monthlyRevenue },
  ]

  return (
    <div className="space-y-6">
      {/* Output metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard
          label="Total Rep Cost"
          value={formatCurrency(result.totalCost)}
          sub="Annual all-in"
          icon={<Briefcase size={16} />}
          accent="azure"
          delay={0}
        />
        <MetricCard
          label="Revenue Required"
          value={formatCurrency(result.revenueRequired)}
          sub={`${inputs.roiMultiple}× ROI target`}
          icon={<Target size={16} />}
          accent="jade"
          delay={60}
        />
        <MetricCard
          label="Monthly Target"
          value={formatCurrency(result.monthlyRevenue)}
          sub="To hit quota"
          icon={<TrendingUp size={16} />}
          accent="gold"
          delay={120}
        />
        <MetricCard
          label="Providers Needed"
          value={result.providersNeeded.toString()}
          sub={`${formatCurrency(result.revenuePerProvider)}/provider/yr`}
          icon={<Users size={16} />}
          accent="jade"
          delay={180}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Input panel */}
        <div className="space-y-4">
          <SectionHeader title="Rep Cost Structure" subtitle="Enter annual figures" />

          <div className="card p-5 space-y-4">
            <h3 className="text-xs font-medium text-obsidian-500 uppercase tracking-widest flex items-center gap-2">
              <DollarSign size={12} /> Compensation
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Base Salary', field: 'salary' as keyof RepCost, step: 5000 },
                { label: 'Annual Bonus', field: 'bonus' as keyof RepCost, step: 5000 },
                { label: 'Benefits', field: 'benefits' as keyof RepCost, step: 1000 },
              ].map(({ label, field, step }) => (
                <div key={field}>
                  <label className="block text-xs text-obsidian-500 mb-1">{label}</label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-obsidian-500 text-xs">$</span>
                    <input
                      type="number"
                      value={inputs[field] as number}
                      step={step}
                      min={0}
                      onChange={e => set(field, parseFloat(e.target.value) || 0)}
                      className="input-field text-sm pl-5"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-5 space-y-4">
            <h3 className="text-xs font-medium text-obsidian-500 uppercase tracking-widest flex items-center gap-2">
              <Briefcase size={12} /> Expenses
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Travel Budget', field: 'travel' as keyof RepCost, step: 1000 },
                { label: 'Event Budget', field: 'events' as keyof RepCost, step: 1000 },
              ].map(({ label, field, step }) => (
                <div key={field}>
                  <label className="block text-xs text-obsidian-500 mb-1">{label}</label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-obsidian-500 text-xs">$</span>
                    <input
                      type="number"
                      value={inputs[field] as number}
                      step={step}
                      min={0}
                      onChange={e => set(field, parseFloat(e.target.value) || 0)}
                      className="input-field text-sm pl-5"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-5 space-y-4">
            <h3 className="text-xs font-medium text-obsidian-500 uppercase tracking-widest flex items-center gap-2">
              <Target size={12} /> ROI & Revenue Model
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-obsidian-500 mb-1">
                  Target ROI Multiple
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range" min={1} max={10} step={0.5}
                    value={inputs.roiMultiple}
                    onChange={e => set('roiMultiple', parseFloat(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-jade-400 font-mono text-sm font-medium w-10 text-right">
                    {inputs.roiMultiple}×
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-xs text-obsidian-500 mb-1">Avg Patient Revenue</label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-obsidian-500 text-xs">$</span>
                  <input
                    type="number"
                    value={inputs.avgPatientRevenue}
                    step={500}
                    min={0}
                    onChange={e => set('avgPatientRevenue', parseFloat(e.target.value) || 0)}
                    className="input-field text-sm pl-5"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-obsidian-500 mb-1">Patients / Provider / Mo</label>
                <input
                  type="number"
                  value={inputs.patientsPerProviderPerMonth}
                  step={1}
                  min={1}
                  onChange={e => set('patientsPerProviderPerMonth', parseFloat(e.target.value) || 1)}
                  className="input-field text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Visualization */}
        <div className="space-y-4">
          {/* Cost breakdown pie */}
          <div className="card p-4">
            <h3 className="text-sm font-medium text-obsidian-400 mb-4">Cost Breakdown</h3>
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="50%" height={160}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} opacity={0.85} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {pieData.map(d => (
                  <div key={d.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                      <span className="text-xs text-obsidian-400">{d.name}</span>
                    </div>
                    <span className="text-xs font-mono text-white">{formatCurrency(d.value)}</span>
                  </div>
                ))}
                <div className="border-t border-obsidian-700 pt-2 flex justify-between">
                  <span className="text-xs font-medium text-obsidian-300">Total</span>
                  <span className="text-xs font-mono text-jade-400 font-medium">{formatCurrency(result.totalCost)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Revenue targets */}
          <div className="card p-4">
            <h3 className="text-sm font-medium text-obsidian-400 mb-4">Revenue Targets by Period</h3>
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={periodData} margin={{ top: 0, right: 8, left: -10, bottom: 0 }}>
                <XAxis dataKey="period" tick={{ fontSize: 11, fill: '#484F58' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#484F58' }} axisLine={false} tickLine={false}
                  tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="revenue" fill="#3DD68C" opacity={0.8} radius={[4, 4, 0, 0]} maxBarSize={60} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Provider math */}
          <div className="card p-4">
            <h3 className="text-sm font-medium text-obsidian-400 mb-3">Provider Math</h3>
            <div className="space-y-3">
              {[
                { label: 'Revenue per provider (annual)', value: formatCurrency(result.revenuePerProvider), accent: 'text-jade-400' },
                { label: 'Providers needed to hit quota', value: result.providersNeeded, accent: 'text-azure-400' },
                { label: 'Quota per provider', value: formatCurrency(result.annualRevenue / result.providersNeeded), accent: 'text-gold-400' },
              ].map(row => (
                <div key={row.label} className="flex justify-between items-center py-2 border-b border-obsidian-800 last:border-0">
                  <span className="text-xs text-obsidian-400">{row.label}</span>
                  <span className={`text-sm font-mono font-medium ${row.accent}`}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
