import { LitElement, html } from 'lit';
import './task-form.js';
import './task-board.js';
import './task-change-log.js';
import { TaskShortcutController } from './task-shortcut-controller.js';

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
  #shortcuts;

  static properties = {
    _activityLog: { state: true },
    _isActivityLogOpen: { state: true },
  };

  constructor() {
    super();
    this._activityLog = [];
    this._isActivityLogOpen = true;
    this.#shortcuts = new TaskShortcutController(this, (command) => this.#handleShortcut(command));
  }

  #addActivity(event) {
    const { action, id, title } = event.detail ?? {};
    if (!action || !id || !title) return;

    const newEvent = new EventLog(action, id, title);
    this._activityLog = [newEvent, ...this._activityLog];
  }

  #handleShortcut(command) {
    switch (command) {
      case 'toggle-log':
        this._isActivityLogOpen = !this._isActivityLogOpen;
        break;
      case 'clear-log':
        this._activityLog = [];
        break;
    }
  }

  render() {
    return html`
      <practice-task-form @task-board-change=${this.#addActivity}></practice-task-form>
      <practice-task-board @task-board-change=${this.#addActivity}></practice-task-board>
      <practice-task-change-log
        .entries=${this._activityLog}
        ?hidden=${!this._isActivityLogOpen}
      ></practice-task-change-log>
    `;
  }
}

customElements.define('practice-shell', PracticeShell);
