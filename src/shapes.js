// Pure shape geometry — path/points strings for the badge shield and match-node
// hexagon, plus the flag image URL. No DOM.

import { FLAG_BASE } from './config.js';

export function flagUrl(countryCode) {
  return `${FLAG_BASE}/${countryCode}.png`;
}

// Pentagon-ish shield path centred at 0,0 with the given radius.
export function shieldPath(r) {
  const w = (r * 0.88).toFixed(1);
  const top = (-r * 0.6).toFixed(1);
  const mid = (r * 0.24).toFixed(1);
  return `M 0,${-r} L ${w},${top} L ${w},${mid} L 0,${r} L ${-w},${mid} L ${-w},${top} Z`;
}

// Flat-top hexagon points string centred at 0,0 with the given radius.
export function hexagonPoints(r) {
  const x = (r * 0.87).toFixed(1);
  const y = (r * 0.5).toFixed(1);
  return `0,${-r} ${x},${-y} ${x},${y} 0,${r} ${-x},${y} ${-x},${-y}`;
}
