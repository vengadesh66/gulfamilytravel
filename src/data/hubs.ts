// Country hubs. `/` (UAE, also the default), `/qatar` and `/saudi-arabia`
// render the same <HubPage /> with these settings. The Worker in
// worker/index.ts sends Qatar and Saudi visitors from `/` to their hub.

import type { Currency } from './site';

export type Origin = 'DXB' | 'DOH' | 'RUH' | 'JED';
export type HubKey = 'uae' | 'qatar' | 'saudi';

/** Per-person figures already converted to the hub's currency. */
export interface HubMoney {
  diy: string;
  agent: string;
  family: string;
}

export interface Hub {
  key: HubKey;
  path: string;
  /** Switcher link. The UAE hub carries ?hub=uae so the Worker doesn't redirect. */
  switchHref: string;
  label: string;
  /** <title>; the UAE hub uses SITE.title. */
  title?: string;
  /** Must be the query people type into ChatGPT, not a marketing line. */
  h1: string;
  /** Unique per hub; also used for og:description. */
  description: string;
  /** 2–3 sentences answering the H1 directly. Figures come from the savings rows. */
  quickAnswer: (m: HubMoney) => string;
  /** Line under the H1. Defaults to SITE.tagline. */
  heroLine?: string;
  eyebrowAudience: string;
  currency: Currency;
  ogImage: string;
  /** Main departure airport: cards, visa table and Skyscanner links default to it. */
  origin: Origin;
  /** Other airports offered as "Flying from elsewhere?" links. */
  altOrigins: Origin[];
  /** Airports whose flight times show on destination cards. */
  cardOrigins: Origin[];
  /** Departure cities for TouristTrip schema. */
  departFrom: readonly ('Dubai' | 'Doha' | 'Riyadh' | 'Jeddah')[];
  /** Flight-time city: "from Dubai" / "from Doha" / "from Riyadh" */
  city: string;
  /** City phrase for FAQs: "Riyadh or Jeddah" */
  cityPhrase: string;
  /** "living in the UAE" */
  residence: string;
  residenceBadge: string;
  indianIn: string;
  premiumIn: string;
  faqFrom: string;
  visaReach: string;
  premiumReach: string;
  showKsaNote?: boolean;
  about: string[];
  touristType: string[];
}

const BASE_TYPES = ['Families with children', 'Indian passport holders', 'EU/US expats'];

export const HUBS: Record<HubKey, Hub> = {
  uae: {
    key: 'uae',
    path: '/',
    switchHref: '/?hub=uae',
    label: 'UAE',
    h1: 'Best Family Holidays from Dubai 2026 — Picked by Budget & Visa Type',
    description:
      'The best family holidays from Dubai in 2026, sorted by budget and passport: budget trips for Indian residents of the UAE, premium picks for EU/US expats, and visa-free destinations for Indians, with flight times from DXB. Book it yourself and save AED 2,000+ per person.',
    quickAnswer: (m) =>
      `For 2026, Bali is the best all-round family holiday from Dubai, at about ${m.diy} per person booked yourself versus ${m.agent} or more through an agent. Indian residents get the best value from Thailand, Malaysia and Sri Lanka. EU and US expats should look at Mauritius and the Maldives.`,
    eyebrowAudience: 'For UAE residents',
    currency: 'AED',
    ogImage: '/og-default.svg',
    origin: 'DXB',
    altOrigins: ['DOH', 'RUH'],
    cardOrigins: ['DXB', 'RUH'],
    departFrom: ['Dubai'],
    city: 'Dubai',
    cityPhrase: 'Dubai',
    residence: 'the UAE',
    residenceBadge: 'UAE',
    indianIn: 'Dubai',
    premiumIn: 'Dubai',
    faqFrom: 'Dubai',
    visaReach: 'All are under ten hours from Dubai.',
    premiumReach: 'are all within seven hours of Dubai',
    showKsaNote: true,
    about: ['Family holidays', 'Dubai', 'United Arab Emirates', 'Visa-free travel for Indians', 'DIY travel planning'],
    touristType: [...BASE_TYPES, 'UAE residents'],
  },
  saudi: {
    key: 'saudi',
    path: '/saudi-arabia',
    switchHref: '/saudi-arabia',
    label: 'Saudi Arabia',
    title: 'Family Holidays from Saudi Arabia 2026: DIY by Budget & Visa',
    h1: 'Best Family Holidays from Saudi Arabia 2026 — Picked by Budget & Visa Type',
    description:
      'The best family holidays from Riyadh and Jeddah in 2026, sorted by budget and passport: budget trips for Indian residents of Saudi Arabia, premium picks for EU/US expats, and visa-free destinations for Indians. Book it yourself and save SAR 2,400+ per person.',
    quickAnswer: (m) =>
      `From Riyadh or Jeddah, the best-value family holidays in 2026 are Bali, Bangkok and Kuala Lumpur, with Bangkok and Kuala Lumpur about 6 and 7 hours from Riyadh. Booked yourself, five nights costs about ${m.diy} per person (${m.family} for a family of four), versus ${m.agent} or more per person through an agent. Visa rules depend on your passport, not your Saudi residence.`,
    heroLine: 'Flying from Riyadh or Jeddah? Save SAR 2,000+ booking yourself.',
    eyebrowAudience: 'For Saudi Arabia residents',
    currency: 'SAR',
    ogImage: '/og-saudi-arabia.svg',
    origin: 'RUH',
    altOrigins: ['JED'],
    cardOrigins: ['RUH'],
    departFrom: ['Riyadh', 'Jeddah'],
    city: 'Riyadh',
    cityPhrase: 'Riyadh or Jeddah',
    residence: 'Saudi Arabia',
    residenceBadge: 'Saudi',
    indianIn: 'Saudi Arabia',
    premiumIn: 'Saudi Arabia',
    faqFrom: 'Saudi Arabia',
    visaReach: 'Most are within ten hours of Riyadh or Jeddah, some with one stop.',
    premiumReach: 'are all reachable from Riyadh or Jeddah with one stop at most',
    about: ['Family holidays', 'Saudi Arabia', 'Riyadh', 'Jeddah', 'Visa-free travel for Indians', 'DIY travel planning'],
    touristType: [...BASE_TYPES, 'Saudi Arabia residents'],
  },
  qatar: {
    key: 'qatar',
    path: '/qatar',
    switchHref: '/qatar',
    label: 'Qatar',
    title: 'Family Holidays from Qatar 2026: DIY by Budget & Visa',
    h1: 'Best Family Holidays from Qatar 2026 — Picked by Budget & Visa Type',
    description:
      'The best family holidays from Doha in 2026, sorted by budget and passport: budget trips for Indian residents of Qatar, premium picks for EU/US expats, and visa-free destinations for Indians, with flight times from DOH. Book it yourself and save QAR 2,300+ per person.',
    quickAnswer: (m) =>
      `From Doha, the best-value family holidays in 2026 are Bali, Bangkok and Kuala Lumpur, all reachable nonstop in about 6.5 to 9 hours. Booked yourself, five nights costs about ${m.diy} per person (${m.family} for a family of four), versus ${m.agent} or more per person through an agent. Visa rules depend on your passport, not your Qatar residence.`,
    heroLine: 'Flying from Doha? Save QAR 2,000+ booking yourself.',
    eyebrowAudience: 'For Qatar residents',
    currency: 'QAR',
    ogImage: '/og-qatar.svg',
    origin: 'DOH',
    altOrigins: [],
    cardOrigins: ['DOH'],
    departFrom: ['Doha'],
    city: 'Doha',
    cityPhrase: 'Doha',
    residence: 'Qatar',
    residenceBadge: 'Qatar',
    indianIn: 'Qatar',
    premiumIn: 'Qatar',
    faqFrom: 'Qatar',
    visaReach: 'All are under ten hours from Doha.',
    premiumReach: 'are all within seven hours of Doha',
    about: ['Family holidays', 'Qatar', 'Doha', 'Visa-free travel for Indians', 'DIY travel planning'],
    touristType: [...BASE_TYPES, 'Qatar residents'],
  },
};

export const HUB_LIST: Hub[] = [HUBS.uae, HUBS.qatar, HUBS.saudi];

/* ---------------------------------------------------------- destinations */
// Flight times are approximate, nonstop where one exists. Leave an origin out
// when unknown: the card then links to live Skyscanner fares instead.
export type FlightTimes = Partial<Record<Origin, string>>;

export interface Destination {
  name: string;
  country: string;
  /** Skyscanner destination code (airport or city). */
  to: string;
  flights: FlightTimes;
  diyFrom: number; // AED per person, est. 5 nights incl. flights
  bestFor: string;
  visa: string;
  href?: string; // set once the guide is live
}

export const indianBudget: Destination[] = [
  { name: 'Bali', country: 'Indonesia', to: 'DPS', flights: { DXB: '9h direct', DOH: '~9h direct' }, diyFrom: 4310, bestFor: 'Water parks, beaches, culture', visa: 'Visa on arrival', href: '/bali-family-trip-from-dubai' },
  { name: 'Krabi & Phuket', country: 'Thailand', to: 'HKT', flights: { DXB: '6.5h direct', DOH: '~6.5h direct', RUH: '~6h to Bangkok' }, diyFrom: 3900, bestFor: 'Island hopping, easy food', visa: 'Visa exemption' },
  { name: 'Kuala Lumpur & Langkawi', country: 'Malaysia', to: 'KUL', flights: { DXB: '7h direct', DOH: '~7.5h direct', RUH: '~7h to KL' }, diyFrom: 3600, bestFor: 'Theme parks, malls, beaches', visa: 'Visa-free' },
  { name: 'Colombo & south coast', country: 'Sri Lanka', to: 'CMB', flights: { DXB: '4.5h direct', DOH: '~4.5h direct' }, diyFrom: 3200, bestFor: 'Safaris, trains, beaches', visa: 'Online ETA' },
  { name: 'Tbilisi & Kazbegi', country: 'Georgia', to: 'TBS', flights: { DXB: '3h direct', DOH: '~3h direct' }, diyFrom: 3400, bestFor: 'Mountains, snow in winter', visa: 'e-Visa' },
];

export const euUsPremium: Destination[] = [
  { name: 'Mauritius', country: 'Mauritius', to: 'MRU', flights: { DXB: '6.5h direct', DOH: '~7h direct' }, diyFrom: 8900, bestFor: 'Lagoon resorts, kids’ clubs', visa: 'Visa-free' },
  { name: 'Maldives', country: 'Maldives', to: 'MLE', flights: { DXB: '4h direct', DOH: '~4h direct' }, diyFrom: 9800, bestFor: 'Overwater villas, snorkelling', visa: 'Free on arrival' },
  { name: 'Seychelles', country: 'Seychelles', to: 'SEZ', flights: { DXB: '4.5h direct', DOH: '~5h direct' }, diyFrom: 9200, bestFor: 'Quiet beaches, giant tortoises', visa: 'Visitor permit' },
  { name: 'Tokyo & Kyoto', country: 'Japan', to: 'TYO', flights: { DXB: '10h direct', DOH: '~10h direct' }, diyFrom: 11500, bestFor: 'Disney, trains, culture', visa: 'Visa-free (EU/US)' },
  { name: 'Bali private villas', country: 'Indonesia', to: 'DPS', flights: { DXB: '9h direct', DOH: '~9h direct' }, diyFrom: 7400, bestFor: 'Pool villas in Ubud & Canggu', visa: 'Visa on arrival', href: '/bali-family-trip-from-dubai' },
];

/* -------------------------------------------------- visa-free for Indians */
export interface VisaRow {
  country: string;
  to: string;
  entry: string;
  stay: string;
  /** `{115}` = AED 115, shown in the hub's currency. */
  cost: string;
  flights: FlightTimes;
}

export const visaFreeForIndians: VisaRow[] = [
  { country: 'Thailand', to: 'BKK', entry: 'Visa exemption', stay: 'Up to 60 days (under review)', cost: 'Free', flights: { DXB: '6h', DOH: '~6.5h', RUH: '~6h' } },
  { country: 'Malaysia', to: 'KUL', entry: 'Visa-free', stay: '30 days', cost: 'Free (MDAC arrival card)', flights: { DXB: '7h', DOH: '~7.5h', RUH: '~7h' } },
  { country: 'Mauritius', to: 'MRU', entry: 'Visa-free', stay: '90 days', cost: 'Free', flights: { DXB: '6.5h', DOH: '~7h' } },
  { country: 'Maldives', to: 'MLE', entry: 'Visa on arrival', stay: '30 days', cost: 'Free (IMUGA form)', flights: { DXB: '4h', DOH: '~4h' } },
  { country: 'Indonesia (Bali)', to: 'DPS', entry: 'Visa on arrival / e-VoA', stay: '30 days', cost: 'IDR 500k ≈ {115} + Bali levy', flights: { DXB: '9h', DOH: '~9h' } },
  { country: 'Seychelles', to: 'SEZ', entry: 'Visitor permit on arrival', stay: 'Up to 30 days', cost: 'Travel authorisation fee', flights: { DXB: '4.5h', DOH: '~5h' } },
  { country: 'Nepal', to: 'KTM', entry: 'No visa needed', stay: 'No limit', cost: 'Free', flights: { DXB: '4h', DOH: '~4.5h' } },
  { country: 'Bhutan', to: 'PBH', entry: 'Entry permit on arrival', stay: '7 days (extendable)', cost: 'SDF INR 1,200/night', flights: { DXB: '1-stop', DOH: '1-stop', RUH: '1-stop' } },
];
