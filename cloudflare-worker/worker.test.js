import { test } from 'node:test';
import assert from 'node:assert/strict';
import worker from './worker.js';

function request(path, options = {}) {
  return new Request(`https://watchly-proxy.example.workers.dev${path}`, {
    headers: { Origin: 'https://watchly-1a156.web.app', ...(options.headers || {}) },
    ...options,
  });
}

function context() {
  return { waitUntil() {} };
}

test('allowed path succeeds and injects the Worker secret', async () => {
  const originalFetch = globalThis.fetch;
  let upstreamRequest;
  globalThis.fetch = async url => {
    upstreamRequest = new URL(url);
    return new Response(JSON.stringify({ results: [{ id: 1 }] }), {
      headers: { 'Content-Type': 'application/json' },
    });
  };
  try {
    const response = await worker.fetch(request('/discover/movie?page=2&api_key=client-key'), { TMDB_KEY: 'worker-secret' }, context());
    assert.equal(response.status, 200);
    assert.equal(upstreamRequest.searchParams.get('api_key'), 'worker-secret');
    assert.equal(upstreamRequest.searchParams.get('page'), '2');
    assert.deepEqual(await response.json(), { results: [{ id: 1 }] });
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('disallowed paths return 404 without fetching', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = () => { throw new Error('must not fetch'); };
  try {
    const response = await worker.fetch(request('/authentication/token/new'), { TMDB_KEY: 'worker-secret' }, context());
    assert.equal(response.status, 404);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('non-GET requests return 405', async () => {
  const response = await worker.fetch(request('/movie/1', { method: 'POST' }), { TMDB_KEY: 'worker-secret' }, context());
  assert.equal(response.status, 405);
});

test('bad origins return 403', async () => {
  const response = await worker.fetch(new Request('https://watchly-proxy.example.workers.dev/movie/1', {
    headers: { Origin: 'https://evil.example' },
  }), { TMDB_KEY: 'worker-secret' }, context());
  assert.equal(response.status, 403);
});

test('the Worker secret never appears in response bodies or headers', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response(JSON.stringify({ note: 'worker-secret' }), {
    headers: { 'X-Upstream-Secret': 'worker-secret', 'Content-Type': 'application/json' },
  });
  try {
    const response = await worker.fetch(request('/movie/1'), { TMDB_KEY: 'worker-secret' }, context());
    const serializedHeaders = [...response.headers].map(([name, value]) => `${name}:${value}`).join('\n');
    assert.equal((await response.text()).includes('worker-secret'), false);
    assert.equal(serializedHeaders.includes('worker-secret'), false);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
