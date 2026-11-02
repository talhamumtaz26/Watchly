const ALLOWED_ORIGINS = new Set([
  'https://watchly-1a156.web.app',
  'https://watchly-1a156.firebaseapp.com',
  'http://localhost:3000',
  'http://localhost',
]);

const ALLOWED_PATH = /^\/(?:trending\/(?:all|movie|tv)\/(?:day|week)|discover\/(?:movie|tv)|search\/(?:multi|movie|tv)|movie\/(?:popular|upcoming|now_playing)|tv\/popular|(?:movie|tv)\/\d+(?:\/(?:credits|similar|videos|reviews|watch\/providers))?|tv\/\d+\/season\/\d+|person\/\d+(?:\/(?:movie_credits|tv_credits))?|genre\/(?:movie|tv)\/list)$/;
const SAFE_QUERY_PARAMETERS = new Set([
  'page',
  'query',
  'sort_by',
  'primary_release_year',
  'first_air_date_year',
  'release_date.lte',
  'primary_release_date.lte',
  'first_air_date.lte',
  'first_air_date.gte',
  'with_genres',
  'with_original_language',
  'with_origin_country',
  'region',
  'watch_region',
  'with_watch_monetization_types',
  'with_watch_providers',
  'language',
  'include_adult',
]);
const MAX_QUERY_LENGTH = 1200;

function jsonResponse(status, body, origin, extraHeaders = {}) {
  const headers = new Headers({
    'Content-Type': 'application/json; charset=utf-8',
    'Vary': 'Origin',
    ...extraHeaders,
  });
  if (origin && ALLOWED_ORIGINS.has(origin)) headers.set('Access-Control-Allow-Origin', origin);
  return new Response(JSON.stringify(body), { status, headers });
}

function cacheSeconds(path) {
  if (path.startsWith('/search/')) return 300;
  if (path.startsWith('/movie/') || path.startsWith('/tv/') || path.startsWith('/person/')) {
    return /\/(?:credits|watch\/providers)$/.test(path) || /^\/(?:movie|tv)\/\d+$/.test(path) ? 3600 : 600;
  }
  return 600;
}

function cleanUpstreamResponse(upstream, key, origin, seconds) {
  return upstream.text().then(text => {
    const body = key ? text.split(key).join('[redacted]') : text;
    return new Response(body, {
      status: upstream.status,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': `public, max-age=${seconds}, s-maxage=${seconds}`,
        'Vary': 'Origin',
        ...(origin ? { 'Access-Control-Allow-Origin': origin } : {}),
      },
    });
  });
}

export default {
  async fetch(request, env, ctx) {
    const origin = request.headers.get('Origin');
    if (origin && !ALLOWED_ORIGINS.has(origin)) {
      return jsonResponse(403, { error: 'Origin not allowed' }, null);
    }

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Max-Age': '86400',
          'Vary': 'Origin',
          ...(origin ? { 'Access-Control-Allow-Origin': origin } : {}),
        },
      });
    }
    if (request.method !== 'GET') {
      return jsonResponse(405, { error: 'GET required' }, origin, { Allow: 'GET, OPTIONS' });
    }

    const requestUrl = new URL(request.url);
    const path = requestUrl.pathname.replace(/^\/api\/tmdb(?=\/)/, '') || '/';
    if (!ALLOWED_PATH.test(path)) return jsonResponse(404, { error: 'Unsupported endpoint' }, origin);
    if (requestUrl.search.length > MAX_QUERY_LENGTH) {
      return jsonResponse(400, { error: 'Query too long' }, origin);
    }

    const upstreamUrl = new URL(`https://api.themoviedb.org/3${path}`);
    for (const [name, value] of requestUrl.searchParams) {
      if (name.toLowerCase() === 'api_key' || name.toLowerCase() === 'authorization') continue;
      if (!SAFE_QUERY_PARAMETERS.has(name) || value.length > 300) {
        return jsonResponse(400, { error: 'Invalid query parameter' }, origin);
      }
      if (name === 'page' && (!/^\d+$/.test(value) || Number(value) < 1 || Number(value) > 500)) {
        return jsonResponse(400, { error: 'Invalid page' }, origin);
      }
      if (upstreamUrl.searchParams.has(name)) return jsonResponse(400, { error: 'Invalid query parameter' }, origin);
      upstreamUrl.searchParams.set(name, value);
    }

    const key = env && env.TMDB_KEY;
    if (!key) return jsonResponse(500, { error: 'Proxy is not configured' }, origin);
    upstreamUrl.searchParams.set('api_key', key);

    const seconds = cacheSeconds(path);
    // Cloudflare Workers provides caches.default even though the dashboard editor lacks its type.
    // @ts-ignore
    const cacheStorage = globalThis.caches;
    const cache = cacheStorage && cacheStorage['default'];
    const cacheKey = new Request(upstreamUrl.toString(), { method: 'GET' });
    if (cache) {
      const cached = await cache.match(cacheKey);
      if (cached) {
        const headers = new Headers(cached.headers);
        headers.set('Vary', 'Origin');
        if (origin) headers.set('Access-Control-Allow-Origin', origin);
        return new Response(cached.body, { status: cached.status, headers });
      }
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    try {
      const upstream = await fetch(upstreamUrl, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        redirect: 'follow',
        signal: controller.signal,
      });
      if (!upstream.ok) {
        return jsonResponse(upstream.status === 404 ? 404 : upstream.status, { error: 'Movie data unavailable' }, origin);
      }
      const response = await cleanUpstreamResponse(upstream, key, origin, seconds);
      if (cache) ctx.waitUntil(cache.put(cacheKey, response.clone()));
      return response;
    } catch {
      return jsonResponse(502, { error: 'Movie data unavailable' }, origin);
    } finally {
      clearTimeout(timeout);
    }
  },
};
