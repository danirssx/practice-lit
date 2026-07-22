import { SignalWatcher } from "@lit-labs/preact-signals";
import { LitElement, html, css } from "lit";
import { userStore } from "./app/container";
import { styleMap } from 'lit/directives/style-map.js';
import { createRef, ref } from "lit/directives/ref.js";
/**
 * Header badge with the user info
 */

export class UserHeader extends SignalWatcher(LitElement) {
  static properties = {
    _draftEmail: { state: true },
    _draftUser: { state: true },
    editMode: {},
    userInfo: {},
  };

  static styles = css`
        :host { display: block; max-width: 36rem; margin: 1rem auto 2rem; font-family: system-ui, sans-serif; }
        button { padding: 0.5rem 0.75rem; color: white; border-radius: 5px; }
        span { color: black; font-weight: 500; font-size: 1rem; }
        input[type="text"] {
            padding: 0.5rem;
        }
    `

  constructor() {
    super();
    this._draftEmail = '';
    this._draftUser = '';
    // this.editMode = false;
    this._userRef = createRef();
  }

  #saveEdit() {
    const user = userStore.createUser(this._draftUser, this._draftEmail);
    if (!user) return;
    //event editMode
    // this.editMode = true;
    this.dispatchEvent(new CustomEvent('edit-activated', {
      detail: { action: 'edit-activated', id: user.id, title: "Edit Mode", mode: true },
      composed: true,
      bubbles: true,
    }))
    // event user created
    this.dispatchEvent(new CustomEvent('user-created', {
      detail: user,
      composed: true,
      bubbles: true,
    }));
  }

  updated(changedProperties) {
    super.updated(changedProperties);
    if (changedProperties.has('editMode') && !this.editMode) {
      this._userRef.value?.focus();
    }
  }

  #editActive() {
    this.dispatchEvent(new CustomEvent('edit-activated', {
      detail: { action: 'edit-activated', id: crypto.randomUUID(), title: "Edit Mode", mode: !this.editMode },
      composed: true,
      bubbles: true,
    }))
  }

  render() {
    const styleButton = { backgroundColor: this.editMode ? 'green' : 'orange' }

      return html`
          <div>
        <h1>User Info</h1>
                ${this.editMode && this.userInfo ?
                html`<div>
                    <span>${this.userInfo.username}</span>
                    <span>${this.userInfo.email}</span>
                    <button type="button" @click=${this.#editActive} style=${styleMap(styleButton)}>Edit</button>
                </div>
                `
        :
      html`<div>
        <input type="text" .
            value=${this._draftEmail}
            @input=${(e) => { this._draftEmail = e.target.value; }}
            placeholder="Email..."
            ${ref(this._userRef)}>
        <input type="text" .value=${this._draftUser} @input=${(e) => { this._draftUser = e.target.value; }} placeholder="User...">
        <button type="button" @click=${() => this.#saveEdit()} style=${styleMap(styleButton)}>Save</button>
      </div>
      `
      }
          </div>
        `
  }
}

customElements.define('user-header', UserHeader);
