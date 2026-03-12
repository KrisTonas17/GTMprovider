'use client'

import { useState } from 'react'
import {
  BarChart2, TrendingUp, Calendar, Map, ChevronRight,
  Activity, Crosshair, Menu, X
} from 'lucide-react'
import clsx from 'clsx'
import dynamic from 'next/dynamic'

// Lazy load heavy modules for better initial load
const MarketScoring = dynamic(() => import('@/app/components/market/MarketScoring'), {
  loading: () => <ModuleLoader />,
  ssr: false,
})
const RepROI = dynamic(() => import('@/app/components/rep/RepROI'), {
  loading: () => <ModuleLoader />,
  ssr: false,
})
const ActivityPlanner = dynamic(() => import('@/app/components/activity/ActivityPlanner'), {
  loading: () => <ModuleLoader />,
  ssr: false,
})
const TerritorySimulator = dynamic(() => import('@/app/components/simulator/TerritorySimulator'), {
  loading: () => <ModuleLoader />,
  ssr: false,
})

function ModuleLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="flex gap-2">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-jade-400 animate-bounce"
            style={{ animationDelay: `${i * 150}ms` }}
          />
        ))}
      </div>
    </div>
  )
}

type TabId = 'markets' | 'rep' | 'activity' | 'simulator'

const TABS: Array<{ id: TabId; label: string; sublabel: string; icon: React.ReactNode }> = [
  {
    id: 'markets',
    label: 'Market Scoring',
    sublabel: 'Opportunity analysis',
    icon: <BarChart2 size={16} />,
  },
  {
    id: 'rep',
    label: 'Rep Economics',
    sublabel: 'ROI calculator',
    icon: <TrendingUp size={16} />,
  },
  {
    id: 'activity',
    label: 'Activity Planner',
    sublabel: 'GTM cadence',
    icon: <Calendar size={16} />,
  },
  {
    id: 'simulator',
    label: 'Territory Sim',
    sublabel: 'Scenario builder',
    icon: <Crosshair size={16} />,
  },
]

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabId>('markets')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-obsidian-950 flex flex-col">
      {/* Top nav */}
      <header className="sticky top-0 z-50 border-b border-obsidian-700 bg-obsidian-900/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            {/* Brand */}
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-jade-500/20 border border-jade-500/30 flex items-center justify-center">
                <Activity size={14} className="text-jade-400" />
              </div>
              <div className="hidden sm:block">
                <span className="text-sm font-medium text-white">Provider GTM</span>
                <span className="text-sm text-obsidian-500 ml-1.5">Territory Planner</span>
              </div>
              <div className="sm:hidden">
                <span className="text-sm font-medium text-white">GTM Planner</span>
              </div>
            </div>

            {/* Desktop tabs */}
            <nav className="hidden md:flex items-center gap-1">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={clsx(
                    'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all duration-200',
                    activeTab === tab.id
                      ? 'bg-jade-500/15 text-jade-400 border border-jade-500/25'
                      : 'text-obsidian-400 hover:text-white hover:bg-obsidian-800'
                  )}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 text-obsidian-400 hover:text-white rounded-lg hover:bg-obsidian-800 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-obsidian-700 bg-obsidian-900 animate-fade-in">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setMobileMenuOpen(false) }}
                className={clsx(
                  'w-full flex items-center justify-between px-4 py-3 text-sm transition-colors',
                  activeTab === tab.id
                    ? 'bg-jade-500/10 text-jade-400'
                    : 'text-obsidian-400 hover:text-white hover:bg-obsidian-800'
                )}
              >
                <div className="flex items-center gap-3">
                  {tab.icon}
                  <div className="text-left">
                    <div className="font-medium">{tab.label}</div>
                    <div className="text-xs text-obsidian-600">{tab.sublabel}</div>
                  </div>
                </div>
                <ChevronRight size={14} className="text-obsidian-600" />
              </button>
            ))}
          </div>
        )}
      </header>

      {/* Breadcrumb + page header */}
      <div className="border-b border-obsidian-800 bg-obsidian-900/40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-xs text-obsidian-600 mb-2">
            <Map size={11} />
            <span>GTM Planner</span>
            <ChevronRight size={11} />
            <span className="text-obsidian-400">{TABS.find(t => t.id === activeTab)?.label}</span>
          </div>
          <h1 className="text-xl font-display text-white">
            {TABS.find(t => t.id === activeTab)?.label}
          </h1>
          <p className="text-sm text-obsidian-500 mt-0.5">
            {activeTab === 'markets' && 'Score and rank markets by opportunity for concierge, med spa, and specialty clinic deployment.'}
            {activeTab === 'rep' && 'Calculate rep cost structure, revenue requirements, and provider targets.'}
            {activeTab === 'activity' && 'Plan GTM activity cadence and project partnership pipeline.'}
            {activeTab === 'simulator' && 'Model territory scenarios and project revenue by rep allocation.'}
          </p>
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
        {activeTab === 'markets'    && <MarketScoring />}
        {activeTab === 'rep'        && <RepROI />}
        {activeTab === 'activity'   && <ActivityPlanner />}
        {activeTab === 'simulator'  && <TerritorySimulator />}
      </main>

      {/* Footer */}
      <footer className="border-t border-obsidian-800 mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="text-xs text-obsidian-600">
            Provider GTM Territory Planner — All calculations client-side
          </span>
          <div className="flex items-center gap-3 text-xs text-obsidian-600">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-jade-400 inline-block animate-pulse" />
              Live calculations
            </span>
            <span>·</span>
            <span>No data stored</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
