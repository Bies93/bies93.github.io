export const MOTION_INTENSITIES = ['full', 'reduced', 'minimal'] as const;
export const UI_THEMES = ['botanical', 'neon', 'sunset', 'moon', 'copper'] as const;
export const PLANT_SKINS = ['classic', 'jade', 'gold', 'violet', 'crystal', 'ember'] as const;

export type MotionIntensity = (typeof MOTION_INTENSITIES)[number];
export type UiTheme = (typeof UI_THEMES)[number];
export type PlantSkin = (typeof PLANT_SKINS)[number];

export interface SettingsState {
  showOfflineEarnings: boolean;
  motionIntensity: MotionIntensity;
  uiTheme: UiTheme;
  plantSkin: PlantSkin;
  sfxVolume: number;
  musicEnabled: boolean;
  musicVolume: number;
}

export function createDefaultSettings(): SettingsState {
  return {
    showOfflineEarnings: true,
    motionIntensity: 'full',
    uiTheme: 'botanical',
    plantSkin: 'classic',
    sfxVolume: 0.8,
    musicEnabled: true,
    musicVolume: 0.45,
  };
}

export function isMotionIntensity(value: string): value is MotionIntensity {
  return MOTION_INTENSITIES.includes(value as MotionIntensity);
}

export function isUiTheme(value: string): value is UiTheme {
  return UI_THEMES.includes(value as UiTheme);
}

export function isPlantSkin(value: string): value is PlantSkin {
  return PLANT_SKINS.includes(value as PlantSkin);
}

export function normaliseVolume(value: unknown, fallback = 0.8): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return fallback;
  }
  return Math.max(0, Math.min(1, value));
}
