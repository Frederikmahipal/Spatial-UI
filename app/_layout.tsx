import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

export default function RootLayout() {
  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="instructions" />
        <Stack.Screen name="ar" />
        <Stack.Screen name="results" />
      </Stack>
      <StatusBar style="light" />
    </>
  );
}
