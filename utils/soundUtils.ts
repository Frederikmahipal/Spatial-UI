import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';

/* ──────────────────────────────────────────────
 *  Sound pool – pre-loads a small set of
 *  Audio.Sound objects so playBeep() is fast
 *  enough for a 60-fps game loop.
 * ────────────────────────────────────────────── */

const POOL_SIZE = 4;

let beepPool: Audio.Sound[] = [];
let popSound: Audio.Sound | null = null;
let poolIndex = 0;
let ready = false;
let initPromise: Promise<void> | null = null;

export function isSoundsReady(): boolean {
  return ready;
}

/** Call once at scene mount to warm up the audio pool. */
export async function initSounds(): Promise<void> {
  if (ready) return;
  if (initPromise) return initPromise;

  initPromise = initSoundsInternal();
  await initPromise;
}

async function initSoundsInternal(): Promise<void> {
  try {
    console.warn('[sound] starting init');
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
    });
    console.warn('[sound] audio mode set');

    const beepUrl = wavToDataUrl(generateSineWav(880, 0.1));
    const popUrl = wavToDataUrl(generatePopWav());
    console.warn('[sound] wav generated, loading pool...');

    const [beepResults, { sound: pop }] = await Promise.all([
      Promise.all(
        Array.from({ length: POOL_SIZE }, () =>
          Audio.Sound.createAsync({ uri: beepUrl }, { shouldPlay: false, volume: 0.3 }),
        ),
      ),
      Audio.Sound.createAsync({ uri: popUrl }, { shouldPlay: false, volume: 0.55 }),
    ]);
    beepPool = beepResults.map(({ sound }) => sound);
    popSound = pop;

    ready = true;
    console.warn('[sound] ready — pool size:', beepPool.length);
  } catch (e) {
    console.warn('[sound] init FAILED:', e);
  } finally {
    initPromise = null;
  }
}

/** Call on unmount to release native resources. */
export async function cleanupSounds(): Promise<void> {
  for (const s of beepPool) {
    try { await s.unloadAsync(); } catch (_) { /* */ }
  }
  if (popSound) {
    try { await popSound.unloadAsync(); } catch (_) { /* */ }
  }
  beepPool = [];
  popSound = null;
  poolIndex = 0;
  ready = false;
  initPromise = null;
}

/**
 * Play a proximity beep.
 * @param frequency  Target pitch (varies playback rate around 880 Hz base).
 * @param _duration  Unused – kept for API compat.
 * @param volume     0 – 1.
 */
export async function playBeep(
  frequency = 880,
  _duration = 0.1,
  volume = 0.3,
): Promise<void> {
  if (!ready || beepPool.length === 0) {
    console.warn('[sound] playBeep skipped — ready:', ready, 'pool:', beepPool.length);
    return;
  }
  try {
    const sound = beepPool[poolIndex];
    poolIndex = (poolIndex + 1) % beepPool.length;

    const rate = Math.max(0.5, Math.min(2.0, frequency / 880));
    await sound.setStatusAsync({
      positionMillis: 0,
      rate,
      shouldCorrectPitch: false,
      volume,
      shouldPlay: true,
    });
  } catch (e) { console.warn('[sound] playBeep error:', e); }
}

/** Satisfying "pop" for catching a balloon. */
export async function playPop(): Promise<void> {
  if (!popSound) return;
  try {
    await popSound.setStatusAsync({
      positionMillis: 0,
      volume: 0.6,
      shouldPlay: true,
    });
  } catch (_) { /* */ }
}

/* ───────────── Haptics ───────────── */

export async function playHapticFeedback(
  intensity: 'light' | 'medium' | 'heavy' = 'medium',
): Promise<void> {
  try {
    const map = {
      light: Haptics.ImpactFeedbackStyle.Light,
      medium: Haptics.ImpactFeedbackStyle.Medium,
      heavy: Haptics.ImpactFeedbackStyle.Heavy,
    };
    await Haptics.impactAsync(map[intensity]);
  } catch (e) { 
    console.warn('[Haptics error]', e);
  }
}

/* ═══════════════════════════════════════════════
 *  WAV generation helpers
 * ═══════════════════════════════════════════════ */

function generateSineWav(frequency: number, duration: number): Float32Array {
  const sr = 44100;
  const n = Math.floor(sr * duration);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / sr;
    const env = Math.sin((Math.PI * t) / duration);
    out[i] = Math.sin(2 * Math.PI * frequency * t) * env;
  }
  return out;
}

function generatePopWav(): Float32Array {
  const sr = 44100;
  const dur = 0.14;
  const n = Math.floor(sr * dur);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / sr;
    const env = Math.exp(-t * 35);
    const freq = 1400 - t * 4000; // descending sweep
    const sine = Math.sin(2 * Math.PI * freq * t);
    const noise = Math.random() * 2 - 1;
    out[i] = (sine * 0.7 + noise * 0.3) * env;
  }
  return out;
}

function wavToDataUrl(samples: Float32Array): string {
  const buf = encodeWav(samples, 44100);
  return `data:audio/wav;base64,${arrayBufferToBase64(buf)}`;
}

function encodeWav(samples: Float32Array, sampleRate: number): ArrayBuffer {
  const bps = 2;
  const dataSize = samples.length * bps;
  const buf = new ArrayBuffer(44 + dataSize);
  const v = new DataView(buf);

  writeStr(v, 0, 'RIFF');
  v.setUint32(4, 36 + dataSize, true);
  writeStr(v, 8, 'WAVE');
  writeStr(v, 12, 'fmt ');
  v.setUint32(16, 16, true);
  v.setUint16(20, 1, true);
  v.setUint16(22, 1, true);
  v.setUint32(24, sampleRate, true);
  v.setUint32(28, sampleRate * bps, true);
  v.setUint16(32, bps, true);
  v.setUint16(34, 16, true);
  writeStr(v, 36, 'data');
  v.setUint32(40, dataSize, true);

  let off = 44;
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    v.setInt16(off, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    off += 2;
  }
  return buf;
}

function writeStr(v: DataView, off: number, s: string) {
  for (let i = 0; i < s.length; i++) v.setUint8(off + i, s.charCodeAt(i));
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let bin = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    bin += String.fromCharCode(bytes[i]);
  }
  // btoa is available in Hermes ≥ 0.74 (RN 0.81+)
  if (typeof btoa === 'function') return btoa(bin);
  // fallback manual base64
  const c = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let r = '';
  for (let i = 0; i < bin.length; i += 3) {
    const a = bin.charCodeAt(i);
    const b = i + 1 < bin.length ? bin.charCodeAt(i + 1) : 0;
    const d = i + 2 < bin.length ? bin.charCodeAt(i + 2) : 0;
    r += c[a >> 2] + c[((a & 3) << 4) | (b >> 4)];
    r += i + 1 < bin.length ? c[((b & 15) << 2) | (d >> 6)] : '=';
    r += i + 2 < bin.length ? c[d & 63] : '=';
  }
  return r;
}
