// Draws a bracket model onto the scene's SVG layers. Stateless between renders:
// each render() clears the previous output and redraws from the given model.

import { el } from './svgUtil.js';
import { point, slotAngle, nodeAngle, shortestSweep, distance } from './geometry.js';
import { shieldPath, hexagonPoints, flagUrl } from './shapes.js';
import { winnerCode } from './bracketModel.js';
import {
  RADII, RING_BY_DEPTH, STROKE_BY_DEPTH, NODE_SIZE_BY_DEPTH, STROKE_MULTIPLIER,
  COLORS, SHIELD, TROPHY, CENTER,
} from './config.js';

// Status → CSS class for one side of a match. `side` is 0 (t1) or 1 (t2).
function lineClass(match, side) {
  if (!match || match.status === 'upcoming') return 'c-up';
  if (match.status === 'live') return 'c-live';
  if (match.status === 'completed' && match.winner != null) {
    return match.winner === side ? 'c-win' : 'c-out';
  }
  return 'c-up';
}


export class BracketRenderer {
  #scene;
  #tooltip;
  #clipSeq = 0;

  constructor(scene, tooltip) {
    this.#scene = scene;
    this.#tooltip = tooltip;
  }

  render(bracket) {
    this.#scene.clearDynamic();
    this.#clipSeq = 0;

    // R32 … SF share one geometry; only the feeder ring differs by depth.
    [bracket.r32, bracket.r16, bracket.qf, bracket.sf].forEach((matches, depth) =>
      this.#drawRound(matches, depth),
    );

    // The final has no connector lines by design — just the trophy at centre.
    this.#drawCenter();
  }

  #drawRound(matches, depth) {
    const nodeR = RADII[RING_BY_DEPTH[depth]];
    const fromR = depth === 0 ? RADII.badge : RADII[RING_BY_DEPTH[depth - 1]];
    const childAngle = depth === 0
      ? (slot) => slotAngle(slot)
      : (slot) => nodeAngle(slot, depth - 1);
    const stroke = STROKE_BY_DEPTH[depth];
    const nodeSize = NODE_SIZE_BY_DEPTH[depth];

    matches.forEach((match, i) => {
      const nodeA = nodeAngle(i, depth);
      const angleA = childAngle(2 * i);
      const angleB = childAngle(2 * i + 1);

      this.#drawArm(point(fromR, angleA), angleA, nodeR, nodeA, lineClass(match, 0), stroke, match);
      this.#drawArm(point(fromR, angleB), angleB, nodeR, nodeA, lineClass(match, 1), stroke, match);
      this.#drawNode(point(nodeR, nodeA), winnerCode(match), nodeSize);

      if (depth === 0) {
        this.#drawBadge(point(fromR, angleA), match.c1, match.winner === 1, match);
        this.#drawBadge(point(fromR, angleB), match.c2, match.winner === 0, match);
      }
    });
  }

  // An "elbow": radial segment from the team outward point to the node ring,
  // then an arc along the ring to the node's mid-angle.
  #drawArm(fromPt, fromA, nodeR, nodeA, cls, baseStroke, match) {
    const stroke = baseStroke * (STROKE_MULTIPLIER[cls] ?? 1);
    const elbow = point(nodeR, fromA);
    const node = point(nodeR, nodeA);

    this.#segment(el('line', {
      x1: fromPt.x.toFixed(2), y1: fromPt.y.toFixed(2),
      x2: elbow.x.toFixed(2), y2: elbow.y.toFixed(2),
    }), cls, stroke, match);

    if (distance(elbow, node) >= 0.5) {
      const sweep = shortestSweep(fromA, nodeA);
      this.#segment(el('path', {
        d: `M${elbow.x.toFixed(2)},${elbow.y.toFixed(2)} A${nodeR},${nodeR} 0 0,${sweep} ${node.x.toFixed(2)},${node.y.toFixed(2)}`,
        fill: 'none',
      }), cls, stroke, match);
    }
  }

  #segment(node, cls, stroke, match) {
    node.setAttribute('stroke-width', stroke);
    node.setAttribute('class', `seg ${cls}${match?.url ? ' hp' : ''}`);
    this.#bind(node, match);
    this.#scene.layers.lines.appendChild(node);
  }

  // Match node: winner's flag in a circle, or a hollow hexagon if undecided.
  #drawNode(pos, code, r) {
    const g = el('g', { transform: `translate(${pos.x.toFixed(1)},${pos.y.toFixed(1)})` });
    if (code) {
      const clipId = this.#clip(el('circle', { cx: 0, cy: 0, r: r - 2 }));
      g.appendChild(el('circle', { r, fill: COLORS.winnerNodeFill, stroke: COLORS.gold, 'stroke-width': '1.5' }));
      g.appendChild(el('image', {
        href: flagUrl(code), x: -(r - 2), y: -(r - 2), width: (r - 2) * 2, height: (r - 2) * 2,
        'clip-path': `url(#${clipId})`, preserveAspectRatio: 'xMidYMid slice',
      }));
    } else {
      g.appendChild(el('polygon', {
        points: hexagonPoints(r * 0.92), fill: COLORS.nodeFill, stroke: COLORS.gold, 'stroke-width': '1.1',
      }));
    }
    this.#scene.layers.nodes.appendChild(g);
  }

  // Team badge: flag clipped to a shield, dimmed when eliminated.
  #drawBadge(pos, code, eliminated, match) {
    const r = SHIELD.radius;
    const path = shieldPath(r);
    const clipId = this.#clip(el('path', { d: path }));
    const g = el('g', { transform: `translate(${pos.x.toFixed(1)},${pos.y.toFixed(1)})` });
    this.#bind(g, match);

    g.appendChild(el('path', { d: path, fill: COLORS.badgeFill, stroke: 'none' }));
    g.appendChild(el('image', {
      href: flagUrl(code), x: -r, y: -r, width: r * 2, height: r * 2,
      'clip-path': `url(#${clipId})`, preserveAspectRatio: 'xMidYMid slice',
      opacity: eliminated ? '0.2' : '1',
    }));
    g.appendChild(el('path', {
      d: path, fill: 'none',
      stroke: eliminated ? COLORS.eliminatedStroke : COLORS.gold,
      'stroke-width': '1.3', opacity: eliminated ? '0.25' : '0.9',
    }));
    this.#scene.layers.badges.appendChild(g);
  }

  #drawCenter() {
    const badges = this.#scene.layers.badges;
    badges.appendChild(el('circle', {
      cx: CENTER.x, cy: CENTER.y, r: 80, fill: '#c9a43422', filter: 'url(#glow-center)',
    }));
    badges.appendChild(el('image', {
      href: TROPHY.href,
      x: CENTER.x - TROPHY.width / 2,
      y: CENTER.y - TROPHY.height / 2 + TROPHY.offsetY,
      width: TROPHY.width, height: TROPHY.height,
      preserveAspectRatio: 'xMidYMid meet', filter: 'url(#glow)',
    }));
  }

  // Register a per-render clipPath, returning its id.
  #clip(shapeNode) {
    const id = `clip-${this.#clipSeq++}`;
    const clip = el('clipPath', { id });
    clip.appendChild(shapeNode);
    this.#scene.addDef(clip);
    return id;
  }

  // Hover tooltip + click-through to the FIFA match page.
  #bind(target, match) {
    if (!match) return;
    this.#tooltip.bind(target, match);
    if (match.url) {
      target.style.cursor = 'pointer';
      target.addEventListener('click', () => window.open(match.url, '_blank', 'noopener'));
    }
  }
}
