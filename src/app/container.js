import { UserStore } from '../auth-store.js';
import { TaskStore } from '../task-store.js';

// The one shared application state boundary for both task components.
export const taskStore = new TaskStore();

// Handles user Store
export const userStore = new UserStore();
