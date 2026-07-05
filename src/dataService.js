// Fetches results from DATA_URL and polls on an interval, delivering raw data
// (or the fallback) to subscribers.

export class ResultsService {
  #url;
  #intervalMs;
  #fallback;
  #subscribers = [];
  #timer = null;

  constructor({ url, intervalMs, fallback }) {
    this.#url = url;
    this.#intervalMs = intervalMs;
    this.#fallback = fallback;
  }

  // Register a callback invoked with the latest data on every refresh.
  onUpdate(callback) {
    this.#subscribers.push(callback);
    return this;
  }

  start() {
    this.refresh();
    this.#timer = setInterval(() => this.refresh(), this.#intervalMs);
    return this;
  }

  stop() {
    if (this.#timer) clearInterval(this.#timer);
    this.#timer = null;
  }

  async refresh() {
    let data;
    try {
      const res = await fetch(`${this.#url}?t=${Date.now()}`, { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      data = await res.json();
    } catch {
      data = this.#fallback;
    }
    this.#subscribers.forEach((cb) => cb(data));
  }
}
