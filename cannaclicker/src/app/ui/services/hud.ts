export type HudNoticeTone = "info" | "warning";

export interface HudNoticeOptions {
  id?: string;
  tone?: HudNoticeTone;
}

const DEFAULT_ID = "default";
const BASE_CLASS =
  "pointer-events-auto w-full max-w-xl rounded-2xl border px-4 py-3 text-sm shadow-lg shadow-black/40 backdrop-blur";

function resolveToneClasses(tone: HudNoticeTone): string {
  if (tone === "warning") {
    return `${BASE_CLASS} border-amber-400/60 bg-amber-500/15 text-amber-100`;
  }

  return `${BASE_CLASS} border-emerald-400/40 bg-emerald-500/10 text-emerald-50`;
}

export function showHudNotice(
  target: HTMLElement | null | undefined,
  message: string,
  options: HudNoticeOptions = {},
): void {
  if (!target) {
    return;
  }

  const { id = DEFAULT_ID, tone = "warning" } = options;
  const messageSelector = `[data-hud-message="${id}"]`;
  let element = target.querySelector<HTMLDivElement>(messageSelector);

  if (!element) {
    element = document.createElement("div");
    element.dataset.hudMessage = id;
    element.dataset.uiRole = "hud-message";
    element.dataset.testid = `hud-message-${id}`;
    element.className = resolveToneClasses(tone);
    element.setAttribute("role", tone === "warning" ? "alert" : "status");
    element.setAttribute("aria-live", tone === "warning" ? "assertive" : "polite");
    target.appendChild(element);
  }

  element.textContent = message;
  element.className = resolveToneClasses(tone);
  element.setAttribute("role", tone === "warning" ? "alert" : "status");
  element.setAttribute("aria-live", tone === "warning" ? "assertive" : "polite");

  target.dataset.uiState = "visible";
}

export function clearHudNotice(
  target: HTMLElement | null | undefined,
  id: string = DEFAULT_ID,
): void {
  if (!target) {
    return;
  }

  const element = target.querySelector<HTMLDivElement>(`[data-hud-message="${id}"]`);
  if (!element) {
    return;
  }

  element.remove();

  if (!target.querySelector("[data-hud-message]")) {
    target.dataset.uiState = "hidden";
  }
}
