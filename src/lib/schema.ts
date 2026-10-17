// JSON-LD builders. Every page combines Article + HowTo + TouristTrip
// (+ BreadcrumbList) here; FAQPage is emitted inline by <FAQBlock />.

import { SITE } from '@/data/site';

type JsonLd = Record<string, unknown>;

const abs = (path: string) => new URL(path, SITE.url).toString();

export const organization = (): JsonLd => ({
  '@type': 'Organization',
  '@id': `${SITE.url}/#organization`,
  name: SITE.name,
  url: SITE.url,
  logo: { '@type': 'ImageObject', url: abs(SITE.logo) },
  slogan: SITE.tagline,
});

export const website = (): JsonLd => ({
  '@type': 'WebSite',
  '@id': `${SITE.url}/#website`,
  name: SITE.name,
  alternateName: SITE.title,
  url: SITE.url,
  inLanguage: 'en',
  publisher: { '@id': `${SITE.url}/#organization` },
});

export interface ArticleInput {
  path: string;
  headline: string;
  description: string;
  datePublished: string; // ISO date
  dateModified: string; // ISO date — must differ from datePublished
  image?: string;
  about?: string[];
}

/** Throws at build time if dateModified === datePublished (AEO freshness rule). */
export function assertFreshDates(datePublished: string, dateModified: string, where: string) {
  if (datePublished === dateModified) {
    throw new Error(
      `[AEO] ${where}: dateModified (${dateModified}) must differ from datePublished. Bump dateModified when you update the page.`,
    );
  }
  if (new Date(dateModified) < new Date(datePublished)) {
    throw new Error(`[AEO] ${where}: dateModified is earlier than datePublished.`);
  }
}

export function article(a: ArticleInput): JsonLd {
  assertFreshDates(a.datePublished, a.dateModified, a.path);
  const url = abs(a.path);
  return {
    '@type': 'Article',
    '@id': `${url}#article`,
    headline: a.headline,
    description: a.description,
    url,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    datePublished: a.datePublished,
    dateModified: a.dateModified,
    inLanguage: 'en',
    image: abs(a.image ?? SITE.ogImage),
    author: { '@type': 'Organization', name: SITE.author, url: SITE.url },
    publisher: { '@id': `${SITE.url}/#organization` },
    ...(a.about?.length ? { about: a.about.map((name) => ({ '@type': 'Thing', name })) } : {}),
  };
}

export interface HowToStepInput {
  name: string;
  text: string;
  url?: string;
}

export interface HowToInput {
  path: string;
  name: string;
  description: string;
  totalTime?: string; // ISO 8601 duration, e.g. 'PT2H'
  estimatedCostAED?: number;
  supply?: string[];
  steps: HowToStepInput[];
}

export function howTo(h: HowToInput): JsonLd {
  const url = abs(h.path);
  return {
    '@type': 'HowTo',
    '@id': `${url}#howto`,
    name: h.name,
    description: h.description,
    ...(h.totalTime ? { totalTime: h.totalTime } : {}),
    ...(h.estimatedCostAED
      ? { estimatedCost: { '@type': 'MonetaryAmount', currency: 'AED', value: h.estimatedCostAED } }
      : {}),
    ...(h.supply?.length ? { supply: h.supply.map((name) => ({ '@type': 'HowToSupply', name })) } : {}),
    step: h.steps.map((s, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: s.name,
      text: s.text,
      url: s.url ? abs(s.url) : `${url}#step-${i + 1}`,
    })),
  };
}

export interface TripStop {
  name: string;
  description: string;
  type?: 'TouristAttraction' | 'TouristDestination' | 'Place' | 'LodgingBusiness' | 'Airport';
  url?: string;
}

export interface TouristTripInput {
  path: string;
  name: string;
  description: string;
  touristType: string[];
  itinerary: TripStop[];
  offerPriceAED?: number;
  provider?: boolean;
}

export function touristTrip(t: TouristTripInput): JsonLd {
  const url = abs(t.path);
  return {
    '@type': 'TouristTrip',
    '@id': `${url}#trip`,
    name: t.name,
    description: t.description,
    url,
    touristType: t.touristType,
    itinerary: {
      '@type': 'ItemList',
      numberOfItems: t.itinerary.length,
      itemListElement: t.itinerary.map((stop, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        item: {
          '@type': stop.type ?? 'TouristAttraction',
          name: stop.name,
          description: stop.description,
          ...(stop.url ? { url: abs(stop.url) } : {}),
        },
      })),
    },
    ...(t.offerPriceAED
      ? {
          offers: {
            '@type': 'Offer',
            name: 'Estimated DIY cost per person',
            price: t.offerPriceAED,
            priceCurrency: 'AED',
            availability: 'https://schema.org/InStock',
            url,
          },
        }
      : {}),
    provider: { '@id': `${SITE.url}/#organization` },
  };
}

export function breadcrumbs(items: { name: string; path: string }[]): JsonLd {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: abs(it.path),
    })),
  };
}

/** Wraps nodes into one @graph document. */
export function graph(nodes: JsonLd[]): JsonLd {
  return { '@context': 'https://schema.org', '@graph': [organization(), website(), ...nodes] };
}

/** Safe for embedding inside <script type="application/ld+json">. */
export const toJsonLd = (data: unknown) => JSON.stringify(data).replace(/</g, '\\u003c');
