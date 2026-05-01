import { ViroMaterials } from '@reactvision/react-viro';

import type { TechniqueId, TechniqueMeta } from '@/types/experiment';
import type { Vec3 } from '@/types/game';

ViroMaterials.createMaterials({
  targetIdle: { diffuseColor: '#60a5fa', lightingModel: 'Blinn' },
  targetFocus: { diffuseColor: '#f59e0b', lightingModel: 'Blinn' },
  targetReady: { diffuseColor: '#fef08a', lightingModel: 'Blinn' },
});

export const TARGET_RADIUS = 0.065;
export const TOTAL_TRIALS = 10;
export const TRIAL_TIMEOUT_MS = 10000;
export const INITIALIZATION_MIN_FRAMES = 8;
export const INITIALIZATION_MIN_MOVEMENT_M = 0.04;

export const BASELINE_ALIGNMENT_THRESHOLD_RAD = 0.1;
export const ASSIST_ALIGNMENT_THRESHOLD_RAD = 0.16;
export const ASSIST_DISTANCE_THRESHOLD_M = 0.95;
export const DWELL_SELECTION_MS = 650;
export const VISUAL_UPDATE_INTERVAL_MS = 50;
export const TARGET_RESPAWN_DELAY_MS = 500;

export const TRIAL_TARGET_OFFSETS: Vec3[] = [
  [-0.24, 0.12, 0.95],
  [0.2, -0.02, 0.86],
  [0, 0.04, 0.8],
  [-0.14, -0.18, 0.78],
  [0.28, 0.16, 1.02],
  [0.08, -0.12, 0.9],
  [-0.28, 0.04, 0.84],
  [0.18, 0.22, 0.94],
  [-0.06, 0.18, 0.76],
  [0.3, -0.16, 1.04],
];

export const TECHNIQUES: Record<TechniqueId, TechniqueMeta> = {
  baseline: {
    id: 'baseline',
    title: 'Standard Pointing',
    shortLabel: 'Baseline',
    summary: 'Point with the center reticle and tap the confirm button to select the target.',
    instructions: [
      'Keep the balloon inside the center reticle.',
      'Tap Confirm only when the reticle is aligned.',
      'Missed taps are logged as errors.',
    ],
  },
  assisted: {
    id: 'assisted',
    title: 'Proximity-Assisted Pointing',
    shortLabel: 'Assisted',
    summary:
      'Point with the same reticle, but the system adds feedback and auto-selects after a short stable dwell.',
    instructions: [
      'Aim with the center reticle as in the baseline condition.',
      'Move slightly closer if needed and keep the reticle steady.',
      'When alignment is stable, the target is selected automatically.',
    ],
  },
  invisible: {
    id: 'invisible',
    title: 'Invisible Target (Proximity)',
    shortLabel: 'Invisible',
    summary:
      'Same as assisted, but the target is invisible. Rely on audio feedback to align and select.',
    instructions: [
      'Aim with the center reticle.',
      'Listen for the audio feedback to guide alignment.',
      'Move slightly closer if needed and hold steady.',
      'The target is selected automatically when aligned.',
    ],
  },
};
