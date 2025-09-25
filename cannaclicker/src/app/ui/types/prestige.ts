export interface MilestoneCardRefs {
  container: HTMLElement;
  title: HTMLElement;
  reward: HTMLElement;
  description: HTMLElement;
  badge: HTMLElement;
  progressBar: HTMLElement;
  progressFill: HTMLElement;
  progressLabel: HTMLElement;
}

export interface PrestigePanelRefs {
  container: HTMLElement;
  description: HTMLElement;
  permanentLabel: HTMLElement;
  permanentValue: HTMLElement;
  kickstartLabel: HTMLElement;
  kickstartValue: HTMLElement;
  activeKickstartLabel: HTMLElement;
  activeKickstartValue: HTMLElement;
  milestoneList: HTMLElement;
  milestones: Map<string, MilestoneCardRefs>;
  requirement: HTMLElement;
  actionButton: HTMLButtonElement;
}

export interface PrestigeModalRefs {
  overlay?: HTMLElement;
  dialog: HTMLDivElement;
  title: HTMLElement;
  description: HTMLElement;
  warning: HTMLElement;
  previewCurrentLabel: HTMLElement;
  previewCurrentValue: HTMLElement;
  previewAfterLabel: HTMLElement;
  previewAfterValue: HTMLElement;
  previewGainLabel: HTMLElement;
  previewGainValue: HTMLElement;
  previewBonusLabel: HTMLElement;
  previewBonusValue: HTMLElement;
  checkbox: HTMLInputElement;
  checkboxLabel: HTMLElement;
  confirmButton: HTMLButtonElement;
  cancelButton: HTMLButtonElement;
  statusLabel: HTMLElement;
}

export interface UIPrestigeModalHost {
  prestigeModal: PrestigeModalRefs;
}
