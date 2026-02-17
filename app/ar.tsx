import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';
import { useApp } from '@/contexts/AppContext';
import SelectionScene from '@/components/ar-scenes/SelectionScene';

const isExpoGo = Constants.appOwnership === 'expo';
const ViroARSceneNavigator = isExpoGo
  ? null
  : require('@reactvision/react-viro').ViroARSceneNavigator;

const PLACE_IN_FRONT_KEY = '__placeInFront';

export default function ARScreen() {
  const router = useRouter();
  const { condition } = useApp();

  if (isExpoGo) {
    return (
      <View style={styles.fallback}>
        <Text style={styles.title}>AR needs a dev build</Text>
        <Text style={styles.text}>Run: npx expo run:android</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ViroARSceneNavigator
        initialScene={{
          scene: SelectionScene,
          passProps: { condition: condition ?? 'baseline' },
        }}
        style={StyleSheet.absoluteFill}
      />
      {/* Overlay: real RN buttons so they're tappable */}
      <View style={styles.overlay} pointerEvents="box-none">
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.placeButton}
          onPress={() => (global as any)[PLACE_IN_FRONT_KEY]?.()}
        >
          <Text style={styles.placeButtonText}>Place in front of me</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.reticle} pointerEvents="none">
        <View style={styles.reticleDot} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  fallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#1a1a2e',
  },
  title: { fontSize: 22, fontWeight: '700', color: '#fff', marginBottom: 16 },
  text: { fontSize: 16, color: '#a0a0a0', textAlign: 'center' },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    paddingTop: 56,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 8,
  },
  backButtonText: { fontSize: 16, color: '#fff', fontWeight: '600' },
  placeButton: {
    position: 'absolute',
    bottom: 48,
    paddingVertical: 14,
    paddingHorizontal: 24,
    backgroundColor: 'rgba(59, 130, 246, 0.95)',
    borderRadius: 12,
  },
  placeButtonText: { fontSize: 16, color: '#fff', fontWeight: '600' },
  reticle: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none',
  },
  reticleDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.3)',
  },
});
