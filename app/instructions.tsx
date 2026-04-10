import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { TECHNIQUES } from '@/constants/experiment';
import { getSelectedTechnique, setSelectedTechnique } from '@/store/experimentStore';
import type { TechniqueId } from '@/types/experiment';

function isTechniqueId(value: string | undefined): value is TechniqueId {
  return value === 'baseline' || value === 'assisted';
}

export default function InstructionsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ technique?: string }>();
  const technique = isTechniqueId(params.technique) ? params.technique : getSelectedTechnique();
  const meta = TECHNIQUES[technique];

  const handleStart = () => {
    setSelectedTechnique(technique);
    router.push({
      pathname: '/ar',
      params: { technique, session: `${Date.now()}` },
    } as any);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.eyebrow}>{meta.shortLabel}</Text>
      <Text style={styles.title}>{meta.title}</Text>
      <Text style={styles.summary}>{meta.summary}</Text>

      <View style={styles.instructionsCard}>
        <Text style={styles.instructionsTitle}>What to do</Text>
        {meta.instructions.map((item) => (
          <Text key={item} style={styles.instruction}>
            • {item}
          </Text>
        ))}
        <Text style={styles.note}>
          One target appears at a time. Complete the block as quickly and accurately as possible.
          Move the phone briefly at the start so AR tracking can lock in.
        </Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.secondaryButton} onPress={() => router.back()}>
          <Text style={styles.secondaryButtonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.primaryButton} onPress={handleStart}>
          <Text style={styles.primaryButtonText}>Start Block</Text>
        </TouchableOpacity>
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
    marginBottom: 12,
  },
  summary: {
    fontSize: 16,
    lineHeight: 24,
    color: '#cbd5e1',
    marginBottom: 24,
  },
  instructionsCard: {
    backgroundColor: '#111c32',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#22314f',
    marginBottom: 24,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#f8fafc',
    marginBottom: 12,
  },
  instruction: {
    fontSize: 15,
    lineHeight: 22,
    color: '#e2e8f0',
    marginBottom: 10,
  },
  note: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    color: '#93c5fd',
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
