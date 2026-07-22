import { LitElement, html } from 'lit';
import './task-form.js';
import './task-board.js';
import './task-change-log.js';
import { TaskShortcutController } from './task-shortcut-controller.js';
import './user-header.js';

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
    _boardViewCommand: { state: true },
    _userInfo: { state: true },
    _editMode: { state: true }
  };

  constructor() {
    super();
    this._activityLog = [];
    this._isActivityLogOpen = true;
    this.#shortcuts = new TaskShortcutController(this, (command) => this.#handleShortcut(command));
    this._boardViewCommand = null;
    this._userInfo = null;
    this._editMode = false;
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

  #handleUserCreated(event) {
    const user = event.detail;
    if (!user?.id || !user.username) return;

    this._userInfo = user;
    this._activityLog = [
      new EventLog('User Created', user.id, user.username),
      ...this._activityLog,
    ];
  }

  #handleShortcut(command) {
    switch (command) {
      case 'toggle-log':
        this._isActivityLogOpen = !this._isActivityLogOpen;
        break;
      case 'clear-log':
        this._activityLog = [];
        break;
      case 'edit-mode':
        this._editMode = !this._editMode;
    }
  }

  #handleDeleteReq(e) {
    return true;
  }

  #editModeHandler(event) {
    this._editMode = event.detail.mode;
    this.#addActivity(event);
  }

  render() {

    console.log("User: ", this._userInfo);

      return html`
        <user-header
          .userInfo=${this._userInfo}
          .editMode=${this._editMode}
          @user-created=${this.#handleUserCreated}
          @edit-activated=${(e) => this.#editModeHandler(e)}
        ></user-header>
      <practice-task-form @task-board-change=${this.#addActivity} .userInfo=${this._userInfo}></practice-task-form>
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
