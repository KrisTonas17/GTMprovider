'use client'

import { useState, useMemo } from 'react'
import { Calendar, Users, Handshake, TrendingUp, Coffee, Star } from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  RadialBarChart, RadialBar, PolarAngleAxis
} from 'recharts'
import { calcActivity } from '@/lib/calculations'
import { DEFAULT_ACTIVITY } from '@/lib/defaults'
import type { ActivityInputs } from '@/lib/types'
import MetricCard from '@/app/components/ui/MetricCard'
import SectionHeader from '@/app/components/ui/SectionHeader'
import SliderField from '@/app/components/ui/SliderField'

// Build 12-month projection for area chart
function buildMonthlyProjection(result: ReturnType<typeof calcActivity>) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  let cumPartnerships = 0
  return months.map((month, i) => {
    // Ramp: slow start, accelerating mid-year, plateau toward end
    const rampMultiplier = i < 3 ? 0.6 + i * 0.1 : i < 9 ? 0.95 : 1.0
    const monthlyMeetings = Math.round(result.totalMeetingsPerMonth * rampMultiplier)
    const monthlyPartnerships = monthlyMeetings / 15
    cumPartnerships += monthlyPartnerships
    return {
      month,
      meetings: monthlyMeetings,
      partnerships: Math.round(monthlyPartnerships * 10) / 10,
      cumulative: Math.round(cumPartnerships),
    }
  })
}

export default function ActivityPlanner() {
  const [inputs, setInputs] = useState<ActivityInputs>(DEFAULT_ACTIVITY)

  const set = (field: keyof ActivityInputs, val: number) =>
    setInputs(prev => ({ ...prev, [field]: val }))

  const result = useMemo(() => calcActivity(inputs), [inputs])
  const projection = useMemo(() => buildMonthlyProjection(result), [result])

  const radialData = [{ value: Math.min(result.coverageRate, 100) }]

  return (
    <div className="space-y-6">
      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard
          label="Meetings / Month"
          value={result.totalMeetingsPerMonth.toLocaleString()}
          icon={<Calendar size={16} />}
          accent="azure"
          delay={0}
        />
        <MetricCard
          label="Partnerships / Month"
          value={result.partnerships.toFixed(1)}
          sub="at 15 meetings each"
          icon={<Handshake size={16} />}
          accent="jade"
          delay={60}
        />
        <MetricCard
          label="Annual Partnerships"
          value={result.annualPartnerships.toString()}
          sub="Full-year projection"
          icon={<TrendingUp size={16} />}
          accent="gold"
          delay={120}
        />
        <MetricCard
          label="Activity Index"
          value={`${Math.round(result.coverageRate)}%`}
          sub="vs. 10 partnerships target"
          icon={<Star size={16} />}
          accent={result.coverageRate >= 80 ? 'jade' : result.coverageRate >= 50 ? 'gold' : 'crimson'}
          delay={180}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input sliders */}
        <div className="space-y-4">
          <SectionHeader title="Activity Inputs" subtitle="Adjust weekly/monthly cadence" />
          <div className="card p-5 space-y-5">
            <SliderField
              label="Provider Visits / Day"
              value={inputs.visitsPerDay}
              onChange={v => set('visitsPerDay', v)}
              min={1} max={15} step={1}
            />
            <SliderField
              label="Follow-ups / Week"
              value={inputs.followUpsPerWeek}
              onChange={v => set('followUpsPerWeek', v)}
              min={0} max={30} step={1}
            />
            <SliderField
              label="Provider Dinners / Month"
              value={inputs.dinnersPerMonth}
              onChange={v => set('dinnersPerMonth', v)}
              min={0} max={12} step={1}
            />
            <SliderField
              label="Member Events / Month"
              value={inputs.eventsPerMonth}
              onChange={v => set('eventsPerMonth', v)}
              min={0} max={8} step={1}
            />
            <SliderField
              label="Working Days / Month"
              value={inputs.workingDaysPerMonth}
              onChange={v => set('workingDaysPerMonth', v)}
              min={10} max={25} step={1}
            />
          </div>

          {/* Activity breakdown */}
          <div className="card p-4">
            <h3 className="text-xs font-medium text-obsidian-500 uppercase tracking-widest mb-3">Meeting Sources</h3>
            <div className="space-y-3">
              {[
                {
                  label: 'In-person visits',
                  count: Math.round(inputs.visitsPerDay * inputs.workingDaysPerMonth),
                  color: '#3DD68C',
                  icon: <Users size={12} />,
                },
                {
                  label: 'Follow-ups',
                  count: Math.round(inputs.followUpsPerWeek * 4.33),
                  color: '#58A6FF',
                  icon: <Calendar size={12} />,
                },
                {
                  label: 'Dinner touchpoints',
                  count: inputs.dinnersPerMonth * 3,
                  color: '#F5C842',
                  icon: <Coffee size={12} />,
                },
                {
                  label: 'Event contacts',
                  count: inputs.eventsPerMonth * 8,
                  color: '#9B59B6',
                  icon: <Star size={12} />,
                },
              ].map(row => (
                <div key={row.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="flex items-center gap-1.5 text-obsidian-400">
                      <span style={{ color: row.color }}>{row.icon}</span>
                      {row.label}
                    </span>
                    <span className="font-mono" style={{ color: row.color }}>{row.count}</span>
                  </div>
                  <div className="h-1 bg-obsidian-700 rounded-full">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min((row.count / result.totalMeetingsPerMonth) * 100, 100)}%`,
                        backgroundColor: row.color,
                        opacity: 0.7,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="lg:col-span-2 space-y-4">
          {/* Area chart: 12-month projection */}
          <div className="card p-4">
            <h3 className="text-sm font-medium text-obsidian-400 mb-1">12-Month Partnership Ramp</h3>
            <p className="text-xs text-obsidian-600 mb-4">Cumulative partnerships with activity ramp</p>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={projection} margin={{ top: 0, right: 8, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="cumulativeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3DD68C" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3DD68C" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="meetingsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#58A6FF" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#58A6FF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#484F58' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#484F58' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#161B22', border: '1px solid #30363D', borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: '#E6EDF3' }}
                  itemStyle={{ color: '#3DD68C' }}
                />
                <Area type="monotone" dataKey="cumulative" stroke="#3DD68C" strokeWidth={2}
                  fill="url(#cumulativeGrad)" name="Cumulative Partnerships" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Monthly meetings bar */}
          <div className="card p-4">
            <h3 className="text-sm font-medium text-obsidian-400 mb-4">Monthly Meetings — Ramped View</h3>
            <ResponsiveContainer width="100%" height={140}>
              <AreaChart data={projection} margin={{ top: 0, right: 8, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="meetGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#58A6FF" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#58A6FF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#484F58' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#484F58' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#161B22', border: '1px solid #30363D', borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: '#E6EDF3' }}
                  itemStyle={{ color: '#58A6FF' }}
                />
                <Area type="monotone" dataKey="meetings" stroke="#58A6FF" strokeWidth={2}
                  fill="url(#meetGrad)" name="Meetings" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Assumptions callout */}
          <div className="card p-4 border-jade-500/10">
            <h3 className="text-xs font-medium text-obsidian-500 uppercase tracking-widest mb-3">Model Assumptions</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
              {[
                { label: '1 partnership per', value: '15 meetings', color: 'text-jade-400' },
                { label: 'Contacts per dinner', value: '3 providers', color: 'text-azure-400' },
                { label: 'Contacts per event', value: '8 providers', color: 'text-gold-400' },
                { label: 'Follow-up weeks/mo', value: '4.33 avg', color: 'text-jade-400' },
                { label: 'Ramp period', value: 'Q1 slowest', color: 'text-obsidian-400' },
                { label: 'Full productivity', value: 'Month 4+', color: 'text-obsidian-400' },
              ].map(a => (
                <div key={a.label} className="flex flex-col gap-0.5">
                  <span className="text-obsidian-600">{a.label}</span>
                  <span className={`font-medium ${a.color}`}>{a.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
