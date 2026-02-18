import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';
import BalloonScene from '@/components/BalloonScene';
import { SCORE_KEY, CAUGHT_KEY } from '@/constants/game';

const isExpoGo = Constants.appOwnership === 'expo';
const ViroARSceneNavigator = isExpoGo
  ? null
  : require('@reactvision/react-viro').ViroARSceneNavigator;

export default function ARScreen() {
  const router = useRouter();
  const [score, setScore] = useState(0);

  useEffect(() => {
    // HandTrackingScene calls this callback whenever a balloon is caught
    (global as any)[CAUGHT_KEY] = () => {
      const current: number = (global as any)[SCORE_KEY]?.() ?? 0;
      setScore(current);
    };
    return () => {
      delete (global as any)[CAUGHT_KEY];
      delete (global as any)[SCORE_KEY];
    };
  }, []);

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
        initialScene={{ scene: BalloonScene }}
        style={StyleSheet.absoluteFill}
      />

      {/* ── Overlay ── */}
      <View style={styles.overlay} pointerEvents="box-none">
        {/* Top bar: back + score */}
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <View style={styles.scoreBadge}>
            <Text style={styles.scoreText}>🎈 {score}</Text>
          </View>
        </View>

        {/* Bottom hint */}
        <View style={styles.bottomBar}>
          <Text style={styles.hint}>
            Move your phone toward the balloons to catch them!
          </Text>
        </View>
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
    paddingTop: 48,
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 8,
  },
  backText: { fontSize: 16, color: '#fff', fontWeight: '600' },
  scoreBadge: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
  },
  scoreText: { fontSize: 22, color: '#fff', fontWeight: '700' },
  bottomBar: { alignItems: 'center', paddingBottom: 48 },
  hint: {
    fontSize: 14,
    color: '#fff',
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    textAlign: 'center',
  },
});
