import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';

import { TECHNIQUES } from '@/constants/experiment';
import type { TechniqueId } from '@/types/experiment';
import { clearSessionResults, setSelectedTechnique } from '@/store/experimentStore';

export default function StartScreen() {
  const router = useRouter();

  const handleTechniqueSelect = (technique: TechniqueId) => {
    clearSessionResults();
    setSelectedTechnique(technique);
    router.push({
      pathname: '/instructions',
      params: { technique },
    } as any);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>AR Pointing Technique Comparison</Text>
        <Text style={styles.subtitle}>
          Compare a standard mobile AR pointing technique against a proximity-assisted
          alternative for target selection.
        </Text>
      </View>

      <View style={styles.cardList}>
        {(Object.keys(TECHNIQUES) as TechniqueId[]).map((technique) => {
          const item = TECHNIQUES[technique];
          return (
            <TouchableOpacity
              key={item.id}
              style={styles.card}
              onPress={() => handleTechniqueSelect(item.id)}
            >
              <Text style={styles.cardLabel}>{item.shortLabel}</Text>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardSummary}>{item.summary}</Text>
              <Text style={styles.cardAction}>Open Instructions</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b1220',
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    marginBottom: 28,
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
  subtitle: {
    fontSize: 16,
    color: '#cbd5e1',
    lineHeight: 24,
  },
  cardList: {
    gap: 16,
  },
  card: {
    backgroundColor: '#111c32',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#22314f',
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: '#7dd3fc',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#f8fafc',
    marginBottom: 8,
  },
  cardSummary: {
    fontSize: 15,
    lineHeight: 22,
    color: '#cbd5e1',
    marginBottom: 16,
  },
  cardAction: {
    fontSize: 15,
    fontWeight: '700',
    color: '#f8fafc',
  },
});
