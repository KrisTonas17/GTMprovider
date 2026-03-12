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
 * Normalizes a value against a reference max, capped at 100.
 */
function normalize(value: number, max: number): number {
  return Math.min((value / max) * 100, 100)
}

/**
 * Computes weighted opportunity score for a market.
 * Returns 0–100 score with individual factor breakdown.
 */
export function scoreMarket(market: Market): ScoredMarket {
  // Reference maxes — tuned for US concierge/medspa GTM context
  const popScore   = normalize(market.population, 3_000_000) * 100 / 100
  const incScore   = normalize(market.medianIncome, 150_000) * 100 / 100
  const concScore  = normalize(market.concierge, 100) * 100 / 100
  const spaScore   = normalize(market.medSpas, 150) * 100 / 100
  const healthScore = (market.healthScore / 10) * 100

  const breakdown = {
    population: popScore,
    income: incScore,
    concierge: concScore,
    medSpas: spaScore,
    health: healthScore,
  }

  const score = Math.round(
    popScore   * WEIGHTS.population +
    incScore   * WEIGHTS.income     +
    concScore  * WEIGHTS.concierge  +
    spaScore   * WEIGHTS.medSpas    +
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

/**
 * Calculates total rep cost and revenue requirements.
 */
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

/**
 * Calculates monthly and annual activity outputs.
 */
export function calcActivity(inputs: ActivityInputs): ActivityResult {
  const visitMeetings    = inputs.visitsPerDay * inputs.workingDaysPerMonth
  const followUpMeetings = inputs.followUpsPerWeek * 4.33  // avg weeks/month
  const dinnerMeetings   = inputs.dinnersPerMonth * 3       // ~3 contacts/dinner
  const eventMeetings    = inputs.eventsPerMonth * 8        // ~8 contacts/event

  const totalMeetingsPerMonth = Math.round(
    visitMeetings + followUpMeetings + dinnerMeetings + eventMeetings
  )

  const partnerships = totalMeetingsPerMonth / MEETINGS_PER_PARTNERSHIP
  const annualPartnerships = Math.round(partnerships * 12)

  // Coverage rate: partnerships achieved vs theoretical max (1 per 15 meetings)
  const coverageRate = Math.min((partnerships / 10) * 100, 100)

  return {
    totalMeetingsPerMonth,
    partnerships: Math.round(partnerships * 10) / 10,
    annualPartnerships,
    coverageRate,
  }
}

// ─── Territory Simulator ─────────────────────────────────────────────────────

const BASE_REVENUE_PER_REP_PER_YEAR = 800_000 // baseline assumption

/**
 * Simulates territory revenue based on rep allocation per market.
 * Revenue scales with market score as a multiplier.
 */
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

      // Score multiplier: Tier 1 = 1.4x, Tier 2 = 1.1x, Tier 3 = 0.85x
      const multiplier = market.tier === 1 ? 1.4 : market.tier === 2 ? 1.1 : 0.85
      const revenuePerRep = BASE_REVENUE_PER_REP_PER_YEAR * multiplier

      const revenue = a.reps * revenuePerRep
      const partnerships = Math.round(a.reps * 12 * 2.5) // ~2.5 partnerships/month/rep

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
