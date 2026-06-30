// Static configuration: geometry, palette, sizing, schedule, polling.
// Pure data — no logic, no DOM. Tweak the bracket's look/behaviour here.

export const CANVAS = { width: 840, height: 840 };
export const CENTER = { x: CANVAS.width / 2, y: CANVAS.height / 2 };

// Radius of each concentric ring, outermost (team badges) to innermost.
export const RADII = {
  badge: 388,  // team flag badges
  r32: 314,    // Round-of-32 match nodes
  r16: 244,
  qf: 176,
  sf: 112,
};

// Ring keys indexed by round depth (0 = R32 … 3 = SF).
export const RING_BY_DEPTH = ['r32', 'r16', 'qf', 'sf'];
// Per-depth visual weights.
export const STROKE_BY_DEPTH = [1.8, 2.2, 2.6, 3];
export const NODE_SIZE_BY_DEPTH = [13, 13, 13, 16];
// Stroke-width multiplier per status class, relative to the round's base width.
// Upcoming is thinnest; live is bolder; completed (winner/eliminated) bolder still.
export const STROKE_MULTIPLIER = {
  'c-up': 1,
  'c-live': 1.8,
  'c-win': 2.2,
  'c-out': 2.2,
};

export const COLORS = {
  gold: '#c9a434',
  goldDim: '#b8922a',
  dot: '#7a6422',
  nodeFill: '#120f00',
  badgeFill: '#0d0b05',
  winnerNodeFill: '#0a0800',
  eliminatedStroke: '#221e12',
};

export const SHIELD = { radius: 27 };
export const TROPHY = { href: 'trophy.svg', width: 104, height: 116, offsetY: -4 };

// Round display names and per-match dates (pairing is fixed by array order).
export const ROUND_NAMES = {
  r32: 'Round of 32',
  r16: 'Round of 16',
  qf: 'Quarter-Final',
  sf: 'Semi-Final',
  final: 'Final',
};
export const ROUND_DATES = {
  r16: ['Jul 4', 'Jul 4', 'Jul 5', 'Jul 5', 'Jul 6', 'Jul 6', 'Jul 7', 'Jul 7'],
  qf: ['Jul 11', 'Jul 11', 'Jul 12', 'Jul 12'],
  sf: ['Jul 15', 'Jul 16'],
  final: 'Jul 19',
};

export const DATA_URL = 'data.json';
export const POLL_INTERVAL_MS = 60_000;

export const FLAG_BASE = 'https://flagcdn.com/w80';
