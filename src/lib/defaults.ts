import type { Market, RepCost, ActivityInputs } from './types'

/**
 * Pre-researched markets for concierge medicine, med spa, and specialty clinic GTM.
 * Data sources: US Census, IBISWorld, local business directories, health index studies.
 * Population = city proper. Income = median household. Concierge/MedSpa/Specialty = estimated
 * active practices based on directory research. Health score = composite of fitness culture,
 * health spending per capita, and wellness industry density (1–10).
 */
export const DEFAULT_MARKETS: Market[] = [
  // ── Tier 1 Anchors ──────────────────────────────────────────────────────────
  {
    id: '1',
    city: 'Los Angeles',
    population: 3_979_576,
    medianIncome: 71_000,
    concierge: 92,
    medSpas: 180,
    specialtyClinics: 85,
    healthScore: 9,
    // LA is the #1 med spa market in the US. Dense concierge ecosystem in Beverly Hills,
    // Brentwood, Pacific Palisades. Longevity and functional medicine booming.
  },
  {
    id: '2',
    city: 'New York City',
    population: 8_336_817,
    medianIncome: 72_000,
    concierge: 88,
    medSpas: 125,
    specialtyClinics: 98,
    healthScore: 7,
    // Largest absolute market. UES, Tribeca, West Village concierge density high.
    // Hormone and longevity clinics growing fast. Lower health score = less wellness culture
    // vs West Coast but compensated by sheer volume and income concentration.
  },
  {
    id: '3',
    city: 'Scottsdale',
    population: 258_069,
    medianIncome: 84_000,
    concierge: 52,
    medSpas: 90,
    specialtyClinics: 44,
    healthScore: 9,
    // Punches well above its population weight. Affluent retirees + health-conscious
    // transplants. One of the highest med spa densities per capita in the US.
    // Strong longevity clinic presence (Fountain Hills, North Scottsdale corridor).
  },
  {
    id: '4',
    city: 'Miami',
    population: 467_963,
    medianIncome: 46_000,
    concierge: 58,
    medSpas: 105,
    specialtyClinics: 50,
    healthScore: 9,
    // Brickell, Coral Gables, Coconut Grove = high-income concierge clusters.
    // Median income skewed low by city proper; target demographic skews much higher.
    // Aesthetic medicine and hormone clinics booming. High health consciousness.
  },
  {
    id: '5',
    city: 'Austin',
    population: 978_908,
    medianIncome: 75_000,
    concierge: 55,
    medSpas: 95,
    specialtyClinics: 60,
    healthScore: 9,
    // Fastest-growing target market. Tech wealth influx driving premium healthcare demand.
    // Strong functional medicine and longevity scene. Younger, health-obsessed demographic.
    // West Austin / Westlake Hills = prime concierge territory.
  },

  // ── Tier 2 Growth Markets ────────────────────────────────────────────────────
  {
    id: '6',
    city: 'Dallas',
    population: 1_343_573,
    medianIncome: 56_000,
    concierge: 45,
    medSpas: 80,
    specialtyClinics: 58,
    healthScore: 6,
    // Large market with growing affluent suburbs (Highland Park, Preston Hollow, Plano).
    // Med spa market expanding rapidly. Concierge adoption still maturing vs coasts.
    // Strong healthcare infrastructure supports specialty clinic growth.
  },
  {
    id: '7',
    city: 'Houston',
    population: 2_304_580,
    medianIncome: 53_000,
    concierge: 48,
    medSpas: 88,
    specialtyClinics: 65,
    healthScore: 6,
    // Second largest Texas market. River Oaks, Memorial, The Woodlands = concierge clusters.
    // Large medical center (TMC) = high specialty clinic density.
    // Oil & gas wealth concentrated in suburbs drives premium healthcare spend.
  },
  {
    id: '8',
    city: 'Denver',
    population: 715_522,
    medianIncome: 68_000,
    concierge: 44,
    medSpas: 72,
    specialtyClinics: 52,
    healthScore: 9,
    // One of the healthiest cities in America — outdoor culture, high health spend.
    // Cherry Creek, LoDo, Greenwood Village = affluent concierge territory.
    // Functional medicine particularly strong. Growing hormone/longevity clinic scene.
  },
  {
    id: '9',
    city: 'Tampa',
    population: 399_700,
    medianIncome: 58_000,
    concierge: 35,
    medSpas: 68,
    specialtyClinics: 38,
    healthScore: 7,
    // Emerging market. South Tampa, Hyde Park, Westchase = higher-income pockets.
    // Med spa market growing as population expands. Lower concierge density = early mover
    // advantage. Proximity to Sarasota/Naples affluent corridor.
  },
  {
    id: '10',
    city: 'Orlando',
    population: 320_742,
    medianIncome: 52_000,
    concierge: 28,
    medSpas: 62,
    specialtyClinics: 32,
    healthScore: 7,
    // Underserved market relative to Florida peers. Dr. Phillips, Winter Park, Lake Nona
    // (Medical City) = growing premium healthcare hubs. Tourism economy suppresses median
    // income but target demo (residents, not tourists) skews higher. Early stage market
    // with real upside as population and wealth grow.
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
