// Bracket domain model. Turns raw data (data.json / DEFAULT_DATA) into a
// renderable bracket, filling each later round's team slots forward from the
// previous round's winners. No DOM — pure data transformation.

import { ROUND_NAMES, ROUND_DATES } from './config.js';

// The winning team of a completed match, or null if undecided.
export function winnerTeam(match) {
  if (match && match.status === 'completed' && match.winner != null) {
    return match.winner === 0
      ? { name: match.t1, code: match.c1 }
      : { name: match.t2, code: match.c2 };
  }
  return null;
}

// Convenience: winner's flag code, or null. Used by the renderer for nodes.
export function winnerCode(match) {
  const w = winnerTeam(match);
  return w ? w.code : null;
}

// Build one round, pulling each match's two teams forward from its feeders
// (match i is fed by feeders[2i] and feeders[2i+1]).
function buildRound(rows, dates, roundName, feeders) {
  return rows.map((m, i) => {
    const a = winnerTeam(feeders[2 * i]);
    const b = winnerTeam(feeders[2 * i + 1]);
    return {
      ...m,
      t1: a ? a.name : '', c1: a ? a.code : '',
      t2: b ? b.name : '', c2: b ? b.code : '',
      label: `${roundName} · ${dates[i]}`,
    };
  });
}

// Raw bracket data → { r32, r16, qf, sf, final }, teams resolved per round.
export function buildBracket(data) {
  const r32 = data.r32.map((m) => ({ ...m, label: ROUND_NAMES.r32 }));
  const r16 = buildRound(data.r16, ROUND_DATES.r16, ROUND_NAMES.r16, r32);
  const qf = buildRound(data.qf, ROUND_DATES.qf, ROUND_NAMES.qf, r16);
  const sf = buildRound(data.sf, ROUND_DATES.sf, ROUND_NAMES.sf, qf);

  const a = winnerTeam(sf[0]);
  const b = winnerTeam(sf[1]);
  const final = {
    ...data.final,
    t1: a ? a.name : '', c1: a ? a.code : '',
    t2: b ? b.name : '', c2: b ? b.code : '',
    label: `${ROUND_NAMES.final} · ${ROUND_DATES.final}`,
  };

  return { r32, r16, qf, sf, final };
}

// True if any match anywhere in the bracket is currently live.
export function hasLiveMatch(bracket) {
  return [...bracket.r32, ...bracket.r16, ...bracket.qf, ...bracket.sf, bracket.final]
    .some((m) => m.status === 'live');
}
