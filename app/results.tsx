import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';

import { TECHNIQUES } from '@/constants/experiment';
import { clearSessionResults, getLatestBlockResult, getSessionResult } from '@/store/experimentStore';

export default function ResultsScreen() {
  const router = useRouter();
  const result = getLatestBlockResult();

  if (!result) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>No results yet</Text>
        <TouchableOpacity style={styles.primaryButton} onPress={() => router.replace('/')}>
          <Text style={styles.primaryButtonText}>Return Home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const meta = TECHNIQUES[result.technique];
  const otherTechnique = result.technique === 'baseline' ? 'assisted' : 'baseline';
  const hasCompletedBoth = getSessionResult(otherTechnique) !== null;

  return (
    <View style={styles.container}>
      <Text style={styles.eyebrow}>Block Complete</Text>
      <Text style={styles.title}>{meta.title}</Text>
      <Text style={styles.subtitle}>
        {hasCompletedBoth
          ? 'Both techniques are complete for this session.'
          : 'Review the metrics below, then run the other condition for comparison.'}
      </Text>

      <View style={styles.card}>
        <Text style={styles.metricLabel}>Completed trials</Text>
        <Text style={styles.metricValue}>
          {result.completedTrials}/{result.totalTrials}
        </Text>

        <Text style={styles.metricLabel}>Successful trials</Text>
        <Text style={styles.metricValue}>{result.successCount}</Text>

        <Text style={styles.metricLabel}>Timeout failures</Text>
        <Text style={styles.metricValue}>{result.failureCount}</Text>

        <Text style={styles.metricLabel}>Average success time</Text>
        <Text style={styles.metricValue}>
          {result.successCount === 0 ? '--' : `${(result.averageSuccessTimeMs / 1000).toFixed(2)} s`}
        </Text>

        <Text style={styles.metricLabel}>Total block time</Text>
        <Text style={styles.metricValue}>{(result.totalTimeMs / 1000).toFixed(2)} s</Text>

        <Text style={styles.metricLabel}>Wrong confirms</Text>
        <Text style={styles.metricValue}>{result.totalMisses}</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => {
            clearSessionResults();
            router.replace('/');
          }}
        >
          <Text style={styles.secondaryButtonText}>Home</Text>
        </TouchableOpacity>
        {hasCompletedBoth ? (
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => {
              clearSessionResults();
              router.replace('/');
            }}
          >
            <Text style={styles.primaryButtonText}>Finish Session</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() =>
              router.replace({
                pathname: '/instructions',
                params: { technique: otherTechnique },
              } as any)
            }
          >
            <Text style={styles.primaryButtonText}>Run Other Technique</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b1220',
    padding: 24,
    justifyContent: 'center',
  },
  eyebrow: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: '#93c5fd',
    marginBottom: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#f8fafc',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: '#cbd5e1',
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#111c32',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#22314f',
    gap: 6,
    marginBottom: 24,
  },
  metricLabel: {
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    color: '#7dd3fc',
    marginTop: 10,
  },
  metricValue: {
    fontSize: 26,
    fontWeight: '800',
    color: '#f8fafc',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: '#172338',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#e2e8f0',
  },
  primaryButton: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: '#2563eb',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#f8fafc',
  },
});
