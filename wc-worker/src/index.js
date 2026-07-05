// Cron tick refreshes FIFA results into KV; fetch() serves the stored JSON to
// the SPA. The Worker hosts no HTML — Pages serves the SPA.

import { SEED } from './seed.js';
import { buildBracketData } from './fifa.js';

const KV_KEY = 'bracket';

const CORS = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, OPTIONS',
  'access-control-allow-headers': 'content-type',
};

// Results without the timestamp, so an unchanged poll compares equal.
const fingerprint = (d) =>
  JSON.stringify([d.r32, d.r16, d.qf, d.sf, d.final]);

// Rebuild from FIFA, but only write KV when results actually changed — keeps
// per-minute polling inside the free KV write quota.
async function refresh(env) {
  const data = await buildBracketData();
  const prev = await env.BRACKET.get(KV_KEY, 'json');
  if (!prev || fingerprint(prev) !== fingerprint(data)) {
    await env.BRACKET.put(KV_KEY, JSON.stringify(data));
  }
  return data;
}

export default {
  async scheduled(event, env, ctx) {
    ctx.waitUntil(refresh(env));
  },

  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS });
    }

    let json = await env.BRACKET.get(KV_KEY);
    if (!json) {
      try {
        json = JSON.stringify(await refresh(env));
      } catch {
        json = JSON.stringify(SEED);
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
