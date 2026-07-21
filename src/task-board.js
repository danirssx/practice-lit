import { LitElement, html, css } from 'lit';
import { SignalWatcher } from '@lit-labs/preact-signals';
import  { taskStore } from './app/container.js';
import { createRef, ref } from 'lit/directives/ref.js';
import './status-badge.js';

const Filter = {
  ALL: 'all',
  ACTIVE: 'active',
  DONE: 'done',
};

export class PracticeTaskBoard extends SignalWatcher(LitElement) {
  static properties = {
    editingId: { state: true },
    draftTitle: { state: true },
    _selectedFilter: { state: true },
    _query: { state: true },
    viewCommand: { attribute: false },
  };

  static styles = css`
    :host { display: block; max-width: 36rem; margin: 1rem auto 2rem; font-family: system-ui, sans-serif; }
    input[type="text"] { flex: 1; min-width: 0; padding: 0.5rem; }
    button { padding: 0.5rem 0.75rem; }
    ul { display: grid; gap: 0.5rem; padding: 0; list-style: none; }
    li { display: flex; align-items: center; gap: 0.5rem; padding: 0.6rem; border: 1px solid #d0d7de; }
    li.done span { color: #57606a; text-decoration: line-through; }
    li button { margin-left: auto; }
    .empty { color: #57606a; }
    .container-filter { display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; }
    .container-filter label { font-weight: 600; }
    .filter-select { min-width: 8rem; padding: 0.5rem; }
    input[type="text"]:focus {
      outline: 3px solid green;
      outline-offset: 2px;
    }
    .search-input {
      box-sizing: border-box;
      width: 100%;
      font-size: 1rem;
      padding: 0.5rem;
      border-radius: 0.25rem;
      margin-bottom: 20px;
    }
  `;

  constructor() {
    super();
    this.editingId = null;
    this.draftTitle = '';
    this._selectedFilter = Filter.ALL;
    this._query = '';
    this.viewCommand = null;
    this._inputRef = createRef();
    this._searchRef = createRef();
  }

  #startEditing(task) {
    this.editingId = task.id;
    this.draftTitle = task.title;
  }

  #saveEdit(taskId) {
    if (taskStore.updateTask(taskId, this.draftTitle)) {
      this.dispatchEvent(new CustomEvent('task-board-change', {
        detail: { id: taskId, action: 'edited', title: this.draftTitle },
        composed: true,
        bubbles: true,
      }))
      this.editingId = null;
      this.draftTitle = '';
    }
  }

  #deleteTask(id, title) {
    if (!id) return;
    const allowed = this.dispatchEvent(new CustomEvent('task-delete-request', {
      detail: { id, title },
      composed: true,
      bubbles: true,
      cancelable: true,
    }));

    console.log("Allowed: ", allowed);

    if (allowed && taskStore.deleteTask(id)) {
      this.dispatchEvent(new CustomEvent('task-board-change', {
        detail: { id, action: 'deleted', title },
        composed: true,
        bubbles: true,
      }));
    }
  }

  #toggleTask(id, title) {
    if (taskStore.toggleTask(id)) {
      this.dispatchEvent(new CustomEvent('task-board-change', {
        detail: { id, action: 'toggled', title },
        composed: true,
        bubbles: true,
      }));
    }
  }

  #setFilter(event) {
    this._selectedFilter = event.currentTarget.value;
  }

  #setQuery(event) {
    this._query = event.currentTarget.value;
  }

  #visibleTasks(tasks) {
    const query = this._query.trim().toLowerCase();

    return tasks.filter((task) => {
      const statusMatches = this._selectedFilter === Filter.ACTIVE
        ? !task.done
        : this._selectedFilter === Filter.DONE
          ? task.done
          : true;
      const queryMatches = !query || task.title.toLowerCase().includes(query);

      return statusMatches && queryMatches;
    });
  }

  /**
   * Here I will listen if there was a 'show-created-task' and clear search bar
   */

  willUpdate(changedProperties) {
    super.willUpdate(changedProperties);
    if (changedProperties.has('viewCommand') && this.viewCommand?.type === 'show-created-task') {
      this._query = '';
      this._selectedFilter = Filter.ALL;
     }
   }

  /**
   * Focus input of search when it's first rendered the content
   */
  firstUpdated() {
    if (!this._searchRef) return;
    this._searchRef.value?.focus();
  }

  /**
   * Focus input of editing when it's pressed the edit button
   * @param {editingId} changedProperties
   */
  updated(changedProperties) {
    super.updated(changedProperties);
    if (changedProperties.has('editingId') && this.editingId !== null) {
      this._inputRef.value?.focus();
    }
  }

  render() {
    const tasks = taskStore.tasks;
    const visibleTasks = this.#visibleTasks(tasks);

    return html`
      <input
        class="search-input"
        type="text"
        .value=${this._query}
        @input=${this.#setQuery}
        ${ref(this._searchRef)}
        placeholder="Search tasks"
        aria-label="Search tasks"
      >
      <div class="container-filter">
        <label for="task-status-filter">Show tasks</label>
        <select
          id="task-status-filter"
          class="filter-select"
          .value=${this._selectedFilter}
          @change=${this.#setFilter}
        >
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="done">Done</option>
        </select>
      </div>
      <h2>Shared task list</h2>
      ${tasks.length === 0
        ? html`<p class="empty">No tasks yet.</p>`
        : visibleTasks.length === 0
          ? html`<p class="empty">No tasks match this filter or search.</p>`
        : html`
          <ul>
            ${visibleTasks.map((task) => html`
              <li class=${task.done ? 'done' : ''}>
                <input
                  type="checkbox"
                  .checked=${task.done}
                  @change=${() => this.#toggleTask(task.id, task.title)}
                  aria-label="Mark ${task.title} complete"
                >
                ${this.editingId === task.id
                  ? html`
                    <input
                      type="text"
                      .value=${this.draftTitle}
                       ${ref(this._inputRef)}
                      @input=${(event) => { this.draftTitle = event.target.value; }}
                      aria-label="Edit ${task.title}"
                    >
                    <button type="button" @click=${() => this.#saveEdit(task.id)}>Save</button>
                    <button type="button" @click=${() => { this.editingId = null; }}>Cancel</button>
                  `
                  : html`
                    <span>${task.title}</span>
                    <button type="button" @click=${() => this.#startEditing(task)}>Edit</button>
                  `}
                <button type="button" @click=${() => this.#deleteTask(task.id, task.title)}>Delete</button>
                <task-status-badge .status=${task.done ? 'done' : 'active'}></task-status-badge>
              </li>
            `)}
          </ul>
        `}
    `;
  }
}

customElements.define('practice-task-board', PracticeTaskBoard);
