import { TaskStore } from '../task-store.js';

// The one shared application state boundary for both task components.
export const taskStore = new TaskStore();
