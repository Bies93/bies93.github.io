import { asset } from './assets';

export const itemIcons = {
  seedling: asset('img/items/seedling.png'),
  planter: asset('img/items/planter.png'),
  grow_tent: asset('img/items/grow_tent.png'),
  grow_light: asset('img/items/grow_light.png'),
  cultivator: asset('img/items/cultivator.png'),
  irrigation_system: asset('img/items/irrigation_system.png'),
  co2_tank: asset('img/items/co2_tank.png'),
  climate_controller: asset('img/items/climate_controller.png'),
  hydroponic_rack: asset('img/items/hydroponic_rack.png'),
  genetics_lab: asset('img/items/genetics_lab.png'),
  trimming_robot: asset('img/items/trimming_robot.png'),
  micro_greenhouse: asset('img/items/micro_greenhouse.png'),
} as const;

export const upgradeIcons = {
  buildingBoost: asset('img/upgrades/building-boost.png'),
  globalBps: asset('img/upgrades/global-bps.png'),
  clickPower: asset('img/upgrades/click-power.png'),
  automation: asset('img/upgrades/automation.png'),
  costEfficiency: asset('img/upgrades/cost-efficiency.png'),
} as const;

export const researchIcons = {
  growth: asset('img/research/growth.png'),
  automation: asset('img/research/automation.png'),
  costcut: asset('img/research/costcut.png'),
  overdrive: asset('img/research/overdrive.png'),
  strain: asset('img/research/strain.png'),
  seeds: asset('img/research/seeds.png'),
  offline: asset('img/research/offline.png'),
} as const;

export const eventIcons = {
  golden_bud: asset('img/events/golden-bud.png'),
  seed_pack: asset('img/events/seed-pack.png'),
  lucky_joint: asset('img/events/lucky-joint.png'),
  fertile_rain: asset('img/events/fertile-rain.png'),
  market_rush: asset('img/events/market-rush.png'),
  green_surge: asset('img/events/green-surge.png'),
  mutant_sprout: asset('img/events/mutant-sprout.png'),
  supply_drop: asset('img/events/supply-drop.png'),
  flash_harvest: asset('img/events/flash-harvest.png'),
  calm_growth: asset('img/events/calm-growth.png'),
  overgrowth: asset('img/events/overgrowth.png'),
  seed_bloom: asset('img/events/seed-bloom.png'),
  tiny_spark: asset('img/events/tiny-spark.png'),
  dew_drop: asset('img/events/dew-drop.png'),
  compost_cache: asset('img/events/compost-cache.png'),
  sunbeam: asset('img/events/sunbeam.png'),
  mega_bud: asset('img/events/mega-bud.png'),
  jackpot_canopy: asset('img/events/jackpot-canopy.png'),
  aurora_bloom: asset('img/events/aurora-bloom.png'),
  trail_marker: asset('img/events/trail-marker.png'),
  cascade_bloom: asset('img/events/cascade-bloom.png'),
  echo_harvest: asset('img/events/echo-harvest.png'),
  volatile_growth: asset('img/events/volatile-growth.png'),
  blackout_sale: asset('img/events/blackout-sale.png'),
  pest_scare: asset('img/events/pest-scare.png'),
  solstice_seed: asset('img/events/solstice-seed.png'),
  night_market: asset('img/events/night-market.png'),
  festival_lantern: asset('img/events/festival-lantern.png'),
} as const;

export const abilityIcons = {
  overdrive: asset('img/abilities/overdrive.png'),
  burst: asset('img/abilities/burst.png'),
  auto_burst: asset('img/abilities/auto-burst.png'),
  discount_window: asset('img/abilities/discount-window.png'),
  event_magnet: asset('img/abilities/event-magnet.png'),
  seed_focus: asset('img/abilities/seed-focus.png'),
  harvest_chain: asset('img/abilities/harvest-chain.png'),
  cooldown_sync: asset('img/abilities/cooldown-sync.png'),
} as const;

export const uiIcons = {
  export: asset('img/ui/export.png'),
  import: asset('img/ui/import.png'),
  reset: asset('img/ui/reset.png'),
  seeds: asset('img/ui/seeds.png'),
  prestige: asset('img/ui/prestige.png'),
  research: asset('img/ui/research.png'),
  upgrade: asset('img/ui/upgrade.png'),
  shop: asset('img/ui/shop.png'),
  soundOn: asset('img/ui/sound-on.png'),
  soundOff: asset('img/ui/sound-off.png'),
  auto: asset('img/ui/auto.png'),
  warning: asset('img/ui/warning.png'),
  leaf: asset('img/ui/leaf.png'),
  bps: asset('img/ui/bps.png'),
  bpc: asset('img/ui/bpc.png'),
  total: asset('img/ui/total.png'),
  achievements: asset('img/ui/achievements.png'),
  greenhouse: asset('img/ui/greenhouse.png'),
  settings: asset('img/ui/settings.png'),
  achievementBase: asset('img/ui/achievement-base.svg'),
  achievementRibbon: asset('img/ui/achievement-ribbon.svg'),
  achievementLeaf: asset('img/ui/achievement-leaf.svg'),
  achievementLight: asset('img/ui/achievement-light.svg'),
} as const;

export const sidePanelTabIcons = {
  shop: asset('img/ui/tab-shop.png'),
  upgrades: asset('img/ui/tab-upgrades.png'),
  research: asset('img/ui/tab-research.png'),
  greenhouse: asset('img/ui/tab-greenhouse.png'),
  prestige: asset('img/ui/tab-prestige.png'),
  achievements: asset('img/ui/tab-achievements.png'),
} as const;

export const clickerFxAssets = {
  orbitBud: asset('img/ui/orbit-bud.png'),
} as const;

export const plantStages = [
  asset('img/plant/stage-01.png'),
  asset('img/plant/stage-02.png'),
  asset('img/plant/stage-03.png'),
  asset('img/plant/stage-04.png'),
  asset('img/plant/stage-05.png'),
  asset('img/plant/stage-06.png'),
  asset('img/plant/stage-07.png'),
  asset('img/plant/stage-08.png'),
  asset('img/plant/stage-09.png'),
  asset('img/plant/stage-10.png'),
  asset('img/plant/stage-11.png'),
] as const;

export const backgroundAssets = {
  keyArt: asset('img/backgrounds/signature-key-art.png'),
  desktop: asset('img/backgrounds/desktop.svg'),
  mobile: asset('img/backgrounds/mobile.svg'),
  plants: asset('img/backgrounds/plants.svg'),
  noise: asset('img/backgrounds/noise.svg'),
} as const;
