// Affiliate stack — redirect model only. We never process payments; every
// link sends the reader to the partner, who handles checkout.
//
// Replace every `YOUR_…` placeholder with your real IDs once each programme
// approves you. Until then the links still work (they just don't track).

export type PartnerKey =
  | 'skyscanner'
  | 'booking'
  | 'klook'
  | 'getyourguide'
  | 'safetywing'
  | 'wise';

export interface Partner {
  key: PartnerKey;
  name: string;
  commission: string;
  /** Used for colour-coding chips in the UI. */
  category: 'flights' | 'hotel' | 'transport' | 'experiences' | 'insurance' | 'money';
}

export const PARTNERS: Record<PartnerKey, Partner> = {
  skyscanner: { key: 'skyscanner', name: 'Skyscanner', commission: '50% rev share', category: 'flights' },
  booking: { key: 'booking', name: 'Booking.com', commission: '4%, 30-day cookie', category: 'hotel' },
  klook: { key: 'klook', name: 'Klook', commission: '3–5%', category: 'transport' },
  getyourguide: { key: 'getyourguide', name: 'GetYourGuide', commission: '8%', category: 'experiences' },
  safetywing: { key: 'safetywing', name: 'SafetyWing', commission: '10%', category: 'insurance' },
  wise: { key: 'wise', name: 'Wise', commission: '$25 per signup', category: 'money' },
};

const IDS = {
  // Skyscanner affiliate links run through Impact: https://skyscanner.pxf.io/c/{publisher}/{ad}/{campaign}
  skyscannerImpact: 'https://skyscanner.pxf.io/c/YOUR_PUBLISHER_ID/YOUR_AD_ID/13416',
  bookingAid: 'YOUR_BOOKING_AID',
  klookAid: 'YOUR_KLOOK_AID',
  gygPartnerId: 'YOUR_GYG_PARTNER_ID',
  safetywingRef: 'YOUR_SAFETYWING_REF',
  wiseInvite: 'https://wise.com/invite/YOUR_WISE_CODE',
} as const;

const isPlaceholder = (v: string) => v.includes('YOUR_');

/* ----------------------------------------------------------------------------
 * Skyscanner — deep-link the exact route so the reader lands on live prices.
 * Dates are YYMMDD per Skyscanner's URL format.
 * ------------------------------------------------------------------------- */
export interface FlightSearch {
  from: string; // IATA, e.g. 'DXB'
  to: string; // IATA, e.g. 'DPS'
  depart?: string; // 'YYMMDD'
  return?: string; // 'YYMMDD'
  adults?: number;
  childAges?: number[];
  market?: 'ae' | 'qa' | 'in';
}

export function skyscannerLink(s: FlightSearch): string {
  const market = s.market ?? 'ae';
  const path = [s.from.toLowerCase(), s.to.toLowerCase(), s.depart, s.return].filter(Boolean).join('/');
  const params = new URLSearchParams({
    adultsv2: String(s.adults ?? 2),
    cabinclass: 'economy',
    rtn: s.return ? '1' : '0',
    preferdirects: 'false',
  });
  if (s.childAges?.length) params.set('childrenv2', s.childAges.join('|'));
  const target = `https://www.skyscanner.${market === 'in' ? 'co.in' : market}/transport/flights/${path}/?${params}`;
  return isPlaceholder(IDS.skyscannerImpact) ? target : `${IDS.skyscannerImpact}?u=${encodeURIComponent(target)}`;
}

/** Skyscanner "Everywhere" explore page from an origin airport. */
export function skyscannerExploreLink(from: string, market: FlightSearch['market'] = 'ae'): string {
  const target = `https://www.skyscanner.${market === 'in' ? 'co.in' : market}/transport/flights-from/${from.toLowerCase()}/`;
  return isPlaceholder(IDS.skyscannerImpact) ? target : `${IDS.skyscannerImpact}?u=${encodeURIComponent(target)}`;
}

/* ----------------------------------------------------------------------------
 * Booking.com — search results for an area with family occupancy pre-filled.
 * ------------------------------------------------------------------------- */
export interface HotelSearch {
  destination: string;
  adults?: number;
  childAges?: number[];
  rooms?: number;
}

export function bookingLink(h: HotelSearch): string {
  const params = new URLSearchParams({
    ss: h.destination,
    group_adults: String(h.adults ?? 2),
    no_rooms: String(h.rooms ?? 1),
    group_children: String(h.childAges?.length ?? 0),
    nflt: 'ht_id=204;review_score=80', // hotels, 8+ review score
    aid: IDS.bookingAid,
  });
  h.childAges?.forEach((age) => params.append('age', String(age)));
  return `https://www.booking.com/searchresults.html?${params}`;
}

/* ----------------------------------------------------------------------------
 * Klook — transfers, private drivers, eSIMs, attraction tickets.
 * ------------------------------------------------------------------------- */
export function klookLink(query: string): string {
  const params = new URLSearchParams({ query, aid: IDS.klookAid });
  return `https://www.klook.com/en-AE/search/result/?${params}`;
}

/* ----------------------------------------------------------------------------
 * GetYourGuide — guided tours.
 * ------------------------------------------------------------------------- */
export function getYourGuideLink(query: string): string {
  const params = new URLSearchParams({ q: query, partner_id: IDS.gygPartnerId, currency: 'AED' });
  return `https://www.getyourguide.com/s/?${params}`;
}

/* ----------------------------------------------------------------------------
 * SafetyWing — travel medical insurance.
 * ------------------------------------------------------------------------- */
export function safetyWingLink(): string {
  return `https://safetywing.com/nomad-insurance?referenceID=${IDS.safetywingRef}&utm_source=${IDS.safetywingRef}&utm_medium=Ambassador`;
}

/* ----------------------------------------------------------------------------
 * Wise — multi-currency card, flat signup bonus.
 * ------------------------------------------------------------------------- */
export function wiseLink(): string {
  return IDS.wiseInvite;
}
