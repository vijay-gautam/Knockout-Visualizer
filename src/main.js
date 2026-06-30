// Composition root: wires the modules together and starts the polling loop.

import { DATA_URL, POLL_INTERVAL_MS } from './config.js';
import { DEFAULT_DATA } from './defaultData.js';
import { buildBracket, hasLiveMatch } from './bracketModel.js';
import { createScene } from './scene.js';
import { Tooltip } from './tooltip.js';
import { BracketRenderer } from './renderer.js';
import { ResultsService } from './dataService.js';

const scene = createScene(document.getElementById('svg'));
const tooltip = new Tooltip(document.getElementById('tt'));
const renderer = new BracketRenderer(scene, tooltip);
const liveDot = document.getElementById('livedot');

function update(data) {
  const bracket = buildBracket(data);
  renderer.render(bracket);
  liveDot.classList.toggle('on', hasLiveMatch(bracket));
}

new ResultsService({ url: DATA_URL, intervalMs: POLL_INTERVAL_MS, fallback: DEFAULT_DATA })
  .onUpdate(update)
  .start();
