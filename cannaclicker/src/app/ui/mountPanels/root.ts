import { createPrestigeModal } from "../components/prestigeModal";
import type { UIPrestigeModalHost, UIServiceRefs } from "../types";

export interface MountRootArgs {
  root: HTMLElement;
}

export interface MountRootResult extends UIServiceRefs, UIPrestigeModalHost {}

export function mountRootServices(args: MountRootArgs): MountRootResult {
  const { root } = args;

  const eventLayer = document.createElement("div");
  eventLayer.className = "event-layer";
  root.appendChild(eventLayer);

  const toastContainer = document.createElement("div");
  toastContainer.className = "toast-stack";
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
