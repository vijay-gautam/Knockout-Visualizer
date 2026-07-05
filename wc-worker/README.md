# wc-worker — FIFA data API on Cloudflare Workers

The data layer for the World Cup bracket. Replaces `scripts/poll.mjs`, the
committed `data.json`, and the GitHub Action. The SPA stays on GitHub Pages and
just fetches its data from this Worker.

```
Cron (*/5 min) ─▶ scheduled() ─▶ FIFA API ─▶ map ─▶ KV
Browser ───────▶ fetch()     ─▶ KV ─▶ JSON + CORS
```

## Files

| File | Role |
|------|------|
| `src/index.js` | Worker entry — `scheduled()` (cron) + `fetch()` (HTTP). |
| `src/fifa.js` | FIFA API → bracket JSON (ported from `scripts/poll.mjs`). |
| `src/seed.js` | Fixed R32 pairings; keep in sync with `../src/defaultData.js`. |
| `wrangler.toml` | Cron trigger + KV binding config. |

## Deploy

```bash
cd wc-worker
npm install
wrangler login

# 1. Create the KV namespace, paste the printed id into wrangler.toml
wrangler kv namespace create BRACKET

# 2. Deploy
wrangler deploy

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
wrangler dev                       # serves fetch() at http://localhost:8787
wrangler dev --test-scheduled      # then: curl 'http://localhost:8787/__scheduled'
```

## Notes

- Free plan covers this: cron is supported; KV writes ≈ 288/day (limit 1000),
  reads well under 100k/day.
- `MatchStatus` mapping (`0` finished, `3` live, else upcoming) lives in
  `src/fifa.js` — adjust there if a live match colours wrong.
- Competition/season ids (`17` / `285023`) are pinned at the top of `src/fifa.js`.
- Once this is live you can delete `.github/workflows/poll.yml`; keep
  `scripts/poll.mjs` as a local testing tool if you like.
