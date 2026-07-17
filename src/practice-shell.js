import { LitElement, html } from 'lit';
import './task-form.js';
import './task-board.js';
import './task-change-log.js';

export class EventLog {
  constructor(action, taskId, title, timestamp = Date.now()) {
    this.id = crypto.randomUUID();
    this.action = action;
    this.taskId = taskId;
    this.title = title;
    this.timestamp = timestamp;
  }
}

/**
 * PracticeShell will own the state of the DOM interaction that associates with the tasks
 */
export class PracticeShell extends LitElement {
  static properties = {
    _activityLog: { state: true }
  };

  constructor() {
    super();
    this._activityLog = [];
  }

  #addActivity(event) {
    const { action, id, title } = event.detail ?? {};
    if (!action || !id || !title) return;

    const newEvent = new EventLog(action, id, title);
    this._activityLog = [newEvent, ...this._activityLog];
  }

  render() {
    return html`
      <practice-task-form @task-board-change=${this.#addActivity}></practice-task-form>
      <practice-task-board @task-board-change=${this.#addActivity}></practice-task-board>
      <practice-task-change-log .entries=${this._activityLog}></practice-task-change-log>
    `;
  }
}

customElements.define('practice-shell', PracticeShell);
