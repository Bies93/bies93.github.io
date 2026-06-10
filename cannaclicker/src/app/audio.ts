import { persistAudioPreference } from './save';
import musicMp3Url from '../biesyclicker_psy_dub_reggae_loop_92bpm.mp3?url';
import musicOpusUrl from '../biesyclicker_psy_dub_reggae_loop_92bpm.opus?url';

type OscillatorKind = 'sine' | 'square' | 'sawtooth' | 'triangle';
type EventSoundKind = 'reward' | 'seed' | 'buff' | 'rare';
type AchievementSoundKind = 'common' | 'rare' | 'epic' | 'legendary';

interface Tone {
  at?: number;
  frequency: number;
  endFrequency?: number;
  duration: number;
  volume: number;
  type?: OscillatorKind;
}

export interface AudioManager {
  playClick(options?: { boosted?: boolean }): void;
  playPurchase(options?: { milestone?: boolean }): void;
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
  toggleMute(): boolean;
  setMuted(muted: boolean): void;
  setVolume(volume: number): void;
  setMusicEnabled(enabled: boolean): void;
  setMusicVolume(volume: number): void;
  isMuted(): boolean;
}

const MASTER_GAIN = 0.16;
const MUSIC_GAIN = 0.42;
const CLICK_RATE_LIMIT_MS = 34;
const MUSIC_SOURCES = [
  { url: musicOpusUrl, type: 'audio/ogg; codecs=opus' },
  { url: musicMp3Url, type: 'audio/mpeg' },
] as const;

export function createAudioManager(
  initialMuted: boolean,
  initialVolume = 0.8,
  musicOptions: { musicEnabled?: boolean; musicVolume?: number } = {},
): AudioManager {
  let muted = initialMuted;
  let sfxVolume = Math.max(0, Math.min(1, initialVolume));
  let musicEnabled = musicOptions.musicEnabled ?? true;
  let musicVolume = Math.max(0, Math.min(1, musicOptions.musicVolume ?? 0.45));
  let context: AudioContext | null = null;
  let music: HTMLAudioElement | null = null;
  let lastClickAt = 0;

  function selectMusicSource(): string {
    if (typeof document === 'undefined') {
      return musicMp3Url;
    }

    const probe = document.createElement('audio');
    const supported = MUSIC_SOURCES.find((source) => probe.canPlayType(source.type) !== '');
    return supported?.url ?? musicMp3Url;
  }

  function getMusicElement(): HTMLAudioElement | null {
    if (typeof Audio === 'undefined') {
      return null;
    }

    if (!music) {
      music = new Audio(selectMusicSource());
      music.loop = true;
      music.preload = 'none';
      music.volume = Math.max(0, Math.min(1, musicVolume * MUSIC_GAIN));
    }

    return music;
  }

  function syncMusic(): void {
    if (muted || !musicEnabled || musicVolume <= 0) {
      music?.pause();
      return;
    }

    const player = getMusicElement();
    if (!player) {
      return;
    }

    player.volume = Math.max(0, Math.min(1, musicVolume * MUSIC_GAIN));
    if (player.paused) {
      void player.play().catch(() => {
        // Browsers require a user gesture before background music may start.
      });
    }
  }

  function getContext(): AudioContext | null {
    if (muted || typeof window === 'undefined') {
      return null;
    }

    const AudioContextCtor = window.AudioContext ?? window.webkitAudioContext;
    if (!AudioContextCtor) {
      return null;
    }

    context ??= new AudioContextCtor();
    if (context.state === 'suspended') {
      void context.resume();
    }
    return context;
  }

  function play(tones: readonly Tone[]): void {
    syncMusic();
    const ctx = getContext();
    if (!ctx) {
      return;
    }

    const start = ctx.currentTime;
    for (const tone of tones) {
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      const at = start + (tone.at ?? 0);
      const duration = Math.max(0.02, tone.duration);
      const endAt = at + duration;
      const volume = Math.max(0, Math.min(1, tone.volume)) * MASTER_GAIN * sfxVolume;

      oscillator.type = tone.type ?? 'sine';
      oscillator.frequency.setValueAtTime(tone.frequency, at);
      if (tone.endFrequency) {
        oscillator.frequency.exponentialRampToValueAtTime(Math.max(1, tone.endFrequency), endAt);
      }

      gain.gain.setValueAtTime(0.0001, at);
      gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, volume), at + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, endAt);

      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.start(at);
      oscillator.stop(endAt + 0.02);
    }
  }

  return {
    playClick(options) {
      const now = performance.now();
      if (now - lastClickAt < CLICK_RATE_LIMIT_MS) {
        return;
      }
      lastClickAt = now;
      play(
        options?.boosted
          ? [
              { frequency: 620, endFrequency: 920, duration: 0.05, volume: 0.5, type: 'triangle' },
              { at: 0.035, frequency: 980, duration: 0.035, volume: 0.25, type: 'sine' },
            ]
          : [
              {
                frequency: 460,
                endFrequency: 680,
                duration: 0.045,
                volume: 0.34,
                type: 'triangle',
              },
            ],
      );
    },
    playPurchase(options) {
      play(
        options?.milestone
          ? [
              { frequency: 320, endFrequency: 640, duration: 0.07, volume: 0.48, type: 'triangle' },
              { at: 0.055, frequency: 760, duration: 0.08, volume: 0.34, type: 'sine' },
              { at: 0.11, frequency: 1080, duration: 0.09, volume: 0.22, type: 'sine' },
            ]
          : [
              {
                frequency: 360,
                endFrequency: 540,
                duration: 0.055,
                volume: 0.36,
                type: 'triangle',
              },
              { at: 0.045, frequency: 690, duration: 0.06, volume: 0.24, type: 'sine' },
            ],
      );
    },
    playCannotBuy() {
      play([
        { frequency: 180, endFrequency: 140, duration: 0.055, volume: 0.18, type: 'triangle' },
        {
          at: 0.055,
          frequency: 150,
          endFrequency: 120,
          duration: 0.055,
          volume: 0.12,
          type: 'triangle',
        },
      ]);
    },
    playUnlock() {
      play([
        { frequency: 520, endFrequency: 780, duration: 0.08, volume: 0.34, type: 'sine' },
        { at: 0.07, frequency: 1040, duration: 0.1, volume: 0.22, type: 'triangle' },
      ]);
    },
    playEventSpawn(kind = 'reward') {
      const base = kind === 'rare' ? 760 : kind === 'seed' ? 560 : kind === 'buff' ? 480 : 620;
      play([
        { frequency: base, endFrequency: base * 1.45, duration: 0.075, volume: 0.24, type: 'sine' },
      ]);
    },
    playEventCollect(kind = 'reward') {
      if (kind === 'seed') {
        play([
          { frequency: 650, duration: 0.06, volume: 0.32, type: 'triangle' },
          { at: 0.05, frequency: 980, duration: 0.08, volume: 0.24, type: 'sine' },
        ]);
        return;
      }
      if (kind === 'buff' || kind === 'rare') {
        play([
          { frequency: 430, endFrequency: 860, duration: 0.1, volume: 0.35, type: 'triangle' },
          { at: 0.08, frequency: 1290, duration: 0.11, volume: 0.22, type: 'sine' },
        ]);
        return;
      }
      play([{ frequency: 540, endFrequency: 820, duration: 0.08, volume: 0.3, type: 'triangle' }]);
    },
    playBuffActivate() {
      play([
        { frequency: 240, endFrequency: 520, duration: 0.12, volume: 0.28, type: 'sawtooth' },
        { at: 0.1, frequency: 780, duration: 0.08, volume: 0.16, type: 'sine' },
      ]);
    },
    playBuffExpire() {
      play([{ frequency: 360, endFrequency: 210, duration: 0.12, volume: 0.12, type: 'triangle' }]);
    },
    playAchievement(kind = 'common') {
      const lift = kind === 'legendary' ? 1.5 : kind === 'epic' ? 1.32 : kind === 'rare' ? 1.16 : 1;
      play([
        { frequency: 520 * lift, duration: 0.08, volume: 0.24, type: 'sine' },
        { at: 0.07, frequency: 720 * lift, duration: 0.08, volume: 0.22, type: 'sine' },
        { at: 0.14, frequency: 960 * lift, duration: 0.12, volume: 0.18, type: 'triangle' },
      ]);
    },
    playPrestige() {
      play([
        { frequency: 220, endFrequency: 440, duration: 0.16, volume: 0.36, type: 'sine' },
        { at: 0.12, frequency: 660, duration: 0.14, volume: 0.28, type: 'triangle' },
        { at: 0.24, frequency: 990, duration: 0.18, volume: 0.22, type: 'sine' },
      ]);
    },
    playUi() {
      play([
        { frequency: 420, endFrequency: 510, duration: 0.035, volume: 0.14, type: 'triangle' },
      ]);
    },
    playSettings() {
      play([
        { frequency: 520, endFrequency: 390, duration: 0.045, volume: 0.14, type: 'triangle' },
      ]);
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
      sfxVolume = Math.max(0, Math.min(1, next));
    },
    setMusicEnabled(next) {
      musicEnabled = next;
      syncMusic();
    },
    setMusicVolume(next) {
      musicVolume = Math.max(0, Math.min(1, next));
      syncMusic();
    },
    isMuted() {
      return muted;
    },
  };
}

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}
