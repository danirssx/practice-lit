import { LitElement, html, css } from 'lit';
import { repeat } from 'lit/directives/repeat.js';

/**
 * @entries receive as a property the list of queries by @_activityLog by PracticeShell class that it's the owner of the logs.
 * Also add the styling necessary to logs
 */
export class TaskChangeLog extends LitElement {
  static properties = {
    entries: { attribute: false },
  };

  #scrollSnapshot;

  static styles = css`
    :host { display: block; max-width: 36rem; margin: 0 auto; font-family: system-ui, sans-serif; }
    :host([hidden]) { display: none; }
    ul { display: grid; gap: 0.5rem; padding: 0; list-style: none; }
    li { display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: 0.65rem; border: 1px solid #d0d7de; }
    .entry { display: grid; gap: 0.15rem; }
    .meta { color: #57606a; font-size: 0.875rem; }
    .empty { color: #57606a; }
    .log-scroll { max-height: 16rem; overflow-y: auto; }
  `;

  constructor() {
    super();
    this.entries = [];
    this.#scrollSnapshot = null;
  }


  /**
   * I will grab the `scrollTop` and `scrollHeight` properties of the container to later move the entered task and fix the position for both of them
   * @param {entries} changedProperties
   *
   */
  willUpdate(changedProperties) {
    super.willUpdate(changedProperties);
    if (!changedProperties.has('entries')) return;
    const container = this.renderRoot.querySelector('.log-scroll');
    if (!container) {
      this.#scrollSnapshot = null;
      return;
    }
    this.#scrollSnapshot = {
      top: container.scrollTop,
      height: container.scrollHeight,
    };
  }

  shoulda


  updated(changedProperties) {
    super.updated(changedProperties);
    if (!changedProperties.has('entries') || this.#scrollSnapshot === null) return;

    const snapshot = this.#scrollSnapshot;
    const container = this.renderRoot.querySelector('.log-scroll');
    if (!container) {
      this.#scrollSnapshot = null;
      return;
    }

    const heightAdded = container.scrollHeight - snapshot.height;
    if (snapshot.top > 0) {
      container.scrollTop = snapshot.top + heightAdded;
    }
    this.#scrollSnapshot = null;
  }

  render() {
    const entries = Array.isArray(this.entries) ? this.entries : [];

    return html`
      <h2>Task activity</h2>
      <div class="log-scroll">
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
        `}
      </div>

        `;
  }
}

customElements.define('practice-task-change-log', TaskChangeLog);
