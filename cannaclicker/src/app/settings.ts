export type MotionIntensity = 'full' | 'reduced' | 'minimal';

export interface SettingsState {
  showOfflineEarnings: boolean;
  motionIntensity: MotionIntensity;
}

export function createDefaultSettings(): SettingsState {
  return { showOfflineEarnings: true, motionIntensity: 'full' };
}
