// Post-build AEO/GEO checks over dist/. Runs as part of `npm run build` and
// exits non-zero on any violation, so Cloudflare refuses to deploy a page
// that breaks the rules. No dependencies: the HTML is our own build output.

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const DIST = new URL('../dist/', import.meta.url).pathname;
const PUBLIC = new URL('../public/', import.meta.url).pathname;
const SITE = 'https://gulfamilytravel.com';

// What each indexable page must declare. Keep in step with src/data/hubs.ts.
const PAGES = {
  'index.html': { url: `${SITE}/`, currency: 'AED', cities: ['Dubai'], hub: true },
  'saudi-arabia.html': { url: `${SITE}/saudi-arabia`, currency: 'SAR', cities: ['Riyadh', 'Jeddah'], hub: true },
  'qatar.html': { url: `${SITE}/qatar`, currency: 'QAR', cities: ['Doha'], hub: true },
  'bali-family-trip-from-dubai.html': { url: `${SITE}/bali-family-trip-from-dubai`, currency: 'AED', cities: ['Dubai'] },
};

const FAQ_MIN = 40;
const FAQ_MAX = 58;
const QUICK_ANSWER_WITHIN = 200; // words of page text before the quick-answer box
const AI_BOTS = ['GPTBot', 'ClaudeBot', 'Google-Extended', 'OAI-SearchBot', 'PerplexityBot'];

const errors = [];
const fail = (where, msg) => errors.push(`${where}: ${msg}`);

const decode = (s) =>
  s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'");
const text = (html) =>
  decode(html.replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, ' ').replace(/<[^>]+>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim();
const words = (s) => s.trim().split(/\s+/).filter(Boolean).length;
const attr = (html, re) => decode(html.match(re)?.[1] ?? '');

/** Every JSON-LD node on the page, flattening @graph. */
function jsonLd(html, where) {
  const nodes = [];
  for (const [, raw] of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try {
      const doc = JSON.parse(raw);
      nodes.push(...(doc['@graph'] ?? [doc]));
    } catch (e) {
      fail(where, `invalid JSON-LD (${e.message})`);
    }
  }
  return nodes;
}

/** All values of a key anywhere inside a node. */
function deepValues(node, key, out = []) {
  if (Array.isArray(node)) node.forEach((n) => deepValues(n, key, out));
  else if (node && typeof node === 'object') {
    for (const [k, v] of Object.entries(node)) {
      if (k === key) out.push(v);
      deepValues(v, key, out);
    }
  }
  return out;
}

const htmlFiles = readdirSync(DIST).filter((f) => f.endsWith('.html'));
for (const f of Object.keys(PAGES)) if (!htmlFiles.includes(f)) fail(f, 'page missing from build');

const descriptions = new Map();
const faqReport = [];

for (const file of htmlFiles) {
  const html = readFileSync(join(DIST, file), 'utf8');
  const spec = PAGES[file];

  // --- every page: one H1, a canonical URL
  const h1s = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/g)].map((m) => text(m[1]));
  if (h1s.length !== 1) fail(file, `expected exactly 1 <h1>, found ${h1s.length}`);
  const canonical = attr(html, /<link rel="canonical" href="([^"]+)"/);
  if (!canonical) fail(file, 'missing <link rel="canonical">');

  if (!spec) continue; // 404 and other non-indexed pages stop here

  if (canonical !== spec.url) fail(file, `canonical is ${canonical}, expected ${spec.url}`);

  // --- meta: unique description, OG matches it
  const desc = attr(html, /<meta name="description" content="([^"]*)"/);
  if (!desc) fail(file, 'missing meta description');
  if (descriptions.has(desc)) fail(file, `meta description duplicates ${descriptions.get(desc)}`);
  descriptions.set(desc, file);
  if (attr(html, /<meta property="og:description" content="([^"]*)"/) !== desc) fail(file, 'og:description ≠ meta description');
  if (attr(html, /<meta property="og:url" content="([^"]*)"/) !== spec.url) fail(file, 'og:url ≠ canonical');
  if (spec.currency !== 'AED' && !desc.includes(spec.currency)) fail(file, `meta/OG description doesn't mention ${spec.currency}`);

  // --- schema
  const nodes = jsonLd(html, file);
  const byType = (t) => nodes.filter((n) => n['@type'] === t);

  const [articleNode] = byType('Article');
  if (!articleNode) fail(file, 'missing Article schema');
  else {
    if (!articleNode.datePublished || !articleNode.dateModified) fail(file, 'Article needs datePublished and dateModified');
    if (articleNode.dateModified === articleNode.datePublished) fail(file, 'dateModified === datePublished');
    if (articleNode.url !== spec.url) fail(file, `Article url ${articleNode.url} ≠ canonical`);
    if (!articleNode.speakable?.cssSelector?.length) fail(file, 'missing Speakable on Article');
    if (h1s[0] && articleNode.headline !== h1s[0]) fail(file, 'Article headline ≠ H1');
  }

  if (!byType('HowTo').length) fail(file, 'missing HowTo schema');

  const [trip] = byType('TouristTrip');
  if (!trip) fail(file, 'missing TouristTrip schema');
  else {
    if (trip.url !== spec.url) fail(file, `TouristTrip url ${trip.url} ≠ canonical`);
    const cities = (trip.offers?.eligibleRegion ?? []).map((c) => c.name);
    if (cities.join() !== spec.cities.join()) fail(file, `TouristTrip departure cities [${cities}] ≠ [${spec.cities}]`);
  }

  const [faqPage] = byType('FAQPage');
  if (!faqPage) fail(file, 'missing FAQPage schema');
  else {
    if (!faqPage.mainEntity?.length) fail(file, 'FAQPage has no questions');
    for (const q of faqPage.mainEntity ?? []) {
      const n = words(q.acceptedAnswer?.text ?? '');
      faqReport.push({ file, n, q: q.name });
      if (n < FAQ_MIN || n > FAQ_MAX) fail(file, `FAQ answer ${n} words (need ${FAQ_MIN}–${FAQ_MAX}): ${q.name}`);
    }
    // Schema answers must match what's visible on the page.
    const visible = [...html.matchAll(/<div class="faq-a"[^>]*>\s*<p[^>]*>([\s\S]*?)<\/p>/g)].map((m) => text(m[1]));
    if (visible.length !== faqPage.mainEntity.length) fail(file, 'visible FAQ count ≠ FAQPage schema count');
  }

  for (const c of [...deepValues(nodes, 'priceCurrency'), ...deepValues(nodes, 'currency')]) {
    if (c !== spec.currency) fail(file, `schema currency ${c}, expected ${spec.currency}`);
  }

  // --- quick answer: present, early, 2–3 sentences
  const boxAt = html.indexOf('class="answer-box"');
  if (boxAt < 0) fail(file, 'missing quick-answer box');
  else {
    const body = html.slice(html.indexOf('<body'), boxAt);
    const before = words(text(body));
    if (before > QUICK_ANSWER_WITHIN) fail(file, `quick answer starts after ${before} words (max ${QUICK_ANSWER_WITHIN})`);
    const box = text(html.slice(boxAt).match(/<p\b[^>]*>([\s\S]*?)<\/p>/)?.[1] ?? '');
    const sentences = box.split(/[.!?](?:\s|$)/).filter((s) => s.trim()).length;
    if (sentences < 2 || sentences > 3) fail(file, `quick answer has ${sentences} sentences (need 2–3)`);
  }
}

// --- crawler access
const robots = readFileSync(join(PUBLIC, 'robots.txt'), 'utf8');
const groups = robots.split(/\n(?=User-agent:)/i);
for (const bot of ['*', ...AI_BOTS]) {
  const g = groups.find((x) => new RegExp(`^User-agent:\\s*${bot.replace('*', '\\*')}\\s*$`, 'im').test(x));
  if (bot !== '*' && !g) fail('robots.txt', `no explicit group for ${bot}`);
  if (g && /^Disallow:\s*\/\s*$/im.test(g)) fail('robots.txt', `${bot} is disallowed`);
}
const headers = readFileSync(join(PUBLIC, '_headers'), 'utf8');
if (/X-Robots-Tag:.*(noindex|noai|none)/i.test(headers)) fail('_headers', 'X-Robots-Tag blocks indexing or AI use');

// --- llms.txt lists every indexable page with its H1
const llms = readFileSync(join(PUBLIC, 'llms.txt'), 'utf8');
for (const [file, spec] of Object.entries(PAGES)) {
  const path = join(DIST, file);
  if (!existsSync(path)) continue;
  const h1 = text(readFileSync(path, 'utf8').match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/)?.[1] ?? '');
  if (!llms.includes(`[${h1}](${spec.url})`)) fail('llms.txt', `missing "[${h1}](${spec.url})"`);
}

// --- report
console.log(`\n[aeo] ${htmlFiles.length} pages checked, ${faqReport.length} FAQ answers`);
for (const { file, n, q } of faqReport) console.log(`  ${String(n).padStart(2)} words  ${file.padEnd(34)} ${q}`);
if (errors.length) {
  console.error(`\n[aeo] ${errors.length} error(s):`);
  for (const e of errors) console.error(`  ✘ ${e}`);
  process.exit(1);
}
console.log('[aeo] ✓ all AEO/GEO checks passed\n');
