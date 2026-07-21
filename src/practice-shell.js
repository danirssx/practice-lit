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
    _boardViewCommand: { state: true }
  };

  constructor() {
    super();
    this._activityLog = [];
    this._isActivityLogOpen = true;
    this.#shortcuts = new TaskShortcutController(this, (command) => this.#handleShortcut(command));
    this._boardViewCommand = null;
  }

  #addActivity(event) {
    const { action, id, title } = event.detail ?? {};
    if (!action || !id || !title) return;

    const newEvent = new EventLog(action, id, title);
    this._activityLog = [newEvent, ...this._activityLog];
    // event I will send to `task-board` that there's a task created
    if (action === 'created') {
      this._boardViewCommand = {
        type: 'show-created-task',
        taskId: id,
      }
    }
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

  #handleDeleteReq(e) {
    console.log("Me estoy borrando: ", e);
    return true;
  }

  render() {
    return html`
      <practice-task-form @task-board-change=${this.#addActivity}></practice-task-form>
      <practice-task-board
          .viewCommand=${this._boardViewCommand}
          @task-delete-request=${(e) => this.#handleDeleteReq(e)}
          @task-board-change=${this.#addActivity}></practice-task-board>
      <practice-task-change-log
        .entries=${this._activityLog}
        ?hidden=${!this._isActivityLogOpen}
      ></practice-task-change-log>
    `;
  }
}

customElements.define('practice-shell', PracticeShell);
