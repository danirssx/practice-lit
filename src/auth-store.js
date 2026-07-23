import { signal } from '@lit-labs/preact-signals';
import { createLogger } from './platform/logger.js';

const log = createLogger('users');

export class User {
  constructor(id, username, email) {
    this.id = id;
    this.username = username;
    this.email = email;
  }
}

// Handles singleton of userStore

export class UserStore {
  #list = signal([]);

  constructor(initialUsers = []) {
    this.#list.value = Array.isArray(initialUsers) ? initialUsers : [];
    log.debug({ initialUserCount: this.#list.value.length }, 'user store initialized');
  }

  get users() {
    return this.#list.value;
  }

  find(user) {
    return this.#list.value.find((item) => user.username === item.username);
  }

  createUser(username, email) {
    const userFind = this.find({ username: username, email: email });
    if (userFind) {
      log.info({ userId: userFind.id, username: userFind.username }, 'existing user returned');
      return userFind;
    }
    const normalizedUsername = (username || '').trim();
    const normalizedEmail = (email || '').trim().toLowerCase();
    if (!normalizedUsername || !normalizedEmail) {
      log.warn({ reason: !normalizedUsername ? 'missing-username' : 'missing-email' }, 'user creation rejected');
      return null;
    }
    if (this.#hasEmail(normalizedEmail) || this.#hasUsername(normalizedUsername)) {
      log.warn({ username: normalizedUsername, reason: 'duplicate-user' }, 'user creation rejected');
      return null;
    }

    const newUser = new User(crypto.randomUUID(), normalizedUsername, normalizedEmail);
    this.#list.value = [...this.#list.value, newUser];
    // Deliberately exclude email from logs: observability should not leak personal data.
    log.info({ userId: newUser.id, username: newUser.username }, 'user created');
    return newUser;
  }

  #hasEmail(email) {
    return this.#list.value.some((user) => user.email === email);
  }

  #hasUsername(username) {
    return this.#list.value.some((user) => user.username === username);
  }
}
