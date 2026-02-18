/** Shared types for the balloon-catcher AR game. */

export type Vec3 = [number, number, number];

export interface Balloon {
  id: string;
  position: Vec3;
  material: string;
}

export type GamePhase = 'initializing' | 'playing';
