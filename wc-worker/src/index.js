// Cloudflare Worker: the data/API layer for the World Cup bracket.
//   scheduled() — cron tick: refresh FIFA results into KV
//   fetch()     — serve the stored JSON (with CORS) to the GitHub Pages SPA
// The Worker hosts no HTML; Pages serves the SPA.

import { SEED } from './seed.js';
import { buildBracketData } from './fifa.js';

const KV_KEY = 'bracket';

const CORS = {
  'access-control-allow-origin': '*',        // SPA is served from a different origin (Pages)
  'access-control-allow-methods': 'GET, OPTIONS',
  'access-control-allow-headers': 'content-type',
};

async function refresh(env) {
  const data = await buildBracketData();
  await env.BRACKET.put(KV_KEY, JSON.stringify(data));
  return data;
}

export default {
  // Cron trigger — keep KV fresh.
  async scheduled(event, env, ctx) {
    ctx.waitUntil(refresh(env));
  },

  // HTTP — serve the latest JSON.
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS });
    }

    let json = await env.BRACKET.get(KV_KEY);
    if (!json) {
      // Cold start (KV empty, before first cron tick): build on demand.
      try {
        json = JSON.stringify(await refresh(env));
      } catch {
        json = JSON.stringify(SEED); // FIFA unreachable — serve the skeleton
      }
    }

    return new Response(json, {
      headers: {
        'content-type': 'application/json',
        'cache-control': 'public, max-age=30',
        ...CORS,
      },
    });
  },
};
