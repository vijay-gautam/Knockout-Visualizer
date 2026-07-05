# wc-worker — FIFA data API on Cloudflare Workers

The data layer for the bracket. A cron tick polls the FIFA API and stores the
current bracket JSON in KV; an HTTP handler serves it to the SPA. The SPA stays
on GitHub Pages — this Worker hosts no HTML.

```
Cron (1 min) ─▶ scheduled() ─▶ FIFA API ─▶ map ─▶ KV (only on change)
Browser ─────▶ fetch()     ─▶ KV ─▶ JSON + CORS
```

## Files

| File | Role |
|------|------|
| `src/index.js` | Worker entry — `scheduled()` (cron) + `fetch()` (HTTP). |
| `src/fifa.js` | FIFA API → bracket JSON. |
| `src/seed.js` | Fixed R32 pairings; keep in sync with `../src/defaultData.js`. |
| `wrangler.toml` | Cron trigger + KV binding config. |

## Deploy

Use `npx wrangler …` (or `npm run deploy`) so it runs the project's pinned CLI.

```bash
cd wc-worker
npm install
npx wrangler login

# 1. Create the KV namespace, paste the printed id into wrangler.toml
npx wrangler kv namespace create BRACKET

# 2. Deploy
npx wrangler deploy

# 3. (optional) warm KV now instead of waiting for the first cron tick
curl https://wc-worker.<your-subdomain>.workers.dev/
```

## Point the SPA at the Worker

In `../src/config.js`:

```js
export const DATA_URL = 'https://wc-worker.<your-subdomain>.workers.dev/';
```

CORS is handled by the Worker, so the cross-origin fetch from Pages works.
The SPA's `DEFAULT_DATA` fallback still covers the Worker being unreachable.

## Local testing

```bash
npx wrangler dev                    # serves fetch() at http://localhost:8787
npx wrangler dev --test-scheduled   # then: curl 'http://localhost:8787/__scheduled'
```

## Notes

- Runs on the free plan. The cron fires every minute, but KV is written only
  when results change, so daily writes stay far under the free 1000/day limit.
- `MatchStatus` mapping (`0` finished, `3` live, else upcoming) lives in
  `src/fifa.js`.
- Competition/season ids (`17` / `285023`) are pinned at the top of `src/fifa.js`.
