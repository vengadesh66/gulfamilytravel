// Geo-routing for the home page. Runs only for `/` (see run_worker_first in
// wrangler.toml); every other request is served straight from static assets.
//
//   Saudi Arabia (SA) → /saudi-arabia
//   Qatar (QA)        → /qatar
//   UAE and elsewhere → / (Dubai hub)
//
// A visitor who picks the UAE hub in the switcher lands on `/?hub=uae`. We
// remember that in a cookie and stop redirecting them.

interface Env {
  ASSETS: { fetch(request: Request): Promise<Response> };
}

const HUB_BY_COUNTRY: Record<string, string> = {
  SA: '/saudi-arabia',
  QA: '/qatar',
};

const COOKIE = 'gft_hub';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 180; // 180 days

const hasHubCookie = (request: Request) =>
  (request.headers.get('Cookie') ?? '').split(/;\s*/).some((c) => c === `${COOKIE}=uae`);

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname !== '/') return env.ASSETS.fetch(request);

    // Explicit choice from the hub switcher: serve the UAE hub and remember it.
    if (url.searchParams.get('hub') === 'uae') {
      const res = await env.ASSETS.fetch(request);
      const out = new Response(res.body, res);
      out.headers.append('Set-Cookie', `${COOKIE}=uae; Path=/; Max-Age=${COOKIE_MAX_AGE}; Secure; SameSite=Lax`);
      out.headers.set('Cache-Control', 'private, no-store');
      return out;
    }

    const country = (request as Request & { cf?: { country?: string } }).cf?.country;
    const target = country ? HUB_BY_COUNTRY[country] : undefined;

    if (target && !hasHubCookie(request)) {
      url.pathname = target;
      return new Response(null, {
        status: 302,
        // Never cache the redirect: the answer depends on the visitor's country.
        headers: { Location: url.toString(), 'Cache-Control': 'private, no-store', Vary: 'Cookie' },
      });
    }

    return env.ASSETS.fetch(request);
  },
};
