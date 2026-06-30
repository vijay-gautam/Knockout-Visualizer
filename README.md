# World Cup 2026 — Knockout Bracket

A single-page circular knockout bracket. Lines are colour-coded by match status,
eliminated teams grey out, hovering shows match detail, and clicking a match opens
its FIFA Match Centre page. All free to host and keep live.

## How it works

```
GitHub Actions (every 5 min)          GitHub Pages (static)
┌───────────────────────────┐         ┌────────────────────────┐
│ scripts/poll.mjs          │         │ index.html  (the SPA)  │
│  → fetch FIFA JSON API    │  commit │ data.json   (results)  │
│  → map matches to slots   │ ──────▶ │ trophy.svg             │
│  → write data.json        │         │                        │
└───────────────────────────┘         │ fetch('data.json')     │
                                       │ every 60s, re-render   │
                                       └────────────────────────┘
```

- **No API key, no server, no cost.** FIFA's public JSON API powers fifa.com itself.
- `data.json` is the single source of truth. The SPA reads it; the poller writes it.
- Team slots for the Round of 16 onward are **filled forward** from each round's
  winners automatically — both in the browser and in the poller.
- Match URLs are derived (`/match/{comp}/{season}/{stage}/{match}`), never hardcoded.

## Files

| File | Role |
|------|------|
| `index.html` | Markup only — links the stylesheet and the entry module. |
| `css/styles.css` | All styling. |
| `src/main.js` | Composition root — wires the modules and starts polling. |
| `src/config.js` | Geometry, palette, sizing, schedule, polling settings. |
| `src/defaultData.js` | Offline fallback bracket data (same shape as `data.json`). |
| `src/geometry.js` | Pure polar/cartesian math. |
| `src/bracketModel.js` | Builds the bracket and fills later rounds forward from winners. |
| `src/shapes.js` | Shield / hexagon / flag-URL generators. |
| `src/svgUtil.js` | SVG element factory + helpers. |
| `src/scene.js` | Builds the SVG scaffolding (defs, gradient, filters, layers). |
| `src/renderer.js` | Draws a bracket model onto the scene. |
| `src/tooltip.js` | Hover tooltip. |
| `src/dataService.js` | Fetches `data.json` and polls on an interval. |
| `data.json` | Live results. Edit by hand or let the poller maintain it. |
| `scripts/poll.mjs` | Node 18+ script that refreshes `data.json` from the FIFA API. |
| `.github/workflows/poll.yml` | Cron that runs the poller and commits changes. |
| `trophy.svg` | Centre trophy art. |

> The SPA uses native ES modules, so it must be served over HTTP (a static
> server or GitHub Pages) — opening `index.html` straight off disk won't load
> the modules. Any static server works: `npx serve -l 3456 .`

## Run locally

```bash
# serve the folder (any static server works)
npx serve -l 3456 .
# refresh results once
node scripts/poll.mjs
```

## Deploy (free)

1. Push this folder to a GitHub repo.
2. **Settings → Pages → Source: Deploy from branch** (root of `main`).
3. **Settings → Actions → General → Workflow permissions: Read and write.**
4. The `poll` workflow runs every 5 min; the site updates on each commit.

## Maintenance notes

- If a flag goes missing, check the team's `IdCountry` in the API response and fix
  the `FIFA2CC` map in `scripts/poll.mjs`.
- `MatchStatus`: `0` = finished, `3` = live, anything else = upcoming. Adjust
  `statusOf()` if FIFA's live value differs.
- Competition/season ids are pinned at the top of `poll.mjs` (`17` / `285023`).
