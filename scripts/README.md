# Data option B — GitHub Actions poller

An alternative to the Cloudflare Worker ([`../wc-worker/`](../wc-worker/README.md)).
Instead of a Worker serving JSON, a scheduled GitHub Action runs `poll.mjs`,
writes `data.json`, and commits it; GitHub Pages then serves that file directly.

```
GitHub Actions (cron) ─▶ poll.mjs ─▶ FIFA API ─▶ data.json ─▶ commit
GitHub Pages ─────────▶ SPA fetches data.json (same origin, no CORS)
```

Pick this if you'd rather keep everything on GitHub and avoid a Cloudflare
account. Trade-offs vs. the Worker:

| | GitHub Actions | Cloudflare Worker |
|---|---|---|
| Min interval | ~5 min (often delayed) | 1 min |
| Data delivery | commits `data.json` to the repo | serves JSON from an endpoint |
| Extra account | none | Cloudflare (free) |
| Repo history | a commit per change | clean |

## Setup

1. **Point the SPA at the local file.** In `../src/config.js`:
   ```js
   export const DATA_URL = 'data.json';
   ```

2. **Add the workflow** at `.github/workflows/poll.yml`:
   ```yaml
   name: Poll FIFA results

   on:
     schedule:
       - cron: '*/5 * * * *'   # GitHub's minimum granularity
     workflow_dispatch:

   permissions:
     contents: write

   concurrency:
     group: poll
     cancel-in-progress: false

   jobs:
     poll:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         - uses: actions/setup-node@v4
           with:
             node-version: 20
         - run: node scripts/poll.mjs
         - name: Commit if changed
           run: |
             if [[ -n "$(git status --porcelain data.json)" ]]; then
               git config user.name  "wc-bot"
               git config user.email "wc-bot@users.noreply.github.com"
               git add data.json
               git commit -m "chore: refresh results $(date -u +%FT%TZ)"
               git push
             else
               echo "No change."
             fi
   ```

3. **Enable write permission:** repo **Settings → Actions → General →
   Workflow permissions → Read and write.**

The Action runs on its schedule (and on manual dispatch from the Actions tab).

## poll.mjs

Also usable standalone to refresh `data.json` locally:

```bash
node scripts/poll.mjs
```

Competition/season ids (`17` / `285023`), the `FIFA2CC` code map, and the
`MatchStatus` mapping live at the top of `poll.mjs`.
