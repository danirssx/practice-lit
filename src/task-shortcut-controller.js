const EDITABLE_SELECTOR = 'input, textarea, select, [contenteditable]:not([contenteditable="false"])';

/**
 * Reports global keyboard commands to one host-owned callback.
 * The controller owns only the window listener and its lifecycle cleanup.
 */
export class TaskShortcutController {
  #host;
  #onCommand;
  #listening = false;

  #onKeydown = (event) => {
    const target = event.target;
    if (target instanceof Element && target.closest(EDITABLE_SELECTOR)) return;
    if (!event.altKey) return;

    const command = event.code;
    if (!command) return;

    switch (command) {
      case 'KeyL':
        this._commandSelected = 'toggle-log';
        break;
      case 'KeyC':
        this._commandSelected = 'clear-log';
        break;
      case 'KeyM':
        this._commandSelected = 'edit-mode';
    }

    event.preventDefault();
    this.#onCommand(this._commandSelected);
  };

  constructor(host, onCommand) {
    this.#host = host;
    this.#onCommand = onCommand;
    this.#host.addController(this);
    this._commandSelected = '';
  }

  hostConnected() {
    if (this.#listening) return;
    window.addEventListener('keydown', this.#onKeydown);
    this.#listening = true;
  }

  hostDisconnected() {
    if (!this.#listening) return;
    window.removeEventListener('keydown', this.#onKeydown);
    this.#listening = false;
  }
}
