import React, { useState, useCallback, useRef, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import {
  ViroARScene,
  ViroText,
  ViroARPlaneSelector,
  ViroAmbientLight,
  ViroBox,
  ViroNode,
  ViroMaterials,
} from '@reactvision/react-viro';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';
import type { Condition } from '@/types/experiment';

ViroMaterials.createMaterials({
  boxDefault: { diffuseColor: '#475569' },
  boxHover: { diffuseColor: '#38bdf8' },
  boxSelected: { diffuseColor: '#22c55e' },
});

const BOX_IDS = ['1', '2', '3', '4', '5', '6', '7', '8'];
const BOX_SIZE = 0.08;
const GRID_OFFSET = 0.12;

interface SelectionExperimentSceneProps {
  sceneNavigator?: { pop: () => void };
  passProps?: { condition: Condition };
}

export default function SelectionExperimentScene(props: SelectionExperimentSceneProps) {
  const { sceneNavigator, passProps } = props;
  const condition: Condition = passProps?.condition ?? 'baseline';

  const [planeSelected, setPlaneSelected] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const proximitySoundRef = useRef<Audio.Sound | null>(null);
  const isMultimodal = condition === 'multimodal';

  const goBack = () => sceneNavigator?.pop();

  const onPlaneSelected = () => setPlaneSelected(true);

  const getMaterial = (id: string) => {
    if (selectedId === id) return 'boxSelected';
    if (hoveredId === id) return 'boxHover';
    return 'boxDefault';
  };

  const handleHover = useCallback(
    async (id: string, isHovering: boolean) => {
      setHoveredId(isHovering ? id : null);

      if (!isMultimodal) return;

      if (isHovering) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        try {
          const { sound } = await Audio.Sound.createAsync(
            require('@/assets/sounds/proximity_tone.mp3'),
            { isLooping: true }
          );
          proximitySoundRef.current?.unloadAsync();
          proximitySoundRef.current = sound;
          await sound.playAsync();
        } catch (_) {
          // No asset yet or load failed — skip audio
        }
      } else {
        try {
          await proximitySoundRef.current?.stopAsync();
          await proximitySoundRef.current?.unloadAsync();
          proximitySoundRef.current = null;
        } catch (_) {}
      }
    },
    [isMultimodal]
  );

  useEffect(() => {
    return () => {
      proximitySoundRef.current?.unloadAsync().catch(() => {});
    };
  }, []);

  const handleClick = useCallback(
    (id: string) => {
      if (selectedId === id) {
        setSelectedId(null);
        return;
      }

      setSelectedId(id);

      if (isMultimodal) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        // Optional: short confirmation sound — add asset if you want
      }
    },
    [selectedId, isMultimodal]
  );

  if (!planeSelected) {
    return (
      <ViroARScene>
        <ViroAmbientLight color="#ffffff" intensity={200} />
        <ViroText
          text="Back"
          scale={[0.3, 0.3, 0.3]}
          position={[-0.2, 0.3, -0.7]}
          style={styles.textStyle}
          onClick={goBack}
        />
        <ViroText
          text="Tap a surface to place boxes"
          scale={[0.35, 0.35, 0.35]}
          position={[0, 0, -1.5]}
          style={styles.textStyle}
        />
        <ViroARPlaneSelector minHeight={0.2} minWidth={0.2} onPlaneSelected={onPlaneSelected}>
          <ViroNode position={[0, 0, 0]} />
        </ViroARPlaneSelector>
      </ViroARScene>
    );
  }

  return (
    <ViroARScene>
      <ViroAmbientLight color="#ffffff" intensity={200} />
      <ViroText
        text="Back"
        scale={[0.3, 0.3, 0.3]}
        position={[-0.2, 0.3, -0.7]}
        style={styles.textStyle}
        onClick={goBack}
      />

      <ViroARPlaneSelector minHeight={0.5} minWidth={0.5} onPlaneSelected={() => {}}>
        <ViroNode position={[0, 0, 0]}>
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
      </ViroARPlaneSelector>
    </ViroARScene>
  );
}

const styles = StyleSheet.create({
  textStyle: {
    fontFamily: 'Arial',
    fontSize: 30,
    color: '#ffffff',
    textAlignVertical: 'center',
    textAlign: 'center',
  },
});
