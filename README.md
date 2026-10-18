# Gulf Family Travels

**Gulf DIY Travels: Plan Your Own Family Holiday from Dubai, Qatar & Saudi Arabia**
_Skip the travel agent. Save AED 2,000+. We show you exactly how._

A static Astro site for **gulfamilytravel.com**, hosted free on Cloudflare Pages. It has no backend, no database and no paid services. Affiliate links send readers to partners (Skyscanner, Booking.com, Klook, GetYourGuide), and the partners take the payment.

---

## Quick start

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # outputs static site to ./dist
npm run preview    # serve ./dist locally
npm run check      # type-check .astro + .ts files
```

You need Node **22.12+** (see `.nvmrc`).

---

## Project structure

```
src/
  components/
    AffiliateButton.astro   rel="sponsored nofollow", new tab, partner data attrs
    SavingsTable.astro      DIY vs agent table; fails the build if rows ≠ totals
    TripKit.astro           flights → hotel → transport → experiences
    TransportMap.astro      airport → hotel → attractions → airport legs + Klook links
    FAQBlock.astro          accordion + inline FAQPage JSON-LD; enforces 40–58 words
  data/
    site.ts                 site name, USP numbers, nav
    affiliates.ts           partner IDs + deep-link builders  ← put your IDs here
  layouts/
    Base.astro              meta, OG/Twitter, JSON-LD @graph, dark mode, USP banner
  lib/
    schema.ts               Article, HowTo, TouristTrip, Breadcrumb builders
  pages/
    index.astro             hub: Indian RP budget / EU-US RP premium / visa-free for Indians
    bali-family-trip-from-dubai.astro
    404.astro
  styles/
    global.css              tokens, light/dark, typography, primitives
public/
  robots.txt                allows Google, Bing + AI crawlers (GPTBot, OAI-SearchBot, PerplexityBot…)
  sitemap.xml               placeholder → points to generated sitemap-0.xml
  llms.txt                  plain-text site summary for LLMs
  _headers                  Cloudflare security + cache headers
  favicon.svg, og-default.svg
astro.config.mjs            site URL, static output, sitemap
wrangler.toml               Cloudflare Pages config
```

---

## AEO / GEO rules the build enforces

These rules are checked at build time, so a page that breaks one won't deploy.

| Rule | Where it's enforced |
| --- | --- |
| FAQ answers are 40–58 words | `FAQBlock.astro` throws on build |
| `dateModified` ≠ `datePublished` | `lib/schema.ts → assertFreshDates()` |
| Savings rows add up to the headline totals (4,310 / 6,700) | `SavingsTable.astro` `expectDiyTotal` / `expectAgentTotal` |

Every page also has:

- the question as its **H1**, followed by a 40–58 word **Quick answer** box (the passage AI engines quote)
- **Article + HowTo + TouristTrip** in one JSON-LD `@graph` (from `Base.astro`), plus **FAQPage** emitted by `FAQBlock`
- Organization and WebSite nodes added automatically

**When you update a page,** change its `DATE_MODIFIED` constant at the top of the file. For a new destination page, copy `bali-family-trip-from-dubai.astro`, change the data arrays, and the components handle the layout and schema.

> Google no longer shows HowTo rich results and limits FAQ rich results to some sites. The schema still matters here because ChatGPT, Gemini, Perplexity and Bing Copilot use it to extract answers.

---

## Before you launch: replace placeholders

1. **Affiliate IDs.** Edit `src/data/affiliates.ts` and replace every `YOUR_…` value:
   - Skyscanner (via Impact): publisher ID + ad ID in `skyscannerImpact`
   - Booking.com: `bookingAid`
   - Klook: `klookAid`
   - GetYourGuide: `gygPartnerId`

   Links work without the IDs, but they don't earn commission.
2. **Prices and visa facts.** The AED figures are illustrative estimates, and the visa table reflects rules at the time of writing. Check each one against live prices and the official immigration sites before you publish.
3. **OG image.** `public/og-default.svg` is a placeholder. Facebook, WhatsApp and LinkedIn don't render SVG previews, so export a 1200×630 **PNG** and update `ogImage` in `src/data/site.ts`.

---

## Deploy: git init → GitHub → Cloudflare Pages

### 1. Initialise git

```bash
cd GulfFamilyTravel
git init
git add .
git commit -m "Initial commit: Gulf Family Travels Astro site"
git branch -M main
```

### 2. Push to GitHub

Create an **empty** repo on GitHub (no README, no .gitignore), e.g. `gulf-family-travel`, then:

```bash
git remote add origin https://github.com/<your-username>/gulf-family-travel.git
git push -u origin main
```

Or with the GitHub CLI:

```bash
gh repo create gulf-family-travel --private --source=. --push
```

### 3. Connect Cloudflare Pages (free)

1. Log in at **dash.cloudflare.com**, open **Workers & Pages**, click **Create**, choose the **Pages** tab, then **Connect to Git**.
2. Authorise GitHub and select the `gulf-family-travel` repo.
3. Build settings:

   | Setting | Value |
   | --- | --- |
   | Framework preset | **Astro** |
   | Build command | `npm run build` |
   | Build output directory | `dist` |
   | Root directory | _(leave blank)_ |

4. **Environment variables:** add `NODE_VERSION` = `22.12.0` (or newer).
5. Click **Save and Deploy**. Your site goes live at `https://gulf-family-travel.pages.dev`.

From now on, every `git push` to `main` redeploys automatically, and every other branch or PR gets its own preview URL.

### 4. Add your domain

1. In the Pages project, open **Custom domains**, click **Set up a custom domain**, and enter `gulfamilytravel.com`.
2. If the domain's DNS is already on Cloudflare, the record is added automatically. If not, move the nameservers to Cloudflare (free plan) or add the CNAME it shows you.
3. Add `www.gulfamilytravel.com` too, then create a **Redirect Rule** (Rules → Redirect Rules) to send `www` to the apex domain with a 301.

### 5. Let AI crawlers in (important for AEO)

Cloudflare can block AI crawlers by default on new zones. Go to **your domain → Security → Bots** (or **AI Crawl Control**) and:

- turn **off** "Block AI bots" / "AI Scrapers and Crawlers"
- turn **off** Cloudflare's **managed robots.txt** so your own `public/robots.txt` is served

Then open `https://gulfamilytravel.com/robots.txt` and check that it matches the file in this repo.

### 6. Submit sitemaps

- Google Search Console: add the domain property, then submit `https://gulfamilytravel.com/sitemap-index.xml`
- Bing Webmaster Tools: import from Search Console. This also feeds ChatGPT search and Copilot.

### Alternative: deploy from your laptop (no GitHub)

```bash
npx wrangler login
npm run deploy           # builds, then `wrangler pages deploy` using wrangler.toml
```

---

## Why no Cloudflare adapter?

`@astrojs/cloudflare` is only needed for server-rendered pages, which run on Cloudflare Workers. This site is fully static (`output: 'static'`), so Pages serves plain HTML from its CDN with **unlimited free requests** and no Worker invocations to count against the free tier. If you ever need SSR (a search page, for example), run `npx astro add cloudflare` and mark only that route with `export const prerender = false`.

## Tech notes

- **Fonts** are self-hosted via Fontsource (Syne, Inter Variable, JetBrains Mono), so there are no Google Fonts requests.
- **Dark mode** follows the OS by default. The header toggle saves the choice in `localStorage`, and an inline script applies it before first paint so there is no flash.
- **Niche colours:** set `data-niche="a"` (desert gold `#C8730A`) or `data-niche="b"` (ocean teal `#0A7A6B`) on any element and every component inside switches accent.
- **Astro version:** pinned to 6.x because Astro 7 needs Node ≥ 22.22. To upgrade, switch to Node 22.22+, run `npm i astro@latest`, update `.nvmrc`, and set `NODE_VERSION` in Cloudflare to match.
