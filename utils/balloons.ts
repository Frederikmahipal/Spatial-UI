import type { Vec3, Balloon } from '@/types/game';
import {
  BALLOON_COLORS,
  SPAWN_RADIUS_MIN,
  SPAWN_RADIUS_MAX,
  SPAWN_HEIGHT_MIN,
  SPAWN_HEIGHT_MAX,
  MIN_BALLOON_SPACING,
} from '@/constants/game';

/* ── Math helpers ── */

export function euclidean(a: Vec3, b: Vec3): number {
  const dx = a[0] - b[0];
  const dy = a[1] - b[1];
  const dz = a[2] - b[2];
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

function rand(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

/* ── Spawn logic ── */

function spawnPosition(center: Vec3, existing: Balloon[]): Vec3 {
  let pos: Vec3 = [0, 0, 0];
  let tries = 0;
  do {
    const angle = rand(-Math.PI * 0.65, Math.PI * 0.65);
    const dist = rand(SPAWN_RADIUS_MIN, SPAWN_RADIUS_MAX);
    pos = [
      center[0] + Math.sin(angle) * dist,
      center[1] + rand(SPAWN_HEIGHT_MIN, SPAWN_HEIGHT_MAX),
      center[2] - Math.cos(angle) * dist, // −Z = forward in Viro
    ];
    tries++;
  } while (
    tries < 30 &&
    existing.some((b) => euclidean(pos, b.position) < MIN_BALLOON_SPACING)
  );
  return pos;
}

export function makeBalloon(center: Vec3, existing: Balloon[]): Balloon {
  return {
    id: `b_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    position: spawnPosition(center, existing),
    material: BALLOON_COLORS[Math.floor(Math.random() * BALLOON_COLORS.length)],
  };
}
