import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useExperiment } from '@/contexts/ExperimentContext';
import type { Condition } from '@/types/experiment';

export default function StartScreen() {
  const router = useRouter();
  const { condition, setCondition } = useExperiment();

  const canStart = condition !== null;

  const handleStart = () => {
    if (!canStart) return;
    router.push('/experiment');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>AR Selection</Text>
      <Text style={styles.subtitle}>Point at boxes, tap to select, drag to move</Text>

      <Text style={styles.label}>Condition</Text>
      <View style={styles.conditionRow}>
        <ConditionButton
          label="A — Baseline"
          description="Visual only"
          selected={condition === 'baseline'}
          onPress={() => setCondition('baseline')}
        />
        <ConditionButton
          label="B — Multimodal"
          description="Haptics + audio"
          selected={condition === 'multimodal'}
          onPress={() => setCondition('multimodal')}
        />
      </View>

      <TouchableOpacity
        style={[styles.button, !canStart && styles.buttonDisabled]}
        onPress={handleStart}
        disabled={!canStart}
      >
        <Text style={styles.buttonText}>Start</Text>
      </TouchableOpacity>
    </View>
  );
}

function ConditionButton({
  label,
  description,
  selected,
  onPress,
}: {
  label: string;
  description: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.conditionButton, selected && styles.conditionButtonSelected]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={[styles.conditionLabel, selected && styles.conditionLabelSelected]}>
        {label}
      </Text>
      <Text style={[styles.conditionDesc, selected && styles.conditionDescSelected]}>
        {description}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 32,
    textAlign: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#cbd5e1',
    marginBottom: 8,
  },
  conditionRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  conditionButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#1e293b',
    borderWidth: 2,
    borderColor: '#334155',
  },
  conditionButtonSelected: {
    borderColor: '#3b82f6',
    backgroundColor: '#1e3a5f',
  },
  conditionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94a3b8',
  },
  conditionLabelSelected: {
    color: '#93c5fd',
  },
  conditionDesc: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  conditionDescSelected: {
    color: '#94a3b8',
  },
  button: {
    backgroundColor: '#3b82f6',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
