import React from 'react';
import {
  ViroARScene,
  ViroAmbientLight,
  ViroDirectionalLight,
  ViroSphere,
  ViroText,
} from '@reactvision/react-viro';

import useTargetSelectionBlock from '@/hooks/useTargetSelectionBlock';
import type { Vec3 } from '@/types/game';
import { TARGET_RADIUS } from '@/constants/experiment';

export default function TargetSelectionScene() {
  const { phase, targetPosition, targetMaterial, targetScale, targetVisible, onCameraTransformUpdate } =
    useTargetSelectionBlock();

  return (
    <ViroARScene onCameraTransformUpdate={onCameraTransformUpdate}>
      <ViroAmbientLight color="#ffffff" intensity={320} />
      <ViroDirectionalLight color="#ffffff" direction={[0, -1, -0.4]} intensity={560} />

      {targetPosition && (
        <ViroSphere
          key={`${targetPosition.join('_')}`}
          position={targetPosition}
          radius={TARGET_RADIUS}
          scale={targetScale}
          materials={[targetMaterial]}
          heightSegmentCount={20}
          widthSegmentCount={20}
          opacity={targetVisible ? 1 : 0}
          facesOutward
        />
      )}

      {phase === 'initializing' && (
        <ViroText
          text={'Initializing AR...\nMove the phone slightly to start.'}
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
