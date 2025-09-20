export interface SettingsState {
  showOfflineEarnings: boolean;
}

export function createDefaultSettings(): SettingsState {
  return { showOfflineEarnings: true };
}

