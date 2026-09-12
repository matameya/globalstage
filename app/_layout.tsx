import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import '@/i18n';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="registration/[tournamentId]/select-player"
          options={{ headerShown: true, title: '' }}
        />
        <Stack.Screen
          name="registration/[tournamentId]/waivers"
          options={{ headerShown: true, title: '' }}
        />
        <Stack.Screen
          name="registration/[tournamentId]/payment"
          options={{ headerShown: true, title: '' }}
        />
        <Stack.Screen name="registration/[tournamentId]/confirmation" />
      </Stack>
    </GestureHandlerRootView>
  );
}
