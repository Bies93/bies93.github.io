import { Howl, Howler } from 'howler';
import { persistAudioPreference } from './save';

interface AudioManager {
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
    src: [createToneDataUrl(420, 130)],
    volume: 0.45,
  });

  const purchase = new Howl({
    src: [createToneDataUrl(540, 180)],
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

function createToneDataUrl(frequency: number, durationMs: number): string {
  const sampleRate = 44100;
  const sampleCount = Math.floor((durationMs / 1000) * sampleRate);
  const bytesPerSample = 2;
  const blockAlign = bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const buffer = new ArrayBuffer(44 + sampleCount * bytesPerSample);
  const view = new DataView(buffer);

  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + sampleCount * bytesPerSample, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, 'data');
  view.setUint32(40, sampleCount * bytesPerSample, true);

  for (let i = 0; i < sampleCount; i += 1) {
    const t = i / sampleRate;
    const envelope = Math.exp(-4 * t);
    const sample = Math.sin(2 * Math.PI * frequency * t) * envelope * 0.75;
    view.setInt16(44 + i * bytesPerSample, Math.max(-1, Math.min(1, sample)) * 32767, true);
  }

  return `data:audio/wav;base64,${encodeBase64(new Uint8Array(buffer))}`;
}

function writeString(view: DataView, offset: number, text: string): void {
  for (let i = 0; i < text.length; i += 1) {
    view.setUint8(offset + i, text.charCodeAt(i));
  }
}

function encodeBase64(bytes: Uint8Array): string {
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...chunk);
  }
  return btoa(binary);
}