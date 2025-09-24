import type { PrestigeModalRefs } from "../types";

export function createPrestigeModal(): PrestigeModalRefs {
  const overlay = document.createElement("div");
  overlay.className = "modal-overlay hidden";
  overlay.setAttribute("aria-hidden", "true");

  const dialog = document.createElement("div");
  dialog.className = "modal-card";
  dialog.setAttribute("role", "dialog");
  dialog.setAttribute("aria-modal", "true");

  const title = document.createElement("h2");
  title.className = "modal-title";

  const description = document.createElement("p");
  description.className = "text-sm text-neutral-300";

  const stats = document.createElement("dl");
  stats.className = "modal-stats grid gap-3 sm:grid-cols-2";

  const current = createModalStat(stats);
  const after = createModalStat(stats);
  const gain = createModalStat(stats);
  const bonus = createModalStat(stats);

  const warning = document.createElement("p");
  warning.className = "modal-warning";

  const checkboxWrap = document.createElement("label");
  checkboxWrap.className = "mt-3 flex items-center gap-2 text-sm text-neutral-300";

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.className = "h-4 w-4 rounded border border-emerald-500/50 bg-transparent text-emerald-300 focus-visible:ring-emerald-300/70";

  const checkboxLabel = document.createElement("span");

  checkboxWrap.append(checkbox, checkboxLabel);

  const statusLabel = document.createElement("p");
  statusLabel.className = "text-sm font-medium text-amber-300";

  const actions = document.createElement("div");
  actions.className = "modal-actions";

  const cancelButton = document.createElement("button");
  cancelButton.type = "button";
  cancelButton.className = "modal-button secondary";

  const confirmButton = document.createElement("button");
  confirmButton.type = "button";
  confirmButton.className = "modal-button primary";

  actions.append(cancelButton, confirmButton);
  dialog.append(title, description, stats, warning, checkboxWrap, statusLabel, actions);
  overlay.appendChild(dialog);

  return {
    overlay,
    dialog,
    title,
    description,
    warning,
    previewCurrentLabel: current.label,
    previewCurrentValue: current.value,
    previewAfterLabel: after.label,
    previewAfterValue: after.value,
    previewGainLabel: gain.label,
    previewGainValue: gain.value,
    previewBonusLabel: bonus.label,
    previewBonusValue: bonus.value,
    checkbox,
    checkboxLabel,
    confirmButton,
    cancelButton,
    statusLabel,
  } satisfies PrestigeModalRefs;
}

function createModalStat(wrapper: HTMLElement): { label: HTMLElement; value: HTMLElement } {
  const row = document.createElement("div");
  row.className = "modal-stat";

  const label = document.createElement("dt");
  label.className = "modal-stat-label";

  const value = document.createElement("dd");
  value.className = "modal-stat-value";

  row.append(label, value);
  wrapper.appendChild(row);

  return { label, value };
}
