// Offline fallback used when data.json can't be fetched (e.g. first load
// before the poller has run). Same shape as data.json. The live source of
// truth is data.json, maintained by scripts/poll.mjs.
//
// winner: 0 = t1 won, 1 = t2 won, null = not played.
// R16+ team slots are intentionally empty — they're filled forward from each
// round's winners by bracketModel.buildBracket().

export const DEFAULT_DATA = {
  updated: '2026-06-30',
  r32: [
    { t1: 'S. Africa',    c1: 'za',     t2: 'Canada',      c2: 'ca', status: 'completed', winner: 1,    score: '0–1',            url: null },
    { t1: 'Netherlands',  c1: 'nl',     t2: 'Morocco',     c2: 'ma', status: 'completed', winner: 1,    score: '1–1 (2–3 pens)', url: null },
    { t1: 'Germany',      c1: 'de',     t2: 'Paraguay',    c2: 'py', status: 'completed', winner: 1,    score: '1–1 (3–4 pens)', url: null },
    { t1: 'France',       c1: 'fr',     t2: 'Sweden',      c2: 'se', status: 'upcoming',  winner: null, score: '',               url: null },
    { t1: 'Brazil',       c1: 'br',     t2: 'Japan',       c2: 'jp', status: 'completed', winner: 0,    score: '2–1',            url: 'https://www.fifa.com/en/match-centre/match/17/285023/289287/400021516' },
    { t1: "Côte d'Ivoire", c1: 'ci',    t2: 'Norway',      c2: 'no', status: 'upcoming',  winner: null, score: '',               url: null },
    { t1: 'Mexico',       c1: 'mx',     t2: 'Ecuador',     c2: 'ec', status: 'upcoming',  winner: null, score: '',               url: null },
    { t1: 'England',      c1: 'gb-eng', t2: 'DR Congo',    c2: 'cd', status: 'upcoming',  winner: null, score: '',               url: null },
    { t1: 'Portugal',     c1: 'pt',     t2: 'Croatia',     c2: 'hr', status: 'upcoming',  winner: null, score: '',               url: null },
    { t1: 'Spain',        c1: 'es',     t2: 'Austria',     c2: 'at', status: 'upcoming',  winner: null, score: '',               url: null },
    { t1: 'USA',          c1: 'us',     t2: 'Bosnia',      c2: 'ba', status: 'upcoming',  winner: null, score: '',               url: null },
    { t1: 'Belgium',      c1: 'be',     t2: 'Senegal',     c2: 'sn', status: 'upcoming',  winner: null, score: '',               url: null },
    { t1: 'Argentina',    c1: 'ar',     t2: 'Cape Verde',  c2: 'cv', status: 'upcoming',  winner: null, score: '',               url: null },
    { t1: 'Australia',    c1: 'au',     t2: 'Egypt',       c2: 'eg', status: 'upcoming',  winner: null, score: '',               url: null },
    { t1: 'Switzerland',  c1: 'ch',     t2: 'Algeria',     c2: 'dz', status: 'upcoming',  winner: null, score: '',               url: null },
    { t1: 'Colombia',     c1: 'co',     t2: 'Ghana',       c2: 'gh', status: 'upcoming',  winner: null, score: '',               url: null },
  ],
  r16: Array.from({ length: 8 }, () => ({ status: 'upcoming', winner: null, score: '', url: null })),
  qf: Array.from({ length: 4 }, () => ({ status: 'upcoming', winner: null, score: '', url: null })),
  sf: Array.from({ length: 2 }, () => ({ status: 'upcoming', winner: null, score: '', url: null })),
  final: { status: 'upcoming', winner: null, score: '', url: null },
};
