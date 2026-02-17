import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  ViroARScene,
  ViroARPlaneSelector,
  ViroAmbientLight,
  ViroBox,
  ViroNode,
  ViroMaterials,
} from '@reactvision/react-viro';
import * as Haptics from 'expo-haptics';
import type { Condition } from '@/types/app';

type Vec3 = [number, number, number];

ViroMaterials.createMaterials({
  boxDefault: { diffuseColor: '#475569' },
  boxHover: { diffuseColor: '#38bdf8' },
  boxSelected: { diffuseColor: '#22c55e' },
});

const BOX_IDS = ['1', '2', '3', '4', '5', '6', '7', '8'];
const BOX_SIZE = 0.08;
const GRID_OFFSET = 0.12;
const PLACE_IN_FRONT_KEY = '__placeInFront';
const PLACE_DISTANCE = 0.6;

interface SelectionSceneProps {
  sceneNavigator?: { pop: () => void };
  passProps?: { condition: Condition };
}

function addScaled(pos: Vec3, forward: Vec3, scale: number): Vec3 {
  return [
    pos[0] + forward[0] * scale,
    pos[1] + forward[1] * scale,
    pos[2] + forward[2] * scale,
  ];
}

export default function SelectionScene(props: SelectionSceneProps) {
  const { passProps } = props;
  const condition: Condition = passProps?.condition ?? 'baseline';

  const [planeSelected, setPlaneSelected] = useState(false);
  const [useFixedPlacement, setUseFixedPlacement] = useState(false);
  const [placePosition, setPlacePosition] = useState<[number, number, number]>([0, 0, -0.6]);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const cameraRef = useRef<{ position: Vec3; forward: Vec3 } | null>(null);
  const isMultimodal = condition === 'multimodal';

  const onCameraTransformUpdate = useCallback(
    (transform: { position: Vec3; forward: Vec3 }) => {
      cameraRef.current = {
        position: transform.position,
        forward: transform.forward,
      };
    },
    []
  );

  useEffect(() => {
    const trigger = () => {
      const cam = cameraRef.current;
      if (cam) {
        const pos = addScaled(cam.position, cam.forward, PLACE_DISTANCE);
        setPlacePosition(pos);
      } else {
        setPlacePosition([0, 0, -0.6]);
      }
      setPlaneSelected(true);
      setUseFixedPlacement(true);
    };
    (global as any)[PLACE_IN_FRONT_KEY] = trigger;
    return () => {
      delete (global as any)[PLACE_IN_FRONT_KEY];
    };
  }, []);

  const onPlaneSelected = () => setPlaneSelected(true);

  const getMaterial = (id: string) => {
    if (selectedId === id) return 'boxSelected';
    if (hoveredId === id) return 'boxHover';
    return 'boxDefault';
  };

  const handleHover = useCallback(
    (id: string, isHovering: boolean) => {
      setHoveredId(isHovering ? id : null);
      if (isMultimodal && isHovering) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    },
    [isMultimodal]
  );

  const handleClick = useCallback(
    (id: string) => {
      if (selectedId === id) {
        setSelectedId(null);
        return;
      }

      setSelectedId(id);

      if (isMultimodal) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    },
    [selectedId, isMultimodal]
  );

  const boxNodes = (
    <ViroNode position={useFixedPlacement ? placePosition : [0, 0, 0]}>
      {BOX_IDS.map((id, i) => {
        const row = Math.floor(i / 4);
        const col = i % 4;
        const x = (col - 1.5) * GRID_OFFSET;
        const z = row * GRID_OFFSET;
        return (
          <ViroBox
            key={id}
            viroTag={id}
            position={[x, BOX_SIZE / 2, z]}
            scale={[BOX_SIZE, BOX_SIZE, BOX_SIZE]}
            materials={[getMaterial(id)]}
            onHover={(isHovering: boolean) => handleHover(id, isHovering)}
            onClick={() => handleClick(id)}
            dragType={selectedId === id ? 'FixedToPlane' : undefined}
            dragPlane={
              selectedId === id
                ? {
                    planePoint: [0, 0, 0],
                    planeNormal: [0, 1, 0],
                    maxDistance: 3,
                  }
                : undefined
            }
          />
        );
      })}
    </ViroNode>
  );

  if (!planeSelected) {
    return (
      <ViroARScene onCameraTransformUpdate={onCameraTransformUpdate}>
        <ViroAmbientLight color="#ffffff" intensity={200} />
        <ViroARPlaneSelector minHeight={0.1} minWidth={0.1} onPlaneSelected={onPlaneSelected}>
          <ViroNode position={[0, 0, 0]} />
        </ViroARPlaneSelector>
      </ViroARScene>
    );
  }

  return (
    <ViroARScene onCameraTransformUpdate={onCameraTransformUpdate}>
      <ViroAmbientLight color="#ffffff" intensity={200} />

      {useFixedPlacement ? (
        boxNodes
      ) : (
        <ViroARPlaneSelector minHeight={0.1} minWidth={0.1} onPlaneSelected={() => {}}>
          {boxNodes}
        </ViroARPlaneSelector>
      )}
    </ViroARScene>
  );
}
