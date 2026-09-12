import { Stack } from 'expo-router';
import { colors } from '@/theme/colors';

export default function AccountLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.primary,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="add-player" options={{ title: '' }} />
      <Stack.Screen name="player/[playerId]" options={{ title: '' }} />
      <Stack.Screen name="notifications" options={{ title: '' }} />
      <Stack.Screen name="help" options={{ title: '' }} />
    </Stack>
  );
}
