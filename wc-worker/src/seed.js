// The 16 Round-of-32 pairings the Worker rebuilds onto each tick. Later rounds
// are filled forward from winners. Keep in sync with ../src/defaultData.js.

const blank = () => ({ status: 'upcoming', winner: null, score: '', url: null });

export const SEED = {
  updated: null,
  r32: [
    { t1: 'S. Africa',    c1: 'za',     t2: 'Canada',     c2: 'ca', ...blank() },
    { t1: 'Netherlands',  c1: 'nl',     t2: 'Morocco',    c2: 'ma', ...blank() },
    { t1: 'Germany',      c1: 'de',     t2: 'Paraguay',   c2: 'py', ...blank() },
    { t1: 'France',       c1: 'fr',     t2: 'Sweden',     c2: 'se', ...blank() },
    { t1: 'Portugal',     c1: 'pt',     t2: 'Croatia',    c2: 'hr', ...blank() },
    { t1: 'Spain',        c1: 'es',     t2: 'Austria',    c2: 'at', ...blank() },
    { t1: 'USA',          c1: 'us',     t2: 'Bosnia',     c2: 'ba', ...blank() },
    { t1: 'Belgium',      c1: 'be',     t2: 'Senegal',    c2: 'sn', ...blank() },
    { t1: 'Brazil',       c1: 'br',     t2: 'Japan',      c2: 'jp', ...blank() },
    { t1: "Côte d'Ivoire", c1: 'ci',    t2: 'Norway',     c2: 'no', ...blank() },
    { t1: 'Mexico',       c1: 'mx',     t2: 'Ecuador',    c2: 'ec', ...blank() },
    { t1: 'England',      c1: 'gb-eng', t2: 'DR Congo',   c2: 'cd', ...blank() },
    { t1: 'Argentina',    c1: 'ar',     t2: 'Cape Verde', c2: 'cv', ...blank() },
    { t1: 'Australia',    c1: 'au',     t2: 'Egypt',      c2: 'eg', ...blank() },
    { t1: 'Switzerland',  c1: 'ch',     t2: 'Algeria',    c2: 'dz', ...blank() },
    { t1: 'Colombia',     c1: 'co',     t2: 'Ghana',      c2: 'gh', ...blank() },
  ],
  r16: Array.from({ length: 8 }, blank),
  qf: Array.from({ length: 4 }, blank),
  sf: Array.from({ length: 2 }, blank),
  final: blank(),
};
