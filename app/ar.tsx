import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Constants from 'expo-constants';
import { ViroARSceneNavigator } from '@reactvision/react-viro';

import Reticle from '@/components/Reticle';
import TargetSelectionScene from '@/components/TargetSelectionScene';
import { TECHNIQUES } from '@/constants/experiment';
import { clearArSession, configureArSession, requestManualConfirm } from '@/store/arSession';
import { getSelectedTechnique, setLatestBlockResult } from '@/store/experimentStore';
import type { BlockResult, OverlayState, TechniqueId } from '@/types/experiment';

const isExpoGo = Constants.appOwnership === 'expo';

function isTechniqueId(value: string | undefined): value is TechniqueId {
  return value === 'baseline' || value === 'assisted';
}

export default function ARScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ technique?: string; session?: string }>();
  const technique = isTechniqueId(params.technique) ? params.technique : getSelectedTechnique();
  const sceneSessionKey = `${technique}-${params.session ?? 'default'}`;
  const [navigatorMounted, setNavigatorMounted] = useState(true);
  const [pendingResult, setPendingResult] = useState<BlockResult | null>(null);
  const [overlay, setOverlay] = useState<OverlayState>({
    technique: TECHNIQUES[technique],
    phase: 'initializing',
    currentTrial: 0,
    totalTrials: 10,
    statusText: 'Initializing AR...',
    misses: 0,
    alignmentScore: 0,
    isAligned: false,
    targetDistanceM: null,
    timeRemainingMs: 5000,
    timeProgress: 1,
    confirmMode: technique === 'baseline' ? 'tap' : 'dwell',
    dwellProgress: 0,
  });

  useEffect(() => {
    setNavigatorMounted(true);
    setPendingResult(null);
    configureArSession({
      technique,
      onOverlayStateChange: setOverlay,
      onBlockComplete: (result) => {
        clearArSession();
        setPendingResult(result);
        setNavigatorMounted(false);
      },
    });

    return () => {
      clearArSession();
    };
  }, [router, technique]);

  useEffect(() => {
    if (pendingResult === null || navigatorMounted) return;

    const timeout = setTimeout(() => {
      setLatestBlockResult(pendingResult);
      router.replace('/results' as any);
    }, 80);

    return () => clearTimeout(timeout);
  }, [navigatorMounted, pendingResult, router]);

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
      {navigatorMounted && (
        <ViroARSceneNavigator
          key={sceneSessionKey}
          initialScene={{ scene: TargetSelectionScene }}
          style={StyleSheet.absoluteFill}
        />
      )}

      <View style={styles.overlay} pointerEvents="box-none">
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <View style={styles.badge}>
            <Text style={styles.badgeLabel}>{overlay.technique.shortLabel}</Text>
            <Text style={styles.badgeValue}>
              {overlay.currentTrial}/{overlay.totalTrials}
            </Text>
          </View>
        </View>

        <Reticle active={overlay.isAligned} />

        <View style={styles.bottomBar}>
          <View style={styles.panel}>
            <Text style={styles.panelTitle}>{overlay.technique.title}</Text>
            <Text style={styles.hint}>{overlay.statusText}</Text>
            <View style={styles.metricsRow}>
              <Text style={styles.metric}>
                Misses: <Text style={styles.metricStrong}>{overlay.misses}</Text>
              </Text>
              <Text style={styles.metric}>
                Distance:{' '}
                <Text style={styles.metricStrong}>
                  {overlay.targetDistanceM === null ? '--' : `${overlay.targetDistanceM.toFixed(2)}m`}
                </Text>
              </Text>
            </View>

            <View style={styles.metricsRow}>
              <Text style={styles.metric}>
                Time left:{' '}
                <Text style={styles.metricStrong}>
                  {(overlay.timeRemainingMs / 1000).toFixed(1)}s
                </Text>
              </Text>
            </View>

            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.timeFill,
                  { width: `${Math.max(0, overlay.timeProgress * 100)}%` },
                ]}
              />
            </View>

            {overlay.confirmMode === 'dwell' && (
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${Math.max(8, overlay.dwellProgress * 100)}%` },
                  ]}
                />
              </View>
            )}

            {overlay.confirmMode === 'tap' && (
              <TouchableOpacity style={styles.confirmButton} onPress={requestManualConfirm}>
                <Text style={styles.confirmButtonText}>Confirm Selection</Text>
              </TouchableOpacity>
            )}
          </View>
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
    paddingHorizontal: 18,
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
  badge: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
  },
  badgeLabel: {
    fontSize: 12,
    color: '#93c5fd',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  badgeValue: { fontSize: 18, color: '#fff', fontWeight: '800' },
  bottomBar: { paddingBottom: 32 },
  panel: {
    backgroundColor: 'rgba(8,15,29,0.8)',
    borderRadius: 18,
    padding: 16,
    gap: 10,
  },
  panelTitle: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '800',
  },
  hint: {
    fontSize: 14,
    color: '#dbeafe',
    lineHeight: 20,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  metric: {
    fontSize: 13,
    color: '#cbd5e1',
  },
  metricStrong: {
    fontWeight: '800',
    color: '#f8fafc',
  },
  progressTrack: {
    height: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(148,163,184,0.28)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#f59e0b',
  },
  timeFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#38bdf8',
  },
  confirmButton: {
    marginTop: 4,
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
  },
});
