import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { ExperimentProvider } from '@/contexts/ExperimentContext';

export default function RootLayout() {
  return (
    <ExperimentProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="experiment" />
      </Stack>
      <StatusBar style="light" />
    </ExperimentProvider>
  );
}
