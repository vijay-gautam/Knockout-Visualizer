#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
// World Cup 2026 bracket poller
//
// Reads the public FIFA JSON API, maps each knockout match onto a bracket slot
// in data.json, and writes back status / winner / score / FIFA match URL.
//
// Free to run on GitHub Actions cron. No API key. Node 18+ (global fetch).
//
//   node scripts/poll.mjs
// ─────────────────────────────────────────────────────────────────────────────
import { readFile, writeFile } from 'node:fs/promises';

const COMP = '17';        // FIFA World Cup
const SEASON = '285023';  // 2026 edition
const API = `https://api.fifa.com/api/v3/calendar/matches?idCompetition=${COMP}&idSeason=${SEASON}&count=500&language=en`;
const DATA = new URL('../data.json', import.meta.url);

// FIFA tri-code (IdCountry) → our flagcdn 2-letter code.
// If a match isn't matching, check the team's IdCountry in the API and fix here.
const FIFA2CC = {
  RSA:'za', CAN:'ca', NED:'nl', MAR:'ma', GER:'de', PAR:'py', FRA:'fr', SWE:'se',
  BRA:'br', JPN:'jp', CIV:'ci', NOR:'no', MEX:'mx', ECU:'ec', ENG:'gb-eng', COD:'cd',
  POR:'pt', CRO:'hr', ESP:'es', AUT:'at', USA:'us', BIH:'ba', BEL:'be', SEN:'sn',
  ARG:'ar', CPV:'cv', AUS:'au', EGY:'eg', SUI:'ch', ALG:'dz', COL:'co', GHA:'gh',
};

// MatchStatus: 0 = finished, 3 = live (in progress), anything else = not started.
// (Verify against a live match if the colours look wrong — these are the
//  commonly observed FIFA v3 values.)
function statusOf(ms) {
  if (ms === 3) return 'live';
  if (ms === 0) return 'completed';
  return 'upcoming';
}

const key = (a, b) => [a, b].sort().join('|');           // orientation-free pair key
const winnerTeam = (m) =>                                 // same logic as the SPA
  m && m.status === 'completed' && m.winner != null
    ? (m.winner === 0 ? m.c1 : m.c2)
    : null;

async function main() {
  const data = JSON.parse(await readFile(DATA, 'utf8'));

  // 1. Pull every match, index the knockout ones by team-pair.
  const res = await fetch(API, { headers: { 'accept': 'application/json' } });
  if (!res.ok) throw new Error(`FIFA API ${res.status}`);
  const { Results = [] } = await res.json();

  const byPair = new Map();
  for (const m of Results) {
    const hc = FIFA2CC[m.Home?.IdCountry];
    const ac = FIFA2CC[m.Away?.IdCountry];
    if (!hc || !ac) continue;  // group-stage teams not in our bracket, skip

    const status = statusOf(m.MatchStatus);
    let winnerCode = null;
    if (status === 'completed' && m.Winner) {
      winnerCode = m.Winner === m.Home?.IdTeam ? hc : ac;
    }
    byPair.set(key(hc, ac), {
      hc, ac,
      hs: m.HomeTeamScore, as: m.AwayTeamScore,
      hp: m.HomeTeamPenaltyScore, ap: m.AwayTeamPenaltyScore,
      status, winnerCode,
      url: `https://www.fifa.com/en/match-centre/match/${COMP}/${SEASON}/${m.IdStage}/${m.IdMatch}`,
    });
  }

  // 2. Apply a FIFA result onto one bracket slot (oriented to the slot's t1/t2).
  function apply(slot, c1, c2) {
    const f = byPair.get(key(c1, c2));
    if (!f) return false;
    slot.status = f.status;
    slot.url = f.url;
    if (f.status === 'completed' && f.winnerCode) {
      slot.winner = f.winnerCode === c1 ? 0 : 1;
      const t1Home = c1 === f.hc;                 // is slot.t1 the FIFA home side?
      const g1 = t1Home ? f.hs : f.as, g2 = t1Home ? f.as : f.hs;
      const p1 = t1Home ? f.hp : f.ap, p2 = t1Home ? f.ap : f.hp;
      slot.score = (p1 != null && p2 != null)
        ? `${g1}–${g2} (${p1}–${p2} pens)`
        : `${g1}–${g2}`;
    } else {
      slot.winner = null;
      slot.score = '';
    }
    return true;
  }

  // 3. R32 has fixed teams — match directly.
  for (const s of data.r32) apply(s, s.c1, s.c2);

  // 4. R16 → Final: derive each slot's two teams from the feeder round's
  //    winners (forward-fill), then match. Mutates in place so the next
  //    round sees freshly-decided winners.
  function fill(target, feeders) {
    target.forEach((s, i) => {
      const c1 = winnerTeam(feeders[i * 2]);
      const c2 = winnerTeam(feeders[i * 2 + 1]);
      if (c1 && c2) { s.c1 = c1; s.c2 = c2; apply(s, c1, c2); }
    });
  }
  fill(data.r16, data.r32);  // each fill mutates in place, so the next sees winners
  fill(data.qf,  data.r16);
  fill(data.sf,  data.qf);
  const fa = winnerTeam(data.sf[0]), fb = winnerTeam(data.sf[1]);
  if (fa && fb) { data.final.c1 = fa; data.final.c2 = fb; apply(data.final, fa, fb); }

  data.updated = new Date().toISOString();
  await writeFile(DATA, JSON.stringify(data, null, 2) + '\n');
  console.log(`Updated data.json @ ${data.updated}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
