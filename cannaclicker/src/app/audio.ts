import { Howl, Howler } from 'howler';
import { persistAudioPreference } from './save';

export interface AudioManager {
  playClick(): void;
  playPurchase(): void;
  toggleMute(): boolean;
  setMuted(muted: boolean): void;
  isMuted(): boolean;
}

export function createAudioManager(initialMuted: boolean): AudioManager {
  let muted = initialMuted;
  Howler.mute(muted);

  const click = new Howl({
    src: ['/sounds/click.wav'],
    volume: 0.45,
  });

  const purchase = new Howl({
    src: ['/sounds/purchase.wav'],
    volume: 0.5,
  });

  const manager: AudioManager = {
    playClick() {
      if (!muted) {
        click.play();
      }
    },
    playPurchase() {
      if (!muted) {
        purchase.play();
      }
    },
    toggleMute() {
      muted = !muted;
      Howler.mute(muted);
      persistAudioPreference(muted);
      return muted;
    },
    setMuted(next: boolean) {
      muted = next;
      Howler.mute(muted);
      persistAudioPreference(muted);
    },
    isMuted() {
      return muted;
    },
  };

  return manager;
}