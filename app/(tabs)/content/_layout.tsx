import { Stack } from 'expo-router';
import { colors } from '@/theme/colors';

export default function ContentLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.primary,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="[contentId]" options={{ title: '' }} />
    </Stack>
  );
}
