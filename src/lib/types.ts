// ─── Market Scoring ───────────────────────────────────────────────────────────

export interface Market {
  id: string
  city: string
  population: number
  medianIncome: number
  concierge: number
  medSpas: number
  specialtyClinics: number
  healthScore: number
}

export interface ScoredMarket extends Market {
  score: number
  tier: 1 | 2 | 3
  breakdown: {
    population: number
    income: number
    concierge: number
    medSpas: number
    health: number
  }
}

// ─── Rep ROI ──────────────────────────────────────────────────────────────────

export interface RepCost {
  salary: number
  bonus: number
  benefits: number
  travel: number
  events: number
  roiMultiple: number
  avgPatientRevenue: number
  patientsPerProviderPerMonth: number
}

export interface RepROIResult {
  totalCost: number
  revenueRequired: number
  annualRevenue: number
  monthlyRevenue: number
  weeklyRevenue: number
  revenuePerProvider: number
  providersNeeded: number
}

// ─── GTM Activity ─────────────────────────────────────────────────────────────

export interface ActivityInputs {
  visitsPerDay: number
  followUpsPerWeek: number
  dinnersPerMonth: number
  eventsPerMonth: number
  workingDaysPerMonth: number
}

export interface ActivityResult {
  totalMeetingsPerMonth: number
  partnerships: number
  annualPartnerships: number
  coverageRate: number
}

// ─── Territory Simulator ─────────────────────────────────────────────────────

export interface TerritoryAllocation {
  marketId: string
  reps: number
}

export interface TerritoryResult {
  totalRevenue: number
  allocations: Array<{
    market: ScoredMarket
    reps: number
    revenue: number
    partnerships: number
  }>
}
