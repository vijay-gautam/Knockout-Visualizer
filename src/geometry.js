// Pure polar/cartesian math for the circular bracket. No DOM, no state.

import { CENTER } from './config.js';

const TWO_PI = Math.PI * 2;
const TOTAL_SLOTS = 32;       // 32 R32 team-slot positions around the circle
const HALF = TOTAL_SLOTS / 2; // slots per bracket half
const STEP = TWO_PI / TOTAL_SLOTS;
// First right-half slot sits half a step below 12 o'clock, so the two halves
// straddle the vertical axis with a gap at top/bottom instead of a badge on it.
const RIGHT_START = -Math.PI / 2 + STEP / 2;

// Point on a circle of radius r at angle a (radians), centred on the canvas.
export function point(r, a) {
  return { x: CENTER.x + r * Math.cos(a), y: CENTER.y + r * Math.sin(a) };
}

// Angle of team slot `pos` (may be fractional for node midpoints).
// Slots 0..15 fill the right semicircle; 16..31 mirror them about the vertical
// axis onto the left. Mirroring (not rotating) the left half keeps the two
// halves — and therefore the two final nodes — level with each other.
export function slotAngle(pos) {
  if (pos < HALF) return RIGHT_START + pos * STEP;
  return Math.PI - (RIGHT_START + (pos - HALF) * STEP);
}

// Mid-angle of match node `idx` at a given round depth (0 = R32 … 3 = SF).
// A node spans 2^(depth+1) team slots; its angle is that span's midpoint.
export function nodeAngle(idx, depth) {
  const span = 2 ** (depth + 1);
  return slotAngle(idx * span + (span - 1) / 2);
}

// Sweep flag (0|1) for the shortest arc from angle `fromA` to `toA`.
export function shortestSweep(fromA, toA) {
  let diff = toA - fromA;
  while (diff > Math.PI) diff -= TWO_PI;
  while (diff < -Math.PI) diff += TWO_PI;
  return diff > 0 ? 1 : 0;
}

export function distance(p1, p2) {
  return Math.hypot(p2.x - p1.x, p2.y - p1.y);
}
