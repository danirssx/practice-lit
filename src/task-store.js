import { signal } from '@lit-labs/preact-signals';

export class Task {
  constructor(id, title, user = '') {
    this.id = id;
    this.title = title;
    this.done = false;
    this.user = user;
  }
}

export class TaskStore {
  #list = signal([]);

  constructor(initialTasks = []) {
    this.#list.value = Array.isArray(initialTasks) ? initialTasks : [];
  }

  get tasks() {
    return this.#list.value;
  }

  createTask(text, user = '') {
    const title = (text || '').trim();
    if (!title) return null;

    const task = new Task(crypto.randomUUID(), title, user);
    this.#list.value = [...this.#list.value, task];
    return task;
  }

  toggleTask(id) {
    if (!id) return false;
    const hasTask = this.#list.value.some((task) => task.id === id);
    if (!hasTask) return false;

    this.#list.value = this.#list.value.map((task) =>
      task.id === id ? { ...task, done: !task.done } : task,
    );
    return true;
  }

  updateTask(id, text) {
    const title = (text || '').trim();
    if (!id || !title) return false;

    const hasTask = this.#list.value.some((task) => task.id === id);
    if (!hasTask) return false;

    this.#list.value = this.#list.value.map((task) =>
      task.id === id ? { ...task, title } : task,
    );
    return true;
  }

  deleteTask(id) {
    if (!id) return false;
    const hasTask = this.#list.value.some((task) => task.id === id);
    if (!hasTask) return false;

    this.#list.value = this.#list.value.filter((task) => task.id !== id);
    return true;
  }
}
