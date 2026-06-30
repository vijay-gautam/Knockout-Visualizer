// Pure polar/cartesian math for the circular bracket. No DOM, no state.

import { CENTER } from './config.js';

const TWO_PI = Math.PI * 2;
const TOTAL_SLOTS = 32; // 32 R32 team-slot positions around the circle

// Point on a circle of radius r at angle a (radians), centred on the canvas.
export function point(r, a) {
  return { x: CENTER.x + r * Math.cos(a), y: CENTER.y + r * Math.sin(a) };
}

// Angle of team slot s (0..31), clockwise starting at 12 o'clock.
export function slotAngle(s) {
  return -Math.PI / 2 + (s / TOTAL_SLOTS) * TWO_PI;
}

// Mid-angle of match node `idx` at a given round depth (0 = R32 … 3 = SF).
export function nodeAngle(idx, depth) {
  const span = 2 ** (depth + 1);
  return slotAngle(idx * span + span / 2 - 0.5);
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
