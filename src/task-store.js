import { signal } from '@lit-labs/preact-signals';
import { createLogger } from './platform/logger.js';

const log = createLogger('tasks');

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
    log.debug({ initialTaskCount: this.#list.value.length }, 'task store initialized');
  }

  get tasks() {
    return this.#list.value;
  }

  createTask(text, user = '') {
    const title = (text || '').trim();
    if (!title) {
      log.warn({ reason: 'empty-title' }, 'task creation rejected');
      return null;
    }

    const task = new Task(crypto.randomUUID(), title, user);
    this.#list.value = [...this.#list.value, task];
    log.info({ taskId: task.id, title: task.title, user: task.user }, 'task created');
    return task;
  }

  toggleTask(id) {
    if (!id) {
      log.warn({ reason: 'missing-id' }, 'task toggle rejected');
      return false;
    }
    const hasTask = this.#list.value.some((task) => task.id === id);
    if (!hasTask) {
      log.warn({ taskId: id }, 'task toggle rejected: task not found');
      return false;
    }

    this.#list.value = this.#list.value.map((task) =>
      task.id === id ? { ...task, done: !task.done } : task,
    );
    const task = this.#list.value.find((item) => item.id === id);
    log.info({ taskId: id, done: task.done }, 'task completion toggled');
    return true;
  }

  updateTask(id, text) {
    const title = (text || '').trim();
    if (!id || !title) {
      log.warn({ taskId: id || null, reason: !id ? 'missing-id' : 'empty-title' }, 'task update rejected');
      return false;
    }

    const hasTask = this.#list.value.some((task) => task.id === id);
    if (!hasTask) {
      log.warn({ taskId: id }, 'task update rejected: task not found');
      return false;
    }

    this.#list.value = this.#list.value.map((task) =>
      task.id === id ? { ...task, title } : task,
    );
    log.info({ taskId: id, title }, 'task updated');
    return true;
  }

  deleteTask(id) {
    if (!id) {
      log.warn({ reason: 'missing-id' }, 'task deletion rejected');
      return false;
    }
    const hasTask = this.#list.value.some((task) => task.id === id);
    if (!hasTask) {
      log.warn({ taskId: id }, 'task deletion rejected: task not found');
      return false;
    }

    this.#list.value = this.#list.value.filter((task) => task.id !== id);
    log.info({ taskId: id, remainingTaskCount: this.#list.value.length }, 'task deleted');
    return true;
  }
}
