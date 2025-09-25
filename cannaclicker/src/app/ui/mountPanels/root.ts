import { t, type LocaleKey } from "../../i18n";
import { createPrestigeModal } from "../components/prestigeModal";
import type { UIPrestigeModalHost, UIServiceRefs } from "../types";

export interface MountRootArgs {
  root: HTMLElement;
  locale: LocaleKey;
}

export interface MountRootResult extends UIServiceRefs, UIPrestigeModalHost {}

export function mountRootServices(args: MountRootArgs): MountRootResult {
  const { root, locale } = args;

  const eventLayer = document.createElement("div");
  eventLayer.className = "event-layer";
  eventLayer.dataset.uiRole = "event-layer";
  eventLayer.dataset.testid = "event-layer";
  eventLayer.setAttribute("role", "region");
  eventLayer.setAttribute("aria-label", t(locale, "ui.sections.eventLayer"));
  root.appendChild(eventLayer);

  const toastContainer = document.createElement("div");
  toastContainer.className = "toast-stack";
  toastContainer.dataset.uiRole = "toast-container";
  toastContainer.dataset.testid = "toast-container";
  toastContainer.setAttribute("role", "region");
  toastContainer.setAttribute("aria-label", t(locale, "ui.sections.toastContainer"));
  root.appendChild(toastContainer);

  const prestigeModal = createPrestigeModal();
  if (prestigeModal.overlay) {
    root.appendChild(prestigeModal.overlay);
  }

  return {
    prestigeModal,
    toastContainer,
    eventLayer,
    modalOverlay: prestigeModal.overlay,
    eventRoot: eventLayer,
  };
}
