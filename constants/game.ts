import { ViroMaterials } from '@reactvision/react-viro';

/* ── AR Materials ── */
ViroMaterials.createMaterials({
  balloonRed:    { diffuseColor: '#ef4444', lightingModel: 'Blinn' },
  balloonBlue:   { diffuseColor: '#3b82f6', lightingModel: 'Blinn' },
  balloonGreen:  { diffuseColor: '#22c55e', lightingModel: 'Blinn' },
  balloonYellow: { diffuseColor: '#eab308', lightingModel: 'Blinn' },
  balloonPink:   { diffuseColor: '#ec4899', lightingModel: 'Blinn' },
  balloonPurple: { diffuseColor: '#a855f7', lightingModel: 'Blinn' },
  balloonClose:  { diffuseColor: '#fbbf24', lightingModel: 'Blinn' },
  balloonCatch:  { diffuseColor: '#ffffff', lightingModel: 'Blinn' },
});

export const BALLOON_COLORS = [
  'balloonRed',
  'balloonBlue',
  'balloonGreen',
  'balloonYellow',
  'balloonPink',
  'balloonPurple',
] as const;

/* ── Dimensions ── */
export const BALLOON_RADIUS = 0.065;       // 6.5 cm
export const SPAWN_RADIUS_MIN = 0.45;
export const SPAWN_RADIUS_MAX = 1.1;
export const SPAWN_HEIGHT_MIN = -0.3;
export const SPAWN_HEIGHT_MAX = 0.35;
export const MIN_BALLOON_SPACING = 0.25;

/* ── Thresholds ── */
export const CATCH_THRESHOLD = 0.08;       // 8 cm → caught (requires touching the 6.5cm balloon)
export const CLOSE_THRESHOLD = 0.55;       // 55 cm → beeping starts

/* ── Timing ── */
export const MAX_BALLOONS = 5;
export const MIN_BEEP_INTERVAL = 80;       // ms (fastest beep rate)
export const MAX_BEEP_INTERVAL = 600;      // ms (slowest beep rate)
export const RESPAWN_DELAY = 600;          // ms before a new balloon spawns

/* ── Global keys (HandTrackingScene ↔ ar.tsx overlay) ── */
export const SCORE_KEY = '__arGameScore';
export const CAUGHT_KEY = '__arGameCaught';
