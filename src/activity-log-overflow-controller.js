/**
 * Observes the rendered activity-log container and reports whether it can scroll.
 * The host owns the resulting UI state; this controller owns only observation and
 * lifecycle cleanup.
 */
export class ActivityLogOverflowController {
  #host;
  #onOverflowChange;
  #observer;
  #element = null;
  #observing = false;

  constructor(host, onOverflowChange) {
    this.#host = host;
    this.#onOverflowChange = onOverflowChange;
    this.#observer = new ResizeObserver(() => this.measure());
    this.#host.addController(this);
  }

  hostConnected() {
    this.#startObserving();
  }

  hostDisconnected() {
    this.#observer.disconnect();
    this.#observing = false;
    this.#element = null;
  }

  /** Supply the host's rendered scroll container; the controller never queries DOM. */
  observe(element) {
    if (!(element instanceof HTMLElement)) return;

    if (this.#element !== element) {
      this.#observer.disconnect();
      this.#observing = false;
      this.#element = element;
    }

    this.#startObserving();
    this.measure();
  }

  /** Recheck after host-owned content changes without polling in a lifecycle hook. */
  measure() {
    if (!this.#element) return;
    this.#onOverflowChange(this.#element.scrollHeight > this.#element.clientHeight);
  }

  #startObserving() {
    if (!this.#element || this.#observing) return;
    this.#observer.observe(this.#element);
    this.#observing = true;
  }
}
