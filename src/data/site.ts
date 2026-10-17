// Single source of truth for site-wide constants.

export const SITE = {
  name: 'Gulf Family Travels',
  url: 'https://gulfamilytravel.com',
  title: 'Gulf DIY Travels — Plan Your Own Family Holiday from Dubai & Qatar',
  tagline: 'Skip the travel agent. Save AED 2,000+. We show you exactly how.',
  description:
    'DIY family holiday guides for Dubai and Qatar residents. Exact booking order, transport cheat sheets and visa checklists so you save AED 2,000+ per person versus a travel agent.',
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
  diyTotal: 4970,
  agentTotal: 7100,
  currency: 'AED',
} as const;

export const NAV = [
  { label: 'All trips', href: '/' },
  { label: 'Bali guide', href: '/bali-family-trip-from-dubai' },
  { label: 'Visa-free for Indians', href: '/#visa-free-for-indians' },
] as const;

export const formatAED = (n: number) => `AED ${n.toLocaleString('en-US')}`;
