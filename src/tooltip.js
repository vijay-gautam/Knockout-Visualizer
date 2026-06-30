// Hover tooltip showing match detail. Owns the #tt element and nothing else.

export class Tooltip {
  #el;

  constructor(element) {
    this.#el = element;
  }

  // Wire hover behaviour for an SVG element representing `match`.
  bind(target, match) {
    target.addEventListener('mouseenter', (e) => this.#show(e, match));
    target.addEventListener('mousemove', (e) => this.#move(e));
    target.addEventListener('mouseleave', () => this.#hide());
  }

  #show(event, m) {
    const t1 = m.t1 || 'TBD';
    const t2 = m.t2 || 'TBD';
    const tick1 = m.winner === 0 ? ' ✓' : '';
    const tick2 = m.winner === 1 ? ' ✓' : '';
    const status =
      m.status === 'live' ? '<span style="color:#d06400">● Live</span>'
      : m.status === 'completed' ? 'Completed'
      : '<span style="color:#555">Upcoming</span>';

    let html = `<div class="tt-r">${m.label || ''}</div>`;
    html += `<div class="tt-m">${t1}${tick1} <span style="color:#3a3028">vs</span> ${t2}${tick2}</div>`;
    if (m.score) html += `<div class="tt-s">${m.score}</div>`;
    html += `<div style="font-size:10px">${status}</div>`;
    if (m.url) html += '<div class="tt-a">↗ FIFA Match Centre</div>';

    this.#el.innerHTML = html;
    this.#el.style.display = 'block';
    this.#move(event);
  }

  #move(event) {
    const TIP_W = 270;
    const TIP_H = 130;
    let x = event.clientX + 14;
    let y = event.clientY + 14;
    if (x + TIP_W > window.innerWidth) x = event.clientX - TIP_W - 6;
    if (y + TIP_H > window.innerHeight) y = event.clientY - TIP_H;
    this.#el.style.left = `${x}px`;
    this.#el.style.top = `${y}px`;
  }

  #hide() {
    this.#el.style.display = 'none';
  }
}
