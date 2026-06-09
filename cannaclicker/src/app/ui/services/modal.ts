export type ModalActionVariant = 'primary' | 'secondary' | 'danger';

export interface ModalAction {
  label: string;
  variant?: ModalActionVariant;
  autoFocus?: boolean;
  closeOnClick?: boolean;
  disabled?: boolean;
  onClick?: (handle: ModalHandle) => void | Promise<void>;
}

export interface ActionModalOptions {
  title: string;
  description: string;
  body?: HTMLElement;
  tone?: 'default' | 'danger';
  closeLabel?: string;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  actions: ModalAction[];
  onClose?: () => void;
}

export interface ModalHandle {
  readonly overlay: HTMLElement;
  readonly dialog: HTMLElement;
  readonly actions: readonly HTMLButtonElement[];
  close(): void;
}

let modalCounter = 0;

export function openActionModal(options: ActionModalOptions): ModalHandle {
  const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  const id = `action-modal-${++modalCounter}`;
  const overlay = document.createElement('div');
  overlay.className = `modal-overlay modal-overlay--action hidden${
    options.tone === 'danger' ? ' is-danger' : ''
  }`;
  overlay.setAttribute('aria-hidden', 'true');

  const dialog = document.createElement('div');
  dialog.className = 'modal-card modal-card--wide';
  dialog.setAttribute('role', 'dialog');
  dialog.setAttribute('aria-modal', 'true');
  dialog.setAttribute('aria-labelledby', `${id}-title`);
  dialog.setAttribute('aria-describedby', `${id}-description`);
  dialog.tabIndex = -1;

  const title = document.createElement('h2');
  title.id = `${id}-title`;
  title.className = 'modal-title';
  title.textContent = options.title;

  const description = document.createElement('p');
  description.id = `${id}-description`;
  description.className = 'modal-description';
  description.textContent = options.description;

  const actions = document.createElement('div');
  actions.className = 'modal-actions';

  const handle: ModalHandle = {
    overlay,
    dialog,
    actions: [],
    close,
  };

  const buttons = options.actions.map((action) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `modal-button ${action.variant ?? 'secondary'}`;
    button.textContent = action.label;
    button.disabled = !!action.disabled;
    button.addEventListener('click', async () => {
      await action.onClick?.(handle);
      if (action.closeOnClick ?? !action.onClick) {
        close();
      }
    });
    actions.appendChild(button);
    return button;
  });

  Object.defineProperty(handle, 'actions', {
    value: buttons,
  });

  dialog.append(title, description);
  if (options.body) {
    dialog.appendChild(options.body);
  }
  dialog.appendChild(actions);
  overlay.appendChild(dialog);
  document.body.appendChild(overlay);

  const closeOnBackdrop = options.closeOnBackdrop ?? true;
  const closeOnEscape = options.closeOnEscape ?? true;

  overlay.addEventListener('click', (event) => {
    if (closeOnBackdrop && event.target === overlay) {
      close();
    }
  });

  function handleKeydown(event: KeyboardEvent): void {
    if (event.code === 'Escape' && closeOnEscape) {
      event.preventDefault();
      close();
      return;
    }

    if (event.code !== 'Tab') {
      return;
    }

    const focusable = getFocusable(dialog);
    if (focusable.length === 0) {
      event.preventDefault();
      dialog.focus();
      return;
    }

    const currentIndex = focusable.indexOf(document.activeElement as HTMLElement);
    const nextIndex = event.shiftKey
      ? currentIndex <= 0
        ? focusable.length - 1
        : currentIndex - 1
      : currentIndex === focusable.length - 1
        ? 0
        : currentIndex + 1;

    event.preventDefault();
    focusable[nextIndex]?.focus();
  }

  function close(): void {
    window.removeEventListener('keydown', handleKeydown, true);
    overlay.classList.remove('visible');
    overlay.setAttribute('aria-hidden', 'true');
    window.setTimeout(() => {
      overlay.remove();
      options.onClose?.();
      if (previouslyFocused?.isConnected) {
        previouslyFocused.focus();
      }
    }, 180);
  }

  window.addEventListener('keydown', handleKeydown, true);
  requestAnimationFrame(() => {
    overlay.classList.remove('hidden');
    overlay.setAttribute('aria-hidden', 'false');
    requestAnimationFrame(() => overlay.classList.add('visible'));
    const initial = buttons.find((_, index) => options.actions[index]?.autoFocus);
    (initial ?? getFocusable(dialog)[0] ?? dialog).focus();
  });

  return handle;
}

function getFocusable(root: HTMLElement): HTMLElement[] {
  const selector = [
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'a[href]',
    '[tabindex]:not([tabindex="-1"])',
  ].join(',');

  return Array.from(root.querySelectorAll<HTMLElement>(selector)).filter((element) => {
    const style = window.getComputedStyle(element);
    return style.display !== 'none' && style.visibility !== 'hidden';
  });
}
