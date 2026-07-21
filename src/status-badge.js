import { LitElement, html, css } from "lit";

export class TaskStatusBadge extends LitElement {
  static properties = {
    status: { type: String, reflect: true },
  };

  static styles = css`
        :host {
            font-size: 1rem;
            font-weight: 400;
            padding: 0.25rem;
            border-radius: 5px;
            color: white;
        }
        :host([status="done"]) {
            background-color: green;
        }
        :host([status="active"]) {
            background-color: purple;
        }
    `;

  constructor() {
    super();
    this.status = 'active';
  }

  render() {
    return html`
            <span>${this.status}</span>
        `
  }
}

customElements.define('task-status-badge', TaskStatusBadge);
