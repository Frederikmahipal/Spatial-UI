import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';
import { useExperiment } from '@/contexts/ExperimentContext';
import SelectionExperimentScene from '@/components/ar-scenes/SelectionExperimentScene';

const isExpoGo = Constants.appOwnership === 'expo';
const ViroARSceneNavigator = isExpoGo
  ? null
  : require('@reactvision/react-viro').ViroARSceneNavigator;

export default function ExperimentScreen() {
  const router = useRouter();
  const { condition } = useExperiment();

  if (isExpoGo) {
    return (
      <View style={styles.fallback}>
        <Text style={styles.title}>AR needs a dev build</Text>
        <Text style={styles.text}>Run: npx expo run:android</Text>
      </View>
    );
  }

  if (!condition) {
    return (
      <View style={styles.fallback}>
        <Text style={styles.text}>Pick a condition on the start screen first.</Text>
        <Text style={styles.link} onPress={() => router.back()}>
          ← Back
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ViroARSceneNavigator
        initialScene={{
          scene: SelectionExperimentScene,
          passProps: { condition },
        }}
        style={StyleSheet.absoluteFill}
      />
      {/* Center reticle — dot; pointerEvents so taps go to AR */}
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
  link: { fontSize: 16, color: '#3b82f6', marginTop: 16 },
  reticle: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
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
