import { LitElement, html, css } from 'lit';
import { SignalWatcher } from '@lit-labs/preact-signals';
import { taskStore } from './app/container.js';
import { createRef, ref } from 'lit/directives/ref.js';

export class PracticeTaskForm extends SignalWatcher(LitElement) {
  static properties = {
    draft: { state: true },
    userInfo: {},
  };

  static styles = css`
    :host { display: block; max-width: 36rem; margin: 2rem auto 1rem; font-family: system-ui, sans-serif; }
    form { display: flex; gap: 0.5rem; }
    input { flex: 1; min-width: 0; padding: 0.5rem; }
    button { padding: 0.5rem 0.75rem; }
    p { color: #57606a; }
  `;

  constructor() {
    super();
    this.draft = '';
    this._inputRef = createRef();
  }

  #onInput(event) {
    this.draft = event.target.value;
  }

  #onSubmit(event) {
    event.preventDefault();
    const newTask = taskStore.createTask(this.draft, this.userInfo?.username);
    if (newTask) {
      this.dispatchEvent(new CustomEvent('task-board-change', {
        detail: { id: newTask.id, action: 'created', title: newTask.title },
        composed: true,
        bubbles: true,
      }))
       this.draft = '';
    }
  }

  updated(changedProperties) {
    if (!this._inputRef) return;
    if (changedProperties.has('userInfo')) {
      this._inputRef.value?.focus();
    }
  }

  render() {
    const count = taskStore.tasks.length;
    return html`
      <h1>Add a task</h1>
      <form @submit=${this.#onSubmit}>
        <input .value=${this.draft} @input=${this.#onInput} placeholder="Task title" aria-label="Task title" ${ref(this._inputRef)}>
        <button type="submit">Add</button>
      </form>
      <p>Shared store contains ${count} task${count === 1 ? '' : 's'}.</p>
    `;
  }
}

customElements.define('practice-task-form', PracticeTaskForm);
