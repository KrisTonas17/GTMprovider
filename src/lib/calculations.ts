import type {
  Market,
  ScoredMarket,
  RepCost,
  RepROIResult,
  ActivityInputs,
  ActivityResult,
  TerritoryAllocation,
  TerritoryResult,
} from './types'

// ─── Market Opportunity Score ─────────────────────────────────────────────────

const WEIGHTS = {
  population: 0.20,
  income: 0.25,
  concierge: 0.25,
  medSpas: 0.20,
  health: 0.10,
}

/**
 * Reference maximums calibrated for concierge/med-spa GTM context.
 * These represent a "world-class" market benchmark, not US absolute max.
 * Pop: 2M = major metro anchor. Income: $85K = affluent target market.
 * Concierge: 65 = saturated concierge density. MedSpa: 100 = dense spa market.
 */
const REF_MAX = {
  population: 2_000_000,
  income: 85_000,
  concierge: 65,
  medSpas: 100,
}

function normalize(value: number, max: number): number {
  return Math.min((value / max) * 100, 100)
}

export function scoreMarket(market: Market): ScoredMarket {
  const popScore    = normalize(market.population, REF_MAX.population)
  const incScore    = normalize(market.medianIncome, REF_MAX.income)
  const concScore   = normalize(market.concierge, REF_MAX.concierge)
  const spaScore    = normalize(market.medSpas, REF_MAX.medSpas)
  const healthScore = (market.healthScore / 10) * 100

  const breakdown = {
    population: popScore,
    income: incScore,
    concierge: concScore,
    medSpas: spaScore,
    health: healthScore,
  }

  const score = Math.round(
    popScore    * WEIGHTS.population +
    incScore    * WEIGHTS.income     +
    concScore   * WEIGHTS.concierge  +
    spaScore    * WEIGHTS.medSpas    +
    healthScore * WEIGHTS.health
  )

  const tier: 1 | 2 | 3 = score >= 85 ? 1 : score >= 70 ? 2 : 3

  return { ...market, score, tier, breakdown }
}

export function scoreMarkets(markets: Market[]): ScoredMarket[] {
  return markets
    .map(scoreMarket)
    .sort((a, b) => b.score - a.score)
}

// ─── Rep ROI ──────────────────────────────────────────────────────────────────

export function calcRepROI(inputs: RepCost): RepROIResult {
  const totalCost = inputs.salary + inputs.bonus + inputs.benefits +
                    inputs.travel + inputs.events

  const revenueRequired = totalCost * inputs.roiMultiple

  const annualRevenue  = revenueRequired
  const monthlyRevenue = revenueRequired / 12
  const weeklyRevenue  = revenueRequired / 52

  const revenuePerProvider =
    inputs.avgPatientRevenue * inputs.patientsPerProviderPerMonth * 12

  const providersNeeded = Math.ceil(annualRevenue / revenuePerProvider)

  return {
    totalCost,
    revenueRequired,
    annualRevenue,
    monthlyRevenue,
    weeklyRevenue,
    revenuePerProvider,
    providersNeeded,
  }
}

// ─── GTM Activity ─────────────────────────────────────────────────────────────

const MEETINGS_PER_PARTNERSHIP = 15

export function calcActivity(inputs: ActivityInputs): ActivityResult {
  const visitMeetings    = inputs.visitsPerDay * inputs.workingDaysPerMonth
  const followUpMeetings = inputs.followUpsPerWeek * 4.33
  const dinnerMeetings   = inputs.dinnersPerMonth * 3
  const eventMeetings    = inputs.eventsPerMonth * 8

  const totalMeetingsPerMonth = Math.round(
    visitMeetings + followUpMeetings + dinnerMeetings + eventMeetings
  )

  const partnerships = totalMeetingsPerMonth / MEETINGS_PER_PARTNERSHIP
  const annualPartnerships = Math.round(partnerships * 12)
  const coverageRate = Math.min((partnerships / 10) * 100, 100)

  return {
    totalMeetingsPerMonth,
    partnerships: Math.round(partnerships * 10) / 10,
    annualPartnerships,
    coverageRate,
  }
}

// ─── Territory Simulator ─────────────────────────────────────────────────────

const BASE_REVENUE_PER_REP_PER_YEAR = 800_000

export function simulateTerritory(
  scoredMarkets: ScoredMarket[],
  allocations: TerritoryAllocation[]
): TerritoryResult {
  const marketMap = new Map(scoredMarkets.map(m => [m.id, m]))

  const allocationResults = allocations
    .filter(a => a.reps > 0)
    .map(a => {
      const market = marketMap.get(a.marketId)
      if (!market) return null

      const multiplier = market.tier === 1 ? 1.4 : market.tier === 2 ? 1.1 : 0.85
      const revenuePerRep = BASE_REVENUE_PER_REP_PER_YEAR * multiplier
      const revenue = a.reps * revenuePerRep
      const partnerships = Math.round(a.reps * 12 * 2.5)

      return { market, reps: a.reps, revenue, partnerships }
    })
    .filter(Boolean) as TerritoryResult['allocations']

  const totalRevenue = allocationResults.reduce((sum, a) => sum + a.revenue, 0)

  return { totalRevenue, allocations: allocationResults }
}

// ─── Formatters ───────────────────────────────────────────────────────────────

export function formatCurrency(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `$${(n / 1_000).toFixed(0)}K`
  return `$${n.toFixed(0)}`
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat('en-US').format(Math.round(n))
}
