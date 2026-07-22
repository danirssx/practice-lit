import { signal } from '@lit-labs/preact-signals';

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
  }

  get users() {
    return this.#list.value;
  }

  find(user) {
    return this.#list.value.find((item) => user.username === item.username);
  }

  createUser(username, email) {
    const userFind = this.find({ username: username, email: email });
    if (userFind) return userFind;
    const normalizedUsername = (username || '').trim();
    const normalizedEmail = (email || '').trim().toLowerCase();
    if (!normalizedUsername || !normalizedEmail) return null;
    if (this.#hasEmail(normalizedEmail) || this.#hasUsername(normalizedUsername)) return null;

    const newUser = new User(crypto.randomUUID(), normalizedUsername, normalizedEmail);
    this.#list.value = [...this.#list.value, newUser];
    return newUser;
  }

  #hasEmail(email) {
    return this.#list.value.some((user) => user.email === email);
  }

  #hasUsername(username) {
    return this.#list.value.some((user) => user.username === username);
  }
}
