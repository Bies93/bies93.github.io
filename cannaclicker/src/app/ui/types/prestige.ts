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

import type { MilestoneId } from '../../../data/milestones';
import type { AscensionNodeId } from '../../../data/ascension';

export interface AscensionNodeCardRefs {
  container: HTMLElement;
  title: HTMLElement;
  category: HTMLElement;
  description: HTMLElement;
  effect: HTMLElement;
  cost: HTMLElement;
  status: HTMLElement;
  button: HTMLButtonElement;
}

export interface PrestigePanelRefs {
  container: HTMLElement;
  description: HTMLElement;
  spendableSeedsLabel: HTMLElement;
  spendableSeedsValue: HTMLElement;
  totalSeedsLabel: HTMLElement;
  totalSeedsValue: HTMLElement;
  permanentLabel: HTMLElement;
  permanentValue: HTMLElement;
  kickstartLabel: HTMLElement;
  kickstartValue: HTMLElement;
  activeKickstartLabel: HTMLElement;
  activeKickstartValue: HTMLElement;
  ascensionSummary: HTMLElement;
  ascensionList: HTMLElement;
  ascensionNodes: Map<AscensionNodeId, AscensionNodeCardRefs>;
  milestoneList: HTMLElement;
  milestones: Map<MilestoneId, MilestoneCardRefs>;
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
