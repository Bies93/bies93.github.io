import { withBase } from "../paths";
import { formatAbilityTooltip, getAbilityLabel } from "../abilities";
import type { AbilityId, GameState } from "../state";
import type { ControlButtonRefs, AbilityButtonRefs } from "../types";

const ABILITY_ICON_MAP: Record<AbilityId, string> = {
  overdrive: "icons/abilities/ability-overdrive.png",
  burst: "icons/abilities/ability-burst.png",
};

export function wrapIcon(icon: HTMLImageElement): HTMLSpanElement {
  const wrapper = document.createElement("span");
  wrapper.className = "icon-badge";
  icon.classList.add("icon-img", "icon-dark");
  wrapper.append(icon);
  return wrapper;
}

export function createActionButton(iconPath: string): ControlButtonRefs {
  const button = document.createElement("button");
  button.type = "button";
  button.className =
    "inline-flex items-center gap-2 rounded-lg border border-white/10 bg-neutral-900/60 px-2.5 py-1.5 text-sm font-medium text-neutral-200 shadow-[0_10px_24px_rgba(9,11,19,0.45)] transition hover:border-emerald-400/40 hover:bg-neutral-800/70 focus-visible:ring-2 focus-visible:ring-emerald-300/70 focus-visible:ring-offset-0";

  const icon = new Image();
  icon.src = iconPath;
  icon.alt = "";
  icon.decoding = "async";

  const iconWrap = wrapIcon(icon);
  iconWrap.classList.add("control-icon-badge");
  icon.classList.add("control-icon-img");

  const label = document.createElement("span");
  label.className = "hidden whitespace-nowrap text-sm font-medium text-neutral-200 sm:inline";

  button.append(iconWrap, label);

  return { button, icon, label };
}

export function createDangerButton(iconPath: string): ControlButtonRefs {
  const control = createActionButton(iconPath);
  control.button.className = control.button.className
    .replace("hover:border-emerald-400/40", "hover:border-rose-400/60")
    .replace("hover:bg-neutral-800/70", "hover:bg-rose-900/30")
    .replace("focus-visible:ring-emerald-300/70", "focus-visible:ring-rose-300/70");
  control.button.classList.add("text-rose-300");
  return control;
}

export function createAbilityButton(id: string, state: GameState): AbilityButtonRefs {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "ability-btn";

  const header = document.createElement("div");
  header.className = "ability-header";

  const iconWrap = document.createElement("span");
  iconWrap.className = "ability-icon";

  const icon = document.createElement("img");
  icon.className = "ability-icon-img";
  icon.decoding = "async";
  icon.loading = "lazy";
  icon.alt = "";
  icon.setAttribute("aria-hidden", "true");
  icon.src = withBase(ABILITY_ICON_MAP[id as AbilityId] ?? "icons/ui/icon-leaf-click.png");
  iconWrap.appendChild(icon);

  const meta = document.createElement("div");
  meta.className = "ability-meta";

  const label = document.createElement("span");
  label.className = "ability-label";
  const labelText = getAbilityLabel(state, id as AbilityId, state.locale);
  label.textContent = labelText;

  const status = document.createElement("span");
  status.className = "ability-status";

  meta.append(label, status);
  header.append(iconWrap, meta);

  const progress = document.createElement("div");
  progress.className = "ability-progress";

  const progressBar = document.createElement("div");
  progressBar.className = "ability-progress-bar";
  progress.appendChild(progressBar);

  button.append(header, progress);
  button.title = formatAbilityTooltip(state, id as AbilityId, state.locale);
  button.setAttribute("aria-label", labelText);

  return { container: button, icon, label, status, progressBar };
}
