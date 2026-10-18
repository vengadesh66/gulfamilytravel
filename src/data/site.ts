// Single source of truth for site-wide constants.

export const SITE = {
  name: 'Gulf Family Travels',
  url: 'https://gulfamilytravel.com',
  title: 'Gulf DIY Travels — Plan Your Own Family Holiday from Dubai, Qatar & Saudi Arabia',
  tagline: 'Skip the travel agent. Save AED 2,000+. We show you exactly how.',
  description:
    'DIY family holiday guides for residents of Dubai, Qatar and Saudi Arabia, flying from DXB, DOH, RUH or JED. Exact booking order, transport cheat sheets and visa checklists so you save AED 2,000+ per person versus a travel agent.',
  locale: 'en_AE',
  lang: 'en',
  author: 'Gulf Family Travels Editorial Team',
  twitter: '@gulfamilytravel',
  ogImage: '/og-default.svg',
  logo: '/favicon.svg',
} as const;

// Core USP — shown in the banner on every page and in the Bali hero.
// Figures are per person (family of 4 sharing), 5 nights, booked 6–8 weeks out.
export const USP = {
  headline: 'Save AED 2,000+ by booking yourself vs going to a travel agent',
  diyTotal: 4310,
  agentTotal: 6700,
  currency: 'AED',
} as const;

// Departure cities we write for. Used in copy, schema (areaServed /
// eligibleRegion) and the Skyscanner origin links.
export const DEPARTURE_CITIES = [
  { city: 'Dubai', country: 'United Arab Emirates', airport: 'DXB' },
  { city: 'Doha', country: 'Qatar', airport: 'DOH' },
  { city: 'Riyadh', country: 'Saudi Arabia', airport: 'RUH' },
  { city: 'Jeddah', country: 'Saudi Arabia', airport: 'JED' },
] as const;

/** Origins offered on Skyscanner deep links. */
export const FLIGHT_ORIGINS = ['DXB', 'DOH', 'RUH'] as const;

export const NAV = [
  { label: 'All trips', href: '/' },
  { label: 'Bali guide', href: '/bali-family-trip-from-dubai' },
  { label: 'Visa-free for Indians', href: '/#visa-free-for-indians' },
] as const;

export const formatAED = (n: number) => `AED ${n.toLocaleString('en-US')}`;

/* ----------------------------------------------------------------------------
 * Hub currencies. All three are pegged to the US dollar (AED 3.6725,
 * SAR 3.75, QAR 3.64), so converting from AED is a fixed ratio.
 * Prices are authored in AED and converted, rounded to the nearest 10.
 * ------------------------------------------------------------------------- */
export type Currency = 'AED' | 'SAR' | 'QAR';

const PER_USD: Record<Currency, number> = { AED: 3.6725, SAR: 3.75, QAR: 3.64 };

export const fromAED = (aed: number, cur: Currency) =>
  cur === 'AED' ? aed : Math.round((aed * PER_USD[cur]) / PER_USD.AED / 10) * 10;

export const formatMoney = (n: number, cur: Currency) => `${cur} ${n.toLocaleString('en-US')}`;
