// @ts-check
import { defineConfig } from 'astro/config';
import sitemap, { ChangeFreqEnum } from '@astrojs/sitemap';

// Fully static build. Cloudflare serves the /dist folder as Worker static
// assets. The only code that runs is worker/index.ts, and only for `/`
// (geo-routing to the Qatar and Saudi hubs), so the site stays on the free tier.
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
