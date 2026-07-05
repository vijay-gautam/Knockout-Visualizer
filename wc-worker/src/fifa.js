// FIFA data → bracket. Ported from scripts/poll.mjs; the only difference is it
// returns a fresh object (built onto a SEED clone) instead of reading/writing a
// file. Pure aside from the network fetch.

import { SEED } from './seed.js';

const COMP = '17';        // FIFA World Cup
const SEASON = '285023';  // 2026 edition
const API = `https://api.fifa.com/api/v3/calendar/matches?idCompetition=${COMP}&idSeason=${SEASON}&count=500&language=en`;

// FIFA tri-code (IdCountry) → our flagcdn 2-letter code.
// If a match isn't matching, check its IdCountry in the API and fix here.
const FIFA2CC = {
  RSA: 'za', CAN: 'ca', NED: 'nl', MAR: 'ma', GER: 'de', PAR: 'py', FRA: 'fr', SWE: 'se',
  BRA: 'br', JPN: 'jp', CIV: 'ci', NOR: 'no', MEX: 'mx', ECU: 'ec', ENG: 'gb-eng', COD: 'cd',
  POR: 'pt', CRO: 'hr', ESP: 'es', AUT: 'at', USA: 'us', BIH: 'ba', BEL: 'be', SEN: 'sn',
  ARG: 'ar', CPV: 'cv', AUS: 'au', EGY: 'eg', SUI: 'ch', ALG: 'dz', COL: 'co', GHA: 'gh',
};

// MatchStatus: 0 = finished, 3 = live, anything else = not started.
function statusOf(ms) {
  if (ms === 3) return 'live';
  if (ms === 0) return 'completed';
  return 'upcoming';
}

const key = (a, b) => [a, b].sort().join('|');
const winnerTeam = (m) =>
  m && m.status === 'completed' && m.winner != null ? (m.winner === 0 ? m.c1 : m.c2) : null;

export async function buildBracketData() {
  const data = structuredClone(SEED);

  const res = await fetch(API, { headers: { accept: 'application/json' }, cf: { cacheTtl: 0 } });
  if (!res.ok) throw new Error(`FIFA API ${res.status}`);
  const { Results = [] } = await res.json();

  // Index every knockout match by its (orientation-free) team pair.
  const byPair = new Map();
  for (const m of Results) {
    const hc = FIFA2CC[m.Home?.IdCountry];
    const ac = FIFA2CC[m.Away?.IdCountry];
    if (!hc || !ac) continue; // group-stage / non-bracket teams

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

  // Apply a FIFA result onto one bracket slot, oriented to the slot's t1/t2.
  function apply(slot, c1, c2) {
    const f = byPair.get(key(c1, c2));
    if (!f) return;
    slot.status = f.status;
    slot.url = f.url;
    if (f.status === 'completed' && f.winnerCode) {
      slot.winner = f.winnerCode === c1 ? 0 : 1;
      const t1Home = c1 === f.hc;
      const g1 = t1Home ? f.hs : f.as, g2 = t1Home ? f.as : f.hs;
      const p1 = t1Home ? f.hp : f.ap, p2 = t1Home ? f.ap : f.hp;
      slot.score = (p1 != null && p2 != null) ? `${g1}–${g2} (${p1}–${p2} pens)` : `${g1}–${g2}`;
    } else {
      slot.winner = null;
      slot.score = '';
    }
  }

  for (const s of data.r32) apply(s, s.c1, s.c2);

  // Fill each later round forward from the previous round's winners.
  function fill(target, feeders) {
    target.forEach((s, i) => {
      const c1 = winnerTeam(feeders[2 * i]);
      const c2 = winnerTeam(feeders[2 * i + 1]);
      if (c1 && c2) { s.c1 = c1; s.c2 = c2; apply(s, c1, c2); }
    });
  }
  fill(data.r16, data.r32);
  fill(data.qf, data.r16);
  fill(data.sf, data.qf);
  const fa = winnerTeam(data.sf[0]), fb = winnerTeam(data.sf[1]);
  if (fa && fb) { data.final.c1 = fa; data.final.c2 = fb; apply(data.final, fa, fb); }

  data.updated = new Date().toISOString();
  return data;
}
