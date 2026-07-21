/**
 * Reports whether one activity-log end sentinel is visible within its own scroll
 * container. The host owns the visible status and supplies both rendered nodes.
 */
export class ActivityLogEndSentinelController {
  #host;
  #onVisibilityChange;
  #observer = null;
  #root = null;
  #target = null;

  constructor(host, onVisibilityChange) {
    this.#host = host;
    this.#onVisibilityChange = onVisibilityChange;
    this.#host.addController(this);
  }

  hostConnected() {
    this.#startObserving();
  }

  hostDisconnected() {
    this.disconnect();
  }

  /** Supply the host's rendered scroll root and its single latest-end sentinel. */
  observe(root, target) {
    if (!(root instanceof HTMLElement) || !(target instanceof HTMLElement)) {
      this.disconnect();
      return;
    }

    if (this.#root !== root || this.#target !== target) {
      this.#observer?.disconnect();
      this.#observer = null;
      this.#root = root;
      this.#target = target;
    }

    this.#startObserving();
  }

  disconnect() {
    this.#observer?.disconnect();
    this.#observer = null;
    this.#root = null;
    this.#target = null;
    this.#onVisibilityChange(false);
  }

  #startObserving() {
    if (!this.#root || !this.#target || this.#observer) return;

    this.#observer = new IntersectionObserver((entries) => {
      const entry = entries.find((candidate) => candidate.target === this.#target);
      if (entry) this.#onVisibilityChange(entry.isIntersecting);
    }, { root: this.#root });
    this.#observer.observe(this.#target);
  }
}
