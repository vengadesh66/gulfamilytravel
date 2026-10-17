// @ts-check
import { defineConfig } from 'astro/config';
import sitemap, { ChangeFreqEnum } from '@astrojs/sitemap';

// Fully static build. Cloudflare Pages serves the /dist folder from its CDN —
// no Worker, no Functions, no server. That keeps the site on the free tier
// with unlimited static requests. (See README → "Why no Cloudflare adapter?")
export default defineConfig({
  site: 'https://gulfamilytravel.com',
  output: 'static',
  trailingSlash: 'never',

  build: {
    // /bali-family-trip-from-dubai → dist/bali-family-trip-from-dubai.html
    // Cloudflare Pages serves it at the clean URL without a redirect.
    format: 'file',
    inlineStylesheets: 'auto',
  },

  integrations: [
    sitemap({
      changefreq: ChangeFreqEnum.WEEKLY,
      priority: 0.7,
      lastmod: new Date(),
      serialize(item) {
        // Hub page gets top priority.
        if (item.url === 'https://gulfamilytravel.com/' || item.url === 'https://gulfamilytravel.com') {
          item.priority = 1.0;
          item.changefreq = ChangeFreqEnum.DAILY;
        }
        return item;
      },
    }),
  ],

  prefetch: {
    prefetchAll: false,
    defaultStrategy: 'hover',
  },
});
