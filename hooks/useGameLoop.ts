import { useState, useCallback, useEffect, useRef } from 'react';
import type { Vec3, Balloon, GamePhase } from '@/types/game';
import {
  MAX_BALLOONS,
  CATCH_THRESHOLD,
  CLOSE_THRESHOLD,
  MIN_BEEP_INTERVAL,
  MAX_BEEP_INTERVAL,
  RESPAWN_DELAY,
  SCORE_KEY,
  CAUGHT_KEY,
} from '@/constants/game';
import { euclidean, makeBalloon } from '@/utils/balloons';
import {
  initSounds,
  cleanupSounds,
  playBeep,
  playPop,
  playHapticFeedback,
} from '@/utils/soundUtils';

/** Everything the UI layer needs from the game loop. */
export interface GameState {
  gamePhase: GamePhase;
  balloons: Balloon[];
  closestId: string | null;
  closestDist: number;
  onCameraTransformUpdate: (evt: any) => void;
}

export default function useGameLoop(): GameState {
  /* ── React state (drives render) ── */
  const [gamePhase, setGamePhase] = useState<GamePhase>('initializing');
  const [balloons, setBalloons] = useState<Balloon[]>([]);
  const [closestId, setClosestId] = useState<string | null>(null);
  const [closestDist, setClosestDist] = useState(Infinity);

  /* ── Refs (hot-path, no re-render) ── */
  const balloonsRef = useRef<Balloon[]>([]);
  const scoreRef = useRef(0);
  const spawnCenterRef = useRef<Vec3>([0, 0, 0]);
  const lastBeepTimeRef = useRef(0);
  const lastVisualUpdateRef = useRef(0);
  const gamePhaseRef = useRef<GamePhase>('initializing');
  const catchCooldownRef = useRef(false);

  useEffect(() => { gamePhaseRef.current = gamePhase; }, [gamePhase]);

  /* ── Sounds lifecycle ── */
  useEffect(() => {
    initSounds();
    return () => { cleanupSounds(); };
  }, []);

  /* ── Expose score to the RN overlay ── */
  useEffect(() => {
    (global as any)[SCORE_KEY] = () => scoreRef.current;
    return () => {
      delete (global as any)[SCORE_KEY];
      delete (global as any)[CAUGHT_KEY];
    };
  }, []);

  /* ── Start game ── */
  const startGame = useCallback((center: Vec3) => {
    spawnCenterRef.current = center;
    const initial: Balloon[] = [];
    for (let i = 0; i < MAX_BALLOONS; i++) {
      initial.push(makeBalloon(center, initial));
    }
    balloonsRef.current = initial;
    setBalloons(initial);
    setGamePhase('playing');
  }, []);

  /* ── Catch handler ── */
  const catchBalloon = useCallback((id: string) => {
    if (catchCooldownRef.current) return;
    catchCooldownRef.current = true;

    playHapticFeedback('heavy');
    playPop();

    scoreRef.current += 1;
    (global as any)[CAUGHT_KEY]?.();

    const remaining = balloonsRef.current.filter((b) => b.id !== id);
    balloonsRef.current = remaining;
    setBalloons(remaining);

    setTimeout(() => {
      const fresh = makeBalloon(spawnCenterRef.current, balloonsRef.current);
      const updated = [...balloonsRef.current, fresh];
      balloonsRef.current = updated;
      setBalloons(updated);
      catchCooldownRef.current = false;
    }, RESPAWN_DELAY);
  }, []);

  /* ── Per-frame callback (called by ViroARScene) ── */
  const onCameraTransformUpdate = useCallback(
    (evt: any) => {
      const t = evt.cameraTransform ?? evt;
      const phonePos: Vec3 = t.position;

      if (gamePhaseRef.current === 'initializing') {
        startGame(phonePos);
        return;
      }

      const list = balloonsRef.current;
      if (list.length === 0) return;

      let minDist = Infinity;
      let minId: string | null = null;
      for (const b of list) {
        const d = euclidean(phonePos, b.position);
        if (d < minDist) { minDist = d; minId = b.id; }
      }

      if (minId && minDist < CATCH_THRESHOLD) {
        catchBalloon(minId);
        return;
      }

      // proximity beep
      if (minDist < CLOSE_THRESHOLD) {
        const now = Date.now();
        const ratio = Math.max(0, Math.min(1,
          (minDist - CATCH_THRESHOLD) / (CLOSE_THRESHOLD - CATCH_THRESHOLD),
        ));
        const interval = MIN_BEEP_INTERVAL + ratio * (MAX_BEEP_INTERVAL - MIN_BEEP_INTERVAL);
        if (now - lastBeepTimeRef.current > interval) {
          playBeep(500 + (1 - ratio) * 1100, 0.08, 0.35);
          lastBeepTimeRef.current = now;
        }
      }

      // throttled visual update (~20 fps)
      const now = Date.now();
      if (now - lastVisualUpdateRef.current > 50) {
        setClosestId(minId);
        setClosestDist(minDist);
        lastVisualUpdateRef.current = now;
      }
    },
    [startGame, catchBalloon],
  );

  return { gamePhase, balloons, closestId, closestDist, onCameraTransformUpdate };
}
