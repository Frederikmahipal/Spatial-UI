import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function StartScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🎈</Text>
      <Text style={styles.title}>Balloon Catcher</Text>
      <Text style={styles.subtitle}>
        Catch floating balloons in AR!{'\n'}
        Move your phone toward them — listen for the beeps!
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('/ar' as any)}
      >
        <Text style={styles.buttonText}>Start</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#94a3b8',
    marginBottom: 40,
    textAlign: 'center',
    lineHeight: 24,
  },
  button: {
    backgroundColor: '#3b82f6',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 16,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
});
