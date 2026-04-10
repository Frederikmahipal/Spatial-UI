import React from 'react';
import { StyleSheet, View } from 'react-native';

type Props = {
  active: boolean;
};

export default function Reticle({ active }: Props) {
  return (
    <View style={styles.wrapper} pointerEvents="none">
      <View style={[styles.outer, active && styles.outerActive]}>
        <View style={[styles.dot, active && styles.dotActive]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  outer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(15,23,42,0.12)',
  },
  outerActive: {
    borderColor: '#f8fafc',
    backgroundColor: 'rgba(245,158,11,0.18)',
    transform: [{ scale: 1.04 }],
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#f8fafc',
  },
  dotActive: {
    backgroundColor: '#fef08a',
  },
});
