import type { Vec3 } from '@/types/game';

export type TechniqueId = 'baseline' | 'assisted';

export type TrialPhase = 'initializing' | 'running' | 'complete';

export interface TechniqueMeta {
  id: TechniqueId;
  title: string;
  shortLabel: string;
  summary: string;
  instructions: string[];
}

export interface TrialMetrics {
  distanceM: number;
  angularErrorRad: number;
  alignmentScore: number;
  baselineAligned: boolean;
  assistedAligned: boolean;
  assistReady: boolean;
}

export interface TrialResult {
  technique: TechniqueId;
  trialNumber: number;
  targetPosition: Vec3;
  outcome: 'success' | 'timeout';
  completionTimeMs: number;
  misses: number;
  selectedWith: 'tap' | 'dwell' | null;
  distanceAtSelectionM: number | null;
  angularErrorDeg: number | null;
}

export interface BlockResult {
  technique: TechniqueId;
  completedTrials: number;
  totalTrials: number;
  successCount: number;
  failureCount: number;
  totalTimeMs: number;
  averageSuccessTimeMs: number;
  averageTrialTimeMs: number;
  totalMisses: number;
  trials: TrialResult[];
  completedAtIso: string;
}

export interface OverlayState {
  technique: TechniqueMeta;
  phase: TrialPhase;
  currentTrial: number;
  totalTrials: number;
  statusText: string;
  misses: number;
  alignmentScore: number;
  isAligned: boolean;
  targetDistanceM: number | null;
  timeRemainingMs: number;
  timeProgress: number;
  confirmMode: 'tap' | 'dwell';
  dwellProgress: number;
}
