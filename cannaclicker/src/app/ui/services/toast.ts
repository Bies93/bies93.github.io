import Decimal from 'break_infinity.js';

export interface ToastOptions {
  title: string;
  message: string;
  durationMs?: number;
}

type ShowToast = ((options: ToastOptions) => void) & {
  bind(container: HTMLElement | null): void;
};

type Announce = ((text: string) => void) & {
  bind(element: HTMLElement | null): void;
  shouldAnnounce(total: Decimal): boolean;
};

let toastContainer: HTMLElement | null = null;
let announcer: HTMLElement | null = null;
let lastAnnounced = new Decimal(0);

export const showToast: ShowToast = ((options: ToastOptions & { container?: HTMLElement | null }) => {
  if (options.container) {
    toastContainer = options.container;
  }

  if (!toastContainer) {
    return;
  }

  const duration = Math.max(0, options.durationMs ?? 5000);

  const toast = document.createElement('div');
  toast.className = 'toast';

  const heading = document.createElement('strong');
  heading.className = 'toast-title';
  heading.textContent = options.title;

  const body = document.createElement('span');
  body.className = 'toast-message';
  body.textContent = options.message;

  toast.append(heading, body);
  toastContainer.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add('visible'));

  window.setTimeout(() => {
    toast.classList.remove('visible');
    window.setTimeout(() => toast.remove(), 300);
  }, duration);
}) as ShowToast;

showToast.bind = (container: HTMLElement | null) => {
  toastContainer = container ?? null;
};

export const announce: Announce = ((text: string) => {
  if (!announcer || text.length === 0) {
    return;
  }

  announcer.textContent = text;
}) as Announce;

announce.bind = (element: HTMLElement | null) => {
  announcer = element ?? null;
};

announce.shouldAnnounce = (total: Decimal) => {
  if (total.minus(lastAnnounced).lessThan(10)) {
    return false;
  }

  lastAnnounced = total;
  return true;
};
