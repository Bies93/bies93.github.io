import { audioMusicAssets, audioSfxAssets } from './assetManifest';
import { persistAudioPreference } from './save';
import type { GameState } from './state';

type EventSoundKind = 'reward' | 'seed' | 'buff' | 'rare';
type AchievementSoundKind = 'common' | 'rare' | 'epic' | 'legendary';
type SfxKey = keyof typeof audioSfxAssets;
type MusicLayerKey = keyof typeof audioMusicAssets;

export type MusicPhase = 'early' | 'growth' | 'event' | 'prestige';

export interface AudioManager {
  playClick(options?: { boosted?: boolean }): void;
  playPurchase(options?: { milestone?: boolean; newItem?: boolean; important?: boolean }): void;
  playCannotBuy(): void;
  playUnlock(): void;
  playEventSpawn(kind?: EventSoundKind): void;
  playEventCollect(kind?: EventSoundKind): void;
  playBuffActivate(): void;
  playBuffExpire(): void;
  playAchievement(kind?: AchievementSoundKind): void;
  playPrestige(): void;
  playUi(): void;
  playSettings(): void;
  setMusicPhase(phase: MusicPhase): void;
  toggleMute(): boolean;
  setMuted(muted: boolean): void;
  setVolume(volume: number): void;
  setMusicEnabled(enabled: boolean): void;
  setMusicVolume(volume: number): void;
  isMuted(): boolean;
}

const CLICK_RATE_LIMIT_MS = 34;
const SFX_POOL_SIZE = 3;
const SFX_GAIN = 0.38;
const MUSIC_GAIN = 0.28;
const MUSIC_LAYER_KEYS = Object.keys(audioMusicAssets) as MusicLayerKey[];

const MUSIC_PROFILES: Record<MusicPhase, Record<MusicLayerKey, number>> = {
  early: {
    earlyDub: 0.82,
    mainDrive: 0,
    eventDrive: 0,
    prestigeWarm: 0,
  },
  growth: {
    earlyDub: 0,
    mainDrive: 0.88,
    eventDrive: 0,
    prestigeWarm: 0,
  },
  event: {
    earlyDub: 0,
    mainDrive: 0,
    eventDrive: 0.82,
    prestigeWarm: 0,
  },
  prestige: {
    earlyDub: 0,
    mainDrive: 0,
    eventDrive: 0,
    prestigeWarm: 0.78,
  },
};

interface AudioPool {
  cursor: number;
  slots: (HTMLAudioElement | null)[];
}

interface MusicLayer {
  audio: HTMLAudioElement;
}

interface MusicSourceAsset {
  mp3: string;
  ogg?: string;
}

export function resolveMusicPhase(state: GameState): MusicPhase {
  if (
    state.events.active.length > 0 ||
    state.temp.eventBoosts.length > 0 ||
    state.temp.hybridActiveBuffs > 0
  ) {
    return 'event';
  }

  if (
    state.meta.prestigeCount > 0 ||
    state.prestige.ascensionSeeds > 0 ||
    state.prestige.totalAscensionSeeds > 0 ||
    state.prestige.lifetimeBuds.greaterThanOrEqualTo(1_000_000)
  ) {
    return 'prestige';
  }

  if (
    state.meta.totalItemsPurchased >= 3 ||
    state.bps.greaterThan(0) ||
    state.total.greaterThanOrEqualTo(120)
  ) {
    return 'growth';
  }

  return 'early';
}

export function createAudioManager(
  initialMuted: boolean,
  initialVolume = 0.6,
  musicOptions: { musicEnabled?: boolean; musicVolume?: number } = {},
): AudioManager {
  let muted = initialMuted;
  let sfxVolume = clamp01(initialVolume);
  let musicEnabled = musicOptions.musicEnabled ?? true;
  let musicVolume = clamp01(musicOptions.musicVolume ?? 0.35);
  let musicPhase: MusicPhase = 'early';
  let lastClickAt = 0;

  const sfxPools = new Map<string, AudioPool>();
  const musicLayers = new Map<MusicLayerKey, MusicLayer>();

  function canUseAudio(): boolean {
    return typeof Audio !== 'undefined';
  }

  function pickUrl(urls: readonly string[]): string | null {
    if (urls.length === 0) {
      return null;
    }
    return urls[Math.floor(Math.random() * urls.length)] ?? urls[0] ?? null;
  }

  function getAudioPool(url: string): AudioPool | null {
    if (!canUseAudio()) {
      return null;
    }

    let pool = sfxPools.get(url);
    if (!pool) {
      pool = {
        cursor: 0,
        slots: Array.from({ length: SFX_POOL_SIZE }, () => null),
      };
      sfxPools.set(url, pool);
    }
    return pool;
  }

  function createSfxElement(url: string): HTMLAudioElement {
    const audio = new Audio(url);
    audio.preload = 'auto';
    return audio;
  }

  function playSample(
    key: SfxKey,
    options: { gain?: number; rateMin?: number; rateMax?: number } = {},
  ): void {
    syncMusic();
    if (muted || sfxVolume <= 0) {
      return;
    }

    const url = pickUrl(audioSfxAssets[key]);
    if (!url) {
      return;
    }

    const pool = getAudioPool(url);
    if (!pool || pool.slots.length === 0) {
      return;
    }

    const slotIndex = pool.cursor % pool.slots.length;
    const player = pool.slots[slotIndex] ?? createSfxElement(url);
    pool.slots[slotIndex] = player;
    pool.cursor += 1;

    try {
      player.pause();
      player.currentTime = 0;
      player.volume = clamp01(SFX_GAIN * sfxVolume * (options.gain ?? 1));
      player.playbackRate = randomBetween(options.rateMin ?? 1, options.rateMax ?? 1);
      void player.play().catch(() => {
        // Autoplay policies may still block sounds before the first trusted interaction.
      });
    } catch {
      // A failed one-shot sound should never interrupt gameplay.
    }
  }

  function selectMusicSource(sources: MusicSourceAsset): string {
    if (typeof document === 'undefined' || !sources.ogg) {
      return sources.mp3;
    }

    const probe = document.createElement('audio');
    if (probe.canPlayType('audio/ogg; codecs=opus') || probe.canPlayType('audio/ogg')) {
      return sources.ogg;
    }
    return sources.mp3;
  }

  function getMusicLayer(key: MusicLayerKey): MusicLayer | null {
    if (!canUseAudio()) {
      return null;
    }

    let layer = musicLayers.get(key);
    if (!layer) {
      const source = selectMusicSource(audioMusicAssets[key]);
      const audio = new Audio(source);
      audio.loop = true;
      audio.preload = 'none';
      audio.volume = 0;
      layer = { audio };
      musicLayers.set(key, layer);
    }
    return layer;
  }

  function pauseMusic(): void {
    for (const layer of musicLayers.values()) {
      layer.audio.pause();
    }
  }

  function alignLayer(player: HTMLAudioElement): void {
    const base = Array.from(musicLayers.values()).find(
      (layer) => layer.audio !== player && !layer.audio.paused,
    )?.audio;
    if (!base || base === player || base.paused) {
      return;
    }

    if (
      Number.isFinite(base.currentTime) &&
      Number.isFinite(player.duration) &&
      player.duration > 0
    ) {
      try {
        player.currentTime = base.currentTime % player.duration;
      } catch {
        // Duration can be unknown while the layer is still loading.
      }
    }
  }

  function syncMusic(): void {
    if (muted || !musicEnabled || musicVolume <= 0) {
      pauseMusic();
      return;
    }

    const profile = MUSIC_PROFILES[musicPhase];
    for (const key of MUSIC_LAYER_KEYS) {
      const targetGain = profile[key] ?? 0;
      if (targetGain <= 0) {
        musicLayers.get(key)?.audio.pause();
        continue;
      }

      const layer = getMusicLayer(key);
      if (!layer) {
        continue;
      }

      layer.audio.volume = clamp01(musicVolume * MUSIC_GAIN * targetGain);
      if (layer.audio.paused) {
        alignLayer(layer.audio);
        void layer.audio.play().catch(() => {
          // Browsers require a user gesture before background music may start.
        });
      }
    }
  }

  return {
    playClick(options) {
      const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
      if (now - lastClickAt < CLICK_RATE_LIMIT_MS) {
        return;
      }
      lastClickAt = now;
      playSample('click', {
        gain: options?.boosted ? 0.56 : 0.42,
        rateMin: options?.boosted ? 0.99 : 0.96,
        rateMax: options?.boosted ? 1.06 : 1.04,
      });
    },
    playPurchase(options) {
      if (options?.milestone) {
        playSample('buyMilestone', { gain: 0.96, rateMin: 0.98, rateMax: 1.02 });
        return;
      }
      if (options?.newItem) {
        playSample('buyNewItem', { gain: 0.9, rateMin: 0.98, rateMax: 1.02 });
        return;
      }
      if (options?.important) {
        playSample('buyImportant', { gain: 0.86, rateMin: 0.98, rateMax: 1.02 });
        return;
      }
      playSample('buyNormal', { gain: 0.72, rateMin: 0.97, rateMax: 1.03 });
    },
    playCannotBuy() {
      playSample('uiDeny', { gain: 0.36, rateMin: 0.98, rateMax: 1.01 });
    },
    playUnlock() {
      playSample('buyNewItem', { gain: 0.82, rateMin: 0.98, rateMax: 1.02 });
    },
    playEventSpawn(kind = 'reward') {
      playSample(kind === 'rare' ? 'rareReward' : 'eventSpawn', {
        gain: kind === 'rare' ? 0.72 : 0.56,
        rateMin: kind === 'seed' ? 1.01 : 0.98,
        rateMax: kind === 'seed' ? 1.05 : 1.02,
      });
    },
    playEventCollect(kind = 'reward') {
      playSample(kind === 'rare' ? 'rareReward' : 'eventCollect', {
        gain: kind === 'rare' ? 0.96 : kind === 'seed' ? 0.82 : 0.74,
        rateMin: kind === 'buff' ? 0.96 : 0.98,
        rateMax: kind === 'buff' ? 1.01 : 1.04,
      });
    },
    playBuffActivate() {
      playSample('eventSpawn', { gain: 0.7, rateMin: 0.97, rateMax: 1.02 });
    },
    playBuffExpire() {
      playSample('uiToggle', { gain: 0.24, rateMin: 0.96, rateMax: 0.99 });
    },
    playAchievement(kind = 'common') {
      if (kind === 'common') {
        playSample('buyMilestone', { gain: 0.72, rateMin: 0.98, rateMax: 1.02 });
        return;
      }
      playSample('rareReward', {
        gain: kind === 'legendary' ? 1 : kind === 'epic' ? 0.94 : 0.86,
        rateMin: 0.98,
        rateMax: 1.03,
      });
    },
    playPrestige() {
      playSample('prestige', { gain: 1, rateMin: 0.99, rateMax: 1.01 });
    },
    playUi() {
      playSample('uiToggle', { gain: 0.32, rateMin: 0.98, rateMax: 1.02 });
    },
    playSettings() {
      playSample('uiToggle', { gain: 0.34, rateMin: 0.98, rateMax: 1.02 });
    },
    setMusicPhase(next) {
      if (musicPhase === next) {
        return;
      }
      musicPhase = next;
      syncMusic();
    },
    toggleMute() {
      muted = !muted;
      persistAudioPreference(muted);
      syncMusic();
      return muted;
    },
    setMuted(next) {
      muted = next;
      persistAudioPreference(muted);
      syncMusic();
    },
    setVolume(next) {
      sfxVolume = clamp01(next);
    },
    setMusicEnabled(next) {
      musicEnabled = next;
      syncMusic();
    },
    setMusicVolume(next) {
      musicVolume = clamp01(next);
      syncMusic();
    },
    isMuted() {
      return muted;
    },
  };
}

function randomBetween(min: number, max: number): number {
  if (!Number.isFinite(min) || !Number.isFinite(max) || min >= max) {
    return Number.isFinite(min) ? min : 1;
  }
  return min + Math.random() * (max - min);
}

function clamp01(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.max(0, Math.min(1, value));
}
