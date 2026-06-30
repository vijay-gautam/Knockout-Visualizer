// Builds the static SVG scaffolding once (gradient, glow filters, draw layers)
// and exposes the layers plus helpers to manage per-render dynamic defs.
// Owns nothing about the bracket itself — just the canvas it's drawn onto.

import { el, clear } from './svgUtil.js';
import { CANVAS } from './config.js';

function buildBackgroundGradient() {
  const grad = el('radialGradient', { id: 'bg', cx: '50%', cy: '50%', r: '50%' });
  [[0, '#1c1608'], [0.45, '#080602'], [1, '#000']].forEach(([offset, color]) => {
    grad.appendChild(el('stop', { offset: `${offset * 100}%`, 'stop-color': color }));
  });
  return grad;
}

function buildGlowFilter(id, deviation) {
  const filter = el('filter', { id, x: '-60%', y: '-60%', width: '220%', height: '220%' });
  filter.appendChild(el('feGaussianBlur', { stdDeviation: deviation, result: 'b' }));
  filter.appendChild(el('feComposite', { in: 'SourceGraphic', in2: 'b', operator: 'over' }));
  return filter;
}

export function createScene(svg) {
  const defs = el('defs');
  defs.appendChild(buildBackgroundGradient());
  defs.appendChild(buildGlowFilter('glow', 5));
  defs.appendChild(buildGlowFilter('glow-center', 22));
  svg.appendChild(defs);

  const layers = {
    background: el('g'),
    lines: el('g'),
    nodes: el('g'),
    badges: el('g'),
  };
  Object.values(layers).forEach((layer) => svg.appendChild(layer));

  layers.background.appendChild(
    el('rect', { width: CANVAS.width, height: CANVAS.height, fill: 'url(#bg)' }),
  );

  // clipPaths created during a render; removed before the next one.
  const dynamicDefs = [];

  return {
    layers,
    // Register a clipPath (or other def) tied to the current render.
    addDef(node) {
      defs.appendChild(node);
      dynamicDefs.push(node);
    },
    // Wipe everything drawn last render so a fresh one can start.
    clearDynamic() {
      clear(layers.lines);
      clear(layers.nodes);
      clear(layers.badges);
      dynamicDefs.forEach((node) => node.remove());
      dynamicDefs.length = 0;
    },
  };
}
