import { asset } from './assets';

export const itemIcons = {
  seedling: asset('img/items/seedling.svg'),
  planter: asset('img/items/planter.svg'),
  grow_tent: asset('img/items/grow_tent.svg'),
  grow_light: asset('img/items/grow_light.svg'),
  cultivator: asset('img/items/cultivator.svg'),
  irrigation_system: asset('img/items/irrigation_system.svg'),
  co2_tank: asset('img/items/co2_tank.svg'),
  climate_controller: asset('img/items/climate_controller.svg'),
  hydroponic_rack: asset('img/items/hydroponic_rack.svg'),
  genetics_lab: asset('img/items/genetics_lab.svg'),
  trimming_robot: asset('img/items/trimming_robot.svg'),
  micro_greenhouse: asset('img/items/micro_greenhouse.svg'),
} as const;

export const upgradeIcons = {
  buildingBoost: asset('img/upgrades/building-boost.svg'),
  globalBps: asset('img/upgrades/global-bps.svg'),
  clickPower: asset('img/upgrades/click-power.svg'),
  automation: asset('img/upgrades/automation.svg'),
  costEfficiency: asset('img/upgrades/cost-efficiency.svg'),
} as const;

export const researchIcons = {
  growth: asset('img/research/growth.svg'),
  automation: asset('img/research/automation.svg'),
  costcut: asset('img/research/costcut.svg'),
  overdrive: asset('img/research/overdrive.svg'),
  strain: asset('img/research/strain.svg'),
  seeds: asset('img/research/seeds.svg'),
  offline: asset('img/research/offline.svg'),
} as const;

export const eventIcons = {
  golden_bud: 'img/events/golden-bud.svg',
  seed_pack: 'img/events/seed-pack.svg',
  lucky_joint: 'img/events/lucky-joint.svg',
  fertile_rain: 'img/events/fertile-rain.svg',
  market_rush: 'img/events/market-rush.svg',
  green_surge: 'img/events/green-surge.svg',
  mutant_sprout: 'img/events/mutant-sprout.svg',
  supply_drop: 'img/events/supply-drop.svg',
} as const;

export const uiIcons = {
  export: asset('img/ui/export.svg'),
  import: asset('img/ui/import.svg'),
  reset: asset('img/ui/reset.svg'),
  settings: asset('img/ui/settings.svg'),
  seeds: asset('img/ui/seeds.svg'),
  prestige: asset('img/ui/prestige.svg'),
  research: asset('img/ui/research.svg'),
  upgrade: asset('img/ui/upgrade.svg'),
  shop: asset('img/ui/shop.svg'),
  stats: asset('img/ui/stats.svg'),
  soundOn: asset('img/ui/sound-on.svg'),
  soundOff: asset('img/ui/sound-off.svg'),
  info: asset('img/ui/info.svg'),
  close: asset('img/ui/close.svg'),
  buy: asset('img/ui/buy.svg'),
  locked: asset('img/ui/locked.svg'),
  auto: asset('img/ui/auto.svg'),
  warning: asset('img/ui/warning.svg'),
  leaf: asset('img/ui/leaf.svg'),
  bps: asset('img/ui/bps.svg'),
  bpc: asset('img/ui/bpc.svg'),
  total: asset('img/ui/total.svg'),
  achievementBase: asset('img/ui/achievement-base.svg'),
  achievementRibbon: asset('img/ui/achievement-ribbon.svg'),
  achievementLeaf: asset('img/ui/achievement-leaf.svg'),
  achievementLight: asset('img/ui/achievement-light.svg'),
  achievementPot: asset('img/ui/achievement-pot.svg'),
} as const;

export const plantStages = [
  asset('img/plant/stage-01.svg'),
  asset('img/plant/stage-02.svg'),
  asset('img/plant/stage-03.svg'),
  asset('img/plant/stage-04.svg'),
  asset('img/plant/stage-05.svg'),
  asset('img/plant/stage-06.svg'),
  asset('img/plant/stage-07.svg'),
  asset('img/plant/stage-08.svg'),
  asset('img/plant/stage-09.svg'),
  asset('img/plant/stage-10.svg'),
  asset('img/plant/stage-11.svg'),
] as const;

export const backgroundAssets = {
  desktop: asset('img/backgrounds/desktop.svg'),
  mobile: asset('img/backgrounds/mobile.svg'),
  plants: asset('img/backgrounds/plants.svg'),
  noise: asset('img/backgrounds/noise.svg'),
} as const;
