import React from 'react';
import {
  ViroARScene,
  ViroAmbientLight,
  ViroDirectionalLight,
  ViroSphere,
  ViroText,
} from '@reactvision/react-viro';

// side-effect: registers Viro materials
import '@/constants/game';

import type { Vec3, Balloon } from '@/types/game';
import { BALLOON_RADIUS, CATCH_THRESHOLD, CLOSE_THRESHOLD } from '@/constants/game';
import useGameLoop from '@/hooks/useGameLoop';

/* ── Visual helpers ── */

function getMaterial(b: Balloon, closestId: string | null, closestDist: number): string {
  if (b.id !== closestId) return b.material;
  if (closestDist < CATCH_THRESHOLD * 1.5) return 'balloonCatch';
  if (closestDist < CLOSE_THRESHOLD * 0.5) return 'balloonClose';
  return b.material;
}

function getScale(b: Balloon, closestId: string | null, closestDist: number): Vec3 {
  if (b.id !== closestId || closestDist > CLOSE_THRESHOLD) return [1, 1, 1];
  const proximity = Math.max(0, 1 - closestDist / CLOSE_THRESHOLD);
  const s = 1 + proximity * 0.4;
  return [s, s, s];
}

/* ── Component ── */

export default function BalloonScene() {
  const { gamePhase, balloons, closestId, closestDist, onCameraTransformUpdate } =
    useGameLoop();

  return (
    <ViroARScene onCameraTransformUpdate={onCameraTransformUpdate}>
      <ViroAmbientLight color="#ffffff" intensity={300} />
      <ViroDirectionalLight color="#ffffff" direction={[0, -1, -0.5]} intensity={500} />

      {balloons.map((b) => (
        <ViroSphere
          key={b.id}
          position={b.position}
          radius={BALLOON_RADIUS}
          scale={getScale(b, closestId, closestDist)}
          materials={[getMaterial(b, closestId, closestDist)]}
          heightSegmentCount={20}
          widthSegmentCount={20}
          facesOutward
        />
      ))}

      {gamePhase === 'initializing' && (
        <ViroText
          text={'Initializing AR…\nPoint your phone around briefly'}
          scale={[0.18, 0.18, 0.18] as Vec3}
          position={[0, 0, -1] as Vec3}
          style={{
            fontFamily: 'Arial',
            fontSize: 18,
            color: '#ffffff',
            textAlignVertical: 'center',
            textAlign: 'center',
          }}
        />
      )}
    </ViroARScene>
  );
}
