export const QUOTE_STATUSES = [
  'draft',
  'submitted',
  'quoted',
  'accepted',
  'expired',
] as const;

export type QuoteStatus = (typeof QUOTE_STATUSES)[number];

export const EMIRATES = [
  'Abu Dhabi',
  'Dubai',
  'Sharjah',
  'Ajman',
  'Umm Al Quwain',
  'Ras Al Khaimah',
  'Fujairah',
] as const;

export type Emirate = (typeof EMIRATES)[number];

export const INDUSTRIES = [
  'Technology',
  'Trading',
  'Manufacturing',
  'Construction',
  'Healthcare',
  'Hospitality',
  'Retail',
  'Professional Services',
  'Transport & Logistics',
  'Other',
] as const;

export type Industry = (typeof INDUSTRIES)[number];

export const COVERAGE_TYPES = [
  'property',
  'liability',
  'workers-compensation',
  'fleet',
  'comprehensive',
] as const;

export type CoverageType = (typeof COVERAGE_TYPES)[number];
