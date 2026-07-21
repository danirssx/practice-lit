import { LitElement, html, css } from 'lit';
import { repeat } from 'lit/directives/repeat.js';
import { createRef, ref } from 'lit/directives/ref.js';
import { ActivityLogOverflowController } from './activity-log-overflow-controller.js';
import { ActivityLogEndSentinelController } from './activity-log-end-sentinel-controller.js';

const LATEST_TOLERANCE_PX = 2;

/**
 * @entries receive as a property the list of queries by @_activityLog by PracticeShell class that it's the owner of the logs.
 * Also add the styling necessary to logs
 */
export class TaskChangeLog extends LitElement {
  static properties = {
    entries: { attribute: false },
    _isOverflowing: { state: true },
    _isAtLatest: { state: true },
    _isViewingLatest: { state: true },
  };

  #scrollSnapshot;
  #scrollRef;
  #sentinelRef;
  #overflowController;
  #endSentinelController;

  static styles = css`
    :host { display: block; max-width: 36rem; margin: 0 auto; font-family: system-ui, sans-serif; }
    :host([hidden]) { display: none; }
    ul { display: grid; gap: 0.5rem; padding: 0; list-style: none; }
    li { display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: 0.65rem; border: 1px solid #d0d7de; }
    .entry { display: grid; gap: 0.15rem; }
    .meta { color: #57606a; font-size: 0.875rem; }
    .empty { color: #57606a; }
    .log-scroll { max-height: 16rem; overflow-y: auto; }
    .scroll-latest { margin-top: 0.75rem; padding: 0.5rem 0.75rem; }
    .latest-sentinel { display: block; height: 1px; }
    .latest-status { margin: 0.5rem 0 0; color: #57606a; font-size: 0.875rem; }
  `;

  constructor() {
    super();
    this.entries = [];
    this.#scrollSnapshot = null;
    this._isOverflowing = false;
    this._isAtLatest = true;
    this._isViewingLatest = false;
    this.#scrollRef = createRef();
    this.#sentinelRef = createRef();
    this.#overflowController = new ActivityLogOverflowController(
      this,
      (isOverflowing) => this.#onOverflowChange(isOverflowing),
    );
    this.#endSentinelController = new ActivityLogEndSentinelController(
      this,
      (isVisible) => { this._isViewingLatest = isVisible; },
    );
  }

  connectedCallback() {
    super.connectedCallback();
    if (!this.hasUpdated) return;

    this.updateComplete.then(() => {
      if (!this.isConnected) return;
      this.#overflowController.observe(this.#scrollRef.value);
      this.#observeLatestSentinel();
    });
  }

  firstUpdated() {
    this.#overflowController.observe(this.#scrollRef.value);
    this.#scrollToLatest();
    this.#observeLatestSentinel();
  }

  /**
   * Preserve a reader's place before Lit adds the next entry at the latest end.
   */
  willUpdate(changedProperties) {
    super.willUpdate(changedProperties);
    if (!changedProperties.has('entries')) return;
    const container = this.#scrollRef.value;
    if (!container) {
      this.#scrollSnapshot = null;
      return;
    }
    this.#scrollSnapshot = {
      top: container.scrollTop,
      wasAtLatest: this.#isAtLatest(container),
    };
  }

  updated(changedProperties) {
    super.updated(changedProperties);
    if (!changedProperties.has('entries')) return;

    const container = this.#scrollRef.value;
    const snapshot = this.#scrollSnapshot;
    if (container && snapshot) {
      if (snapshot.wasAtLatest) {
        container.scrollTop = container.scrollHeight;
      } else {
        container.scrollTop = snapshot.top;
      }
    }
    this.#scrollSnapshot = null;

    // Entries alter scrollHeight without necessarily changing the container's box.
    // This is a content-change measurement, not resize polling in updated().
    this.#overflowController.measure();
    if (container) this.#updateAtLatest(container);
    this.#observeLatestSentinel();
  }

  #onOverflowChange(isOverflowing) {
    this._isOverflowing = isOverflowing;
    if (!isOverflowing) this._isAtLatest = true;
  }

  #isAtLatest(container) {
    return container.scrollTop + container.clientHeight
      >= container.scrollHeight - LATEST_TOLERANCE_PX;
  }

  #updateAtLatest(container) {
    this._isAtLatest = this.#isAtLatest(container);
  }

  #onScroll(event) {
    this.#updateAtLatest(event.currentTarget);
  }

  #scrollToLatest() {
    const container = this.#scrollRef.value;
    if (!container) return;
    container.scrollTop = container.scrollHeight;
    this.#updateAtLatest(container);
  }

  #observeLatestSentinel() {
    this.#endSentinelController.observe(
      this.#scrollRef.value,
      this.#sentinelRef.value,
    );
  }

  render() {
    // PracticeShell prepends new records; render chronologically so “latest” is
    // the bottom scroll position described by the overflow-controller exercise.
    const entries = Array.isArray(this.entries) ? [...this.entries].reverse() : [];

    return html`
      <h2>Task activity</h2>
      <div class="log-scroll" ${ref(this.#scrollRef)} @scroll=${this.#onScroll}>
      ${entries.length === 0
        ? html`<p class="empty">No task changes yet.</p>`
        : html`                <ul>
                    ${repeat(entries, (entry) => entry.id, (entry) => html`
                    <li>
                        <div class="entry">
                        <strong>${entry.title}</strong>
                        <span class="meta">${entry.action} task ${entry.taskId}</span>
                        </div>
                        <time class="meta" datetime=${new Date(entry.timestamp).toISOString()}>
                        ${new Date(entry.timestamp).toLocaleTimeString()}
                        </time>
                    </li>
                    `)}
                </ul>
                <span class="latest-sentinel" ${ref(this.#sentinelRef)} aria-hidden="true"></span>
        `}
      </div>
      ${this._isViewingLatest
        ? html`<p class="latest-status" role="status">Viewing latest activity</p>`
        : null}
      ${this._isOverflowing && !this._isAtLatest
        ? html`<button class="scroll-latest" type="button" @click=${this.#scrollToLatest}>Scroll to latest</button>`
        : null}

        `;
  }
}

customElements.define('practice-task-change-log', TaskChangeLog);
