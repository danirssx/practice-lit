import { UserStore } from '../auth-store.js';
import { TaskStore } from '../task-store.js';
import { initLogger } from '../platform/logger.js';

// Roarr needs a browser writer. Set it up before any store instance can emit a log.
initLogger();

// The one shared application state boundary for both task components.
export const taskStore = new TaskStore();

// Handles user Store
export const userStore = new UserStore();
