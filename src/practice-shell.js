import { LitElement, html } from 'lit';
import './task-form.js';
import './task-board.js';
import './task-change-log.js';
import { TaskShortcutController } from './task-shortcut-controller.js';
import './user-header.js';
import { createLogger } from './platform/logger.js';

const log = createLogger('shell');

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
    log.debug('practice shell initialized');
  }

  #addActivity(event) {
    const { action, id, title } = event.detail ?? {};
    if (!action || !id || !title) {
      log.warn({ action: action || null, taskId: id || null }, 'activity entry ignored: incomplete event detail');
      return;
    }

    const newEvent = new EventLog(action, id, title);
    this._activityLog = [newEvent, ...this._activityLog];
    log.debug({ action, taskId: id, activityCount: this._activityLog.length }, 'activity entry added');
    // event I will send to `task-board` that there's a task created
    if (action === 'created') {
      this._boardViewCommand = {
        type: 'show-created-task',
        taskId: id,
      };
      log.debug({ taskId: id }, 'board instructed to reveal created task');
    }
  }

  #handleUserCreated(event) {
    const user = event.detail;
    if (!user?.id || !user.username) {
      log.warn('user-created event ignored: incomplete user detail');
      return;
    }

    this._userInfo = user;
    this._activityLog = [
      new EventLog('User Created', user.id, user.username),
      ...this._activityLog,
    ];
    log.info({ userId: user.id, username: user.username }, 'shell accepted created user');
  }

  #handleShortcut(command) {
    switch (command) {
      case 'toggle-log':
        this._isActivityLogOpen = !this._isActivityLogOpen;
        log.info({ open: this._isActivityLogOpen }, 'activity log visibility toggled');
        break;
      case 'clear-log':
        this._activityLog = [];
        log.info('activity log cleared');
        break;
      case 'edit-mode':
        this._editMode = !this._editMode;
        log.info({ enabled: this._editMode }, 'edit mode toggled by shortcut');
        break;
      default:
        log.warn({ command }, 'unknown shortcut ignored');
    }
  }

  #handleDeleteReq(e) {
    log.debug({ taskId: e.detail?.id || null }, 'task deletion request accepted');
    return true;
  }

  #editModeHandler(event) {
    this._editMode = event.detail.mode;
    log.info({ enabled: this._editMode }, 'edit mode changed');
    this.#addActivity(event);
  }

  render() {

    // console.log("User: ", this._userInfo);

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
