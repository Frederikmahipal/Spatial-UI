import { useCallback, useEffect, useRef, useState } from 'react';
import type { ViroCameraTransform } from '@reactvision/react-viro';

import {
  ASSIST_ALIGNMENT_THRESHOLD_RAD,
  ASSIST_DISTANCE_THRESHOLD_M,
  BASELINE_ALIGNMENT_THRESHOLD_RAD,
  DWELL_SELECTION_MS,
  INITIALIZATION_MIN_FRAMES,
  INITIALIZATION_MIN_MOVEMENT_M,
  TARGET_RADIUS,
  TARGET_RESPAWN_DELAY_MS,
  TOTAL_TRIALS,
  TRIAL_TIMEOUT_MS,
  TRIAL_TARGET_OFFSETS,
  VISUAL_UPDATE_INTERVAL_MS,
} from '@/constants/experiment';
import {
  clearArSession,
  emitBlockComplete,
  emitOverlayState,
  getArTechnique,
  registerConfirmHandler,
} from '@/store/arSession';
import { playBeep, playHapticFeedback, playPop, initSounds, cleanupSounds } from '@/utils/soundUtils';
import {
  add,
  clamp,
  cross,
  dot,
  length,
  normalize,
  radiansToDegrees,
  scale,
  subtract,
} from '@/utils/geometry';
import type { BlockResult, TrialMetrics, TrialPhase, TrialResult } from '@/types/experiment';
import type { Vec3 } from '@/types/game';

type CameraSnapshot = {
  position: Vec3;
  forward: Vec3;
  up: Vec3;
};

type ActiveTarget = {
  trialNumber: number;
  position: Vec3;
};

function isTransformObject(transform: ViroCameraTransform['cameraTransform'] | number[]): transform is ViroCameraTransform['cameraTransform'] {
  return !Array.isArray(transform);
}

function measureTarget(camera: CameraSnapshot, targetPosition: Vec3): TrialMetrics {
  const toTarget = subtract(targetPosition, camera.position);
  const distanceM = length(toTarget);
  const directionToTarget = normalize(toTarget);
  const alignment = clamp(dot(camera.forward, directionToTarget), -1, 1);
  const angularErrorRad = Math.acos(alignment);

  const baselineThreshold = Math.max(BASELINE_ALIGNMENT_THRESHOLD_RAD, Math.asin(Math.min(0.99, TARGET_RADIUS / Math.max(distanceM, TARGET_RADIUS))));
  const assistedThreshold = Math.max(ASSIST_ALIGNMENT_THRESHOLD_RAD, baselineThreshold * 1.5);
  const alignmentScore = 1 - clamp(angularErrorRad / assistedThreshold, 0, 1);

  return {
    distanceM,
    angularErrorRad,
    alignmentScore,
    baselineAligned: angularErrorRad <= baselineThreshold,
    assistedAligned: angularErrorRad <= assistedThreshold,
    assistReady: angularErrorRad <= assistedThreshold && distanceM <= ASSIST_DISTANCE_THRESHOLD_M,
  };
}

function resolveTargetPosition(camera: CameraSnapshot, offset: Vec3): Vec3 {
  const right = normalize(cross(camera.forward, camera.up));
  const vertical = normalize(camera.up);

  return add(
    add(
      add(camera.position, scale(right, offset[0])),
      scale(vertical, offset[1]),
    ),
    scale(camera.forward, offset[2]),
  );
}

export interface TrialBlockState {
  phase: TrialPhase;
  targetPosition: Vec3 | null;
  targetMaterial: string;
  targetScale: Vec3;
  onCameraTransformUpdate: (event: ViroCameraTransform) => void;
}

export default function useTargetSelectionBlock(): TrialBlockState {
  const [phase, setPhase] = useState<TrialPhase>('initializing');
  const [targetPosition, setTargetPosition] = useState<Vec3 | null>(null);
  const [targetMaterial, setTargetMaterial] = useState('targetIdle');
  const [targetScale, setTargetScale] = useState<Vec3>([1, 1, 1]);

  const phaseRef = useRef<TrialPhase>('initializing');
  const blockStartRef = useRef(0);
  const trialStartRef = useRef(0);
  const spawnCameraRef = useRef<CameraSnapshot | null>(null);
  const activeTargetRef = useRef<ActiveTarget | null>(null);
  const latestMetricsRef = useRef<TrialMetrics | null>(null);
  const trialMissesRef = useRef(0);
  const trialResultsRef = useRef<TrialResult[]>([]);
  const dwellStartRef = useRef<number | null>(null);
  const lastVisualUpdateRef = useRef(0);
  const lastBeepTimeRef = useRef(0);
  const initializationStartRef = useRef<Vec3 | null>(null);
  const initializationFramesRef = useRef(0);
  const mountedRef = useRef(true);
  const advanceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    initSounds();
    return () => {
      mountedRef.current = false;
      if (advanceTimeoutRef.current !== null) {
        clearTimeout(advanceTimeoutRef.current);
      }
      clearArSession();
      cleanupSounds();
    };
  }, []);

  const emitRunningOverlay = useCallback((metrics: TrialMetrics | null) => {
    const technique = getArTechnique();
    const trialNumber = activeTargetRef.current?.trialNumber ?? 0;
    const isAligned = technique === 'baseline'
      ? Boolean(metrics?.baselineAligned)
      : Boolean(metrics?.assistedAligned);
    const dwellProgress = technique === 'assisted' && dwellStartRef.current !== null
      ? clamp((Date.now() - dwellStartRef.current) / DWELL_SELECTION_MS, 0, 1)
      : 0;
    const elapsedMs = trialStartRef.current === 0 ? 0 : Date.now() - trialStartRef.current;
    const timeRemainingMs = Math.max(0, TRIAL_TIMEOUT_MS - elapsedMs);

    emitOverlayState({
      phase: phaseRef.current,
      currentTrial: trialNumber,
      totalTrials: TOTAL_TRIALS,
      statusText:
        technique === 'baseline'
          ? 'Align the reticle and tap Confirm.'
          : 'Align, move slightly closer if needed, and hold steady.',
      misses: trialMissesRef.current,
      alignmentScore: metrics?.alignmentScore ?? 0,
      isAligned,
      targetDistanceM: metrics?.distanceM ?? null,
      timeRemainingMs,
      timeProgress: clamp(timeRemainingMs / TRIAL_TIMEOUT_MS, 0, 1),
      confirmMode: technique === 'baseline' ? 'tap' : 'dwell',
      dwellProgress,
    });
  }, []);

  const finishBlock = useCallback(() => {
    const technique = getArTechnique();
    const totalTimeMs = Date.now() - blockStartRef.current;
    const totalMisses = trialResultsRef.current.reduce((sum, trial) => sum + trial.misses, 0);
    const successTrials = trialResultsRef.current.filter((trial) => trial.outcome === 'success');
    const failureCount = trialResultsRef.current.length - successTrials.length;
    const successTimeTotal = successTrials.reduce((sum, trial) => sum + trial.completionTimeMs, 0);
    const result: BlockResult = {
      technique,
      completedTrials: trialResultsRef.current.length,
      totalTrials: TOTAL_TRIALS,
      successCount: successTrials.length,
      failureCount,
      totalTimeMs,
      averageSuccessTimeMs:
        successTrials.length === 0 ? 0 : successTimeTotal / successTrials.length,
      averageTrialTimeMs:
        trialResultsRef.current.length === 0
          ? 0
          : totalTimeMs / trialResultsRef.current.length,
      totalMisses,
      trials: trialResultsRef.current,
      completedAtIso: new Date().toISOString(),
    };

    phaseRef.current = 'complete';
    setPhase('complete');
    emitOverlayState({
      phase: 'complete',
      currentTrial: TOTAL_TRIALS,
      totalTrials: TOTAL_TRIALS,
      statusText: 'Block complete.',
      misses: totalMisses,
      alignmentScore: 1,
      isAligned: true,
      targetDistanceM: null,
      timeRemainingMs: 0,
      timeProgress: 0,
      confirmMode: technique === 'baseline' ? 'tap' : 'dwell',
      dwellProgress: 1,
    });
    emitBlockComplete(result);
  }, []);

  const startTrial = useCallback((trialNumber: number) => {
    const technique = getArTechnique();
    if (trialNumber > TOTAL_TRIALS) {
      finishBlock();
      return;
    }

    const anchorCamera = spawnCameraRef.current;
    if (!anchorCamera) return;

    const position = resolveTargetPosition(anchorCamera, TRIAL_TARGET_OFFSETS[trialNumber - 1]);
    activeTargetRef.current = { trialNumber, position };
    latestMetricsRef.current = null;
    trialMissesRef.current = 0;
    dwellStartRef.current = null;
    trialStartRef.current = Date.now();
    setTargetPosition(position);
    setTargetMaterial('targetIdle');
    setTargetScale([1, 1, 1]);
    emitOverlayState({
      phase: 'running',
      currentTrial: trialNumber,
      totalTrials: TOTAL_TRIALS,
      statusText:
        technique === 'baseline'
          ? 'Align the reticle and tap Confirm.'
          : 'Align, move slightly closer if needed, and hold steady.',
      misses: 0,
      alignmentScore: 0,
      isAligned: false,
      targetDistanceM: null,
      timeRemainingMs: TRIAL_TIMEOUT_MS,
      timeProgress: 1,
      confirmMode: technique === 'baseline' ? 'tap' : 'dwell',
      dwellProgress: 0,
    });
  }, [finishBlock]);

  const advanceToNextTrial = useCallback(() => {
    if (advanceTimeoutRef.current !== null) {
      clearTimeout(advanceTimeoutRef.current);
    }
    advanceTimeoutRef.current = setTimeout(() => {
      if (!mountedRef.current) return;
      startTrial(trialResultsRef.current.length + 1);
    }, TARGET_RESPAWN_DELAY_MS);
  }, [startTrial]);

  const completeTrial = useCallback((selectedWith: 'tap' | 'dwell') => {
    const technique = getArTechnique();
    const activeTarget = activeTargetRef.current;
    const metrics = latestMetricsRef.current;
    if (!activeTarget || !metrics) return;

    playHapticFeedback('medium');
    playPop();

    trialResultsRef.current = [
      ...trialResultsRef.current,
      {
        technique,
        trialNumber: activeTarget.trialNumber,
        targetPosition: activeTarget.position,
        outcome: 'success',
        completionTimeMs: Date.now() - trialStartRef.current,
        misses: trialMissesRef.current,
        selectedWith,
        distanceAtSelectionM: metrics.distanceM,
        angularErrorDeg: radiansToDegrees(metrics.angularErrorRad),
      },
    ];

    setTargetPosition(null);
    activeTargetRef.current = null;
    latestMetricsRef.current = null;
    dwellStartRef.current = null;
    advanceToNextTrial();
  }, [advanceToNextTrial]);

  const failTrial = useCallback(() => {
    const technique = getArTechnique();
    const activeTarget = activeTargetRef.current;
    if (!activeTarget) return;

    playHapticFeedback('light');

    trialResultsRef.current = [
      ...trialResultsRef.current,
      {
        technique,
        trialNumber: activeTarget.trialNumber,
        targetPosition: activeTarget.position,
        outcome: 'timeout',
        completionTimeMs: TRIAL_TIMEOUT_MS,
        misses: trialMissesRef.current,
        selectedWith: null,
        distanceAtSelectionM: latestMetricsRef.current?.distanceM ?? null,
        angularErrorDeg:
          latestMetricsRef.current == null
            ? null
            : radiansToDegrees(latestMetricsRef.current.angularErrorRad),
      },
    ];

    setTargetPosition(null);
    activeTargetRef.current = null;
    latestMetricsRef.current = null;
    dwellStartRef.current = null;
    emitOverlayState({
      phase: 'running',
      currentTrial: trialResultsRef.current.length,
      totalTrials: TOTAL_TRIALS,
      statusText: 'Time expired. Preparing next target...',
      misses: trialMissesRef.current,
      alignmentScore: 0,
      isAligned: false,
      targetDistanceM: null,
      timeRemainingMs: 0,
      timeProgress: 0,
      confirmMode: technique === 'baseline' ? 'tap' : 'dwell',
      dwellProgress: 0,
    });
    advanceToNextTrial();
  }, [advanceToNextTrial]);

  const handleMiss = useCallback(() => {
    trialMissesRef.current += 1;
    playHapticFeedback('light');
    emitRunningOverlay(latestMetricsRef.current);
  }, [emitRunningOverlay]);

  const handleManualConfirm = useCallback(() => {
    const technique = getArTechnique();
    if (technique !== 'baseline' || phaseRef.current !== 'running') return;
    if (latestMetricsRef.current?.baselineAligned) {
      completeTrial('tap');
      return;
    }
    handleMiss();
  }, [completeTrial, handleMiss]);

  useEffect(() => {
    registerConfirmHandler(handleManualConfirm);
  }, [handleManualConfirm]);

  const onCameraTransformUpdate = useCallback((event: ViroCameraTransform) => {
    const technique = getArTechnique();
    const transform = isTransformObject(event.cameraTransform) ? event.cameraTransform : event;
    const camera: CameraSnapshot = {
      position: transform.position as Vec3,
      forward: normalize(transform.forward as Vec3),
      up: normalize(transform.up as Vec3),
    };

    if (phaseRef.current === 'initializing') {
      initializationFramesRef.current += 1;
      if (initializationStartRef.current === null) {
        initializationStartRef.current = camera.position;
      }

      const movement = length(subtract(camera.position, initializationStartRef.current));
      emitOverlayState({
        phase: 'initializing',
        currentTrial: 0,
        totalTrials: TOTAL_TRIALS,
        statusText: 'Move the phone slowly to initialize world tracking.',
        misses: 0,
        alignmentScore: 0,
        isAligned: false,
        targetDistanceM: null,
        timeRemainingMs: TRIAL_TIMEOUT_MS,
        timeProgress: 1,
        confirmMode: technique === 'baseline' ? 'tap' : 'dwell',
        dwellProgress: 0,
      });

      if (
        initializationFramesRef.current >= INITIALIZATION_MIN_FRAMES &&
        movement >= INITIALIZATION_MIN_MOVEMENT_M
      ) {
        spawnCameraRef.current = camera;
        blockStartRef.current = Date.now();
        phaseRef.current = 'running';
        setPhase('running');
        startTrial(1);
      }
      return;
    }

    const activeTarget = activeTargetRef.current;
    if (phaseRef.current !== 'running' || !activeTarget) return;

    const metrics = measureTarget(camera, activeTarget.position);
    latestMetricsRef.current = metrics;

    if (Date.now() - trialStartRef.current >= TRIAL_TIMEOUT_MS) {
      failTrial();
      return;
    }

    if (technique === 'assisted' && metrics.assistReady) {
      if (dwellStartRef.current === null) {
        dwellStartRef.current = Date.now();
      }
      if (Date.now() - dwellStartRef.current >= DWELL_SELECTION_MS) {
        completeTrial('dwell');
        return;
      }
    } else {
      dwellStartRef.current = null;
    }

    if (technique === 'assisted' && metrics.assistedAligned) {
      const now = Date.now();
      const interval = 140 + (1 - metrics.alignmentScore) * 260;
      if (now - lastBeepTimeRef.current > interval) {
        playBeep(700 + metrics.alignmentScore * 900, 0.08, 0.24);
        lastBeepTimeRef.current = now;
      }
    }

    const now = Date.now();
    if (now - lastVisualUpdateRef.current < VISUAL_UPDATE_INTERVAL_MS) return;
    lastVisualUpdateRef.current = now;

    if (technique === 'baseline') {
      setTargetMaterial(metrics.baselineAligned ? 'targetReady' : 'targetIdle');
      setTargetScale(metrics.baselineAligned ? [1.08, 1.08, 1.08] : [1, 1, 1]);
    } else if (metrics.assistReady) {
      setTargetMaterial('targetReady');
      setTargetScale([1.12, 1.12, 1.12]);
    } else if (metrics.assistedAligned) {
      setTargetMaterial('targetFocus');
      setTargetScale([1.06, 1.06, 1.06]);
    } else {
      setTargetMaterial('targetIdle');
      setTargetScale([1, 1, 1]);
    }

    emitRunningOverlay(metrics);
  }, [completeTrial, emitRunningOverlay, failTrial, startTrial]);

  return { phase, targetPosition, targetMaterial, targetScale, onCameraTransformUpdate };
}
