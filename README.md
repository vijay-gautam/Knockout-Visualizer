# World Cup 2026 — Knockout Bracket

A single-page circular knockout bracket. Lines are colour-coded by match status,
eliminated teams grey out, hovering shows match detail, and clicking a match opens
its FIFA Match Centre page. All free to host and keep live.

## How it works

```
Cloudflare Worker (data)              GitHub Pages (static SPA)
┌───────────────────────────┐         ┌────────────────────────┐
│ wc-worker/                │         │ index.html  (the SPA)  │
│  cron 1m → scheduled()    │         │ css/ · src/            │
│   → fetch FIFA JSON API   │         │ trophy.svg             │
│   → map matches to slots  │  fetch  │                        │
│   → KV.put(bracket)       │ ◀────── │ fetch(DATA_URL)        │
│  fetch() → KV + CORS      │  JSON   │ every 60s, re-render   │
└───────────────────────────┘         └────────────────────────┘
```

- **No API key, no server cost.** FIFA's public JSON API powers fifa.com itself;
  the Worker and Pages both run on free tiers.
- The Worker is the single source of truth for results. The SPA only renders.
- Team slots for the Round of 16 onward are **filled forward** from each round's
  winners automatically — both in the browser and in the Worker.
- Match URLs are derived (`/match/{comp}/{season}/{stage}/{match}`), never hardcoded.
- The Worker hosts no HTML; Pages serves the SPA. They're wired together by
  `DATA_URL` (in `src/config.js`) plus the Worker's CORS header.

## Files

| File | Role |
|------|------|
| `index.html` | Markup only — links the stylesheet and the entry module. |
| `css/styles.css` | All styling. |
| `src/main.js` | Composition root — wires the modules and starts polling. |
| `src/config.js` | Geometry, palette, sizing, `DATA_URL`, polling settings. |
| `src/defaultData.js` | Offline fallback bracket data (used if the Worker is unreachable). |
| `src/geometry.js` | Pure polar/cartesian math. |
| `src/bracketModel.js` | Builds the bracket and fills later rounds forward from winners. |
| `src/shapes.js` | Shield / hexagon / flag-URL generators. |
| `src/svgUtil.js` | SVG element factory + helpers. |
| `src/scene.js` | Builds the SVG scaffolding (defs, gradient, filters, layers). |
| `src/renderer.js` | Draws a bracket model onto the scene. |
| `src/tooltip.js` | Hover tooltip. |
| `src/dataService.js` | Fetches `DATA_URL` and polls on an interval. |
| `wc-worker/` | Cloudflare Worker — the FIFA poller + JSON API (see its README). |
| `scripts/poll.mjs` | Local one-shot poller (dev/testing; writes `data.json`). |
| `data.json` | Local fixture for offline dev; production data comes from the Worker. |
| `trophy.svg` | Centre trophy art. |

> The SPA uses native ES modules, so it must be served over HTTP (a static
> server or GitHub Pages) — opening `index.html` straight off disk won't load
> the modules. Any static server works: `npx serve -l 3456 .`

## Data source

The SPA fetches results from whatever `DATA_URL` points at (`src/config.js`).
There are two ways to keep that data fresh — pick one:

| Option | How | Docs |
|--------|-----|------|
| **A · Cloudflare Worker** (default) | Worker polls FIFA every minute and serves JSON; `DATA_URL` is the Worker URL. | [`wc-worker/README.md`](wc-worker/README.md) |
| **B · GitHub Actions** | A scheduled Action polls FIFA, commits `data.json`; `DATA_URL` is `'data.json'`. | [`scripts/README.md`](scripts/README.md) |

For fully-offline local dev, set `DATA_URL = 'data.json'` and refresh the fixture
with `node scripts/poll.mjs`.

## Run locally

```bash
npx serve -l 3456 .          # serve the SPA (any static server works)
node scripts/poll.mjs        # optionally refresh the local data.json fixture
```

## Deploy on GitHub Pages

1. Push this repo to GitHub.
2. Set up a data source — **Option A** ([Worker](wc-worker/README.md)) or
   **Option B** ([Actions](scripts/README.md)) — and set `DATA_URL` accordingly.
3. **Settings → Pages → Source: Deploy from a branch → `main` / root.**
4. Open `https://<user>.github.io/<repo>/` — asset links are relative, so it
   works under the repo subpath.

Merge to `main` before checking Pages; it deploys from `main`.

## Maintenance notes

- Result polling, the `FIFA2CC` code map, and the `MatchStatus` mapping
  (`0` finished, `3` live, else upcoming) now live in `wc-worker/src/fifa.js`.
  `scripts/poll.mjs` keeps a copy for local use.
- Competition/season ids (`17` / `285023`) are pinned at the top of
  `wc-worker/src/fifa.js` (and `scripts/poll.mjs`).
- The R32 seed pairings live in `wc-worker/src/seed.js` and `src/defaultData.js` —
  keep the two in sync if the bracket seeding changes.
