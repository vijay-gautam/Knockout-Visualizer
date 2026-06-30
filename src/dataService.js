// Fetches results from data.json and polls on an interval. Knows nothing about
// rendering — it just delivers raw data (or the fallback) to subscribers.

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
      data = this.#fallback; // file:// or data.json not yet published
    }
    this.#subscribers.forEach((cb) => cb(data));
  }
}
