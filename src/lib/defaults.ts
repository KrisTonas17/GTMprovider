import type { Market, RepCost, ActivityInputs } from './types'

export const DEFAULT_MARKETS: Market[] = [
  {
    id: '1',
    city: 'New York City',
    population: 8_336_817,
    medianIncome: 72_000,
    concierge: 85,
    medSpas: 120,
    specialtyClinics: 95,
    healthScore: 7,
  },
  {
    id: '2',
    city: 'Los Angeles',
    population: 3_979_576,
    medianIncome: 68_000,
    concierge: 92,
    medSpas: 180,
    specialtyClinics: 80,
    healthScore: 9,
  },
  {
    id: '3',
    city: 'Miami',
    population: 467_963,
    medianIncome: 44_000,
    concierge: 55,
    medSpas: 95,
    specialtyClinics: 45,
    healthScore: 8,
  },
  {
    id: '4',
    city: 'Dallas',
    population: 1_343_573,
    medianIncome: 54_000,
    concierge: 40,
    medSpas: 70,
    specialtyClinics: 55,
    healthScore: 6,
  },
  {
    id: '5',
    city: 'Scottsdale',
    population: 258_069,
    medianIncome: 82_000,
    concierge: 48,
    medSpas: 85,
    specialtyClinics: 40,
    healthScore: 9,
  },
]

export const DEFAULT_REP_COST: RepCost = {
  salary: 120_000,
  bonus: 30_000,
  benefits: 24_000,
  travel: 20_000,
  events: 12_000,
  roiMultiple: 3,
  avgPatientRevenue: 2_500,
  patientsPerProviderPerMonth: 5,
}

export const DEFAULT_ACTIVITY: ActivityInputs = {
  visitsPerDay: 6,
  followUpsPerWeek: 10,
  dinnersPerMonth: 4,
  eventsPerMonth: 2,
  workingDaysPerMonth: 20,
}
