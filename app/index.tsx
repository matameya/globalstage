import { Redirect } from 'expo-router';
import { hasParentalConsent, useFamilyStore } from '@/store/familyStore';

export default function Index() {
  const guardian = useFamilyStore((s) => s.guardian);
  const players = useFamilyStore((s) => s.players);
  const hasCompletedOnboarding = useFamilyStore((s) => s.hasCompletedOnboarding);

  const isOnboarded = Boolean(guardian) && hasParentalConsent(guardian) && players.length > 0 && hasCompletedOnboarding;

  return <Redirect href={isOnboarded ? '/(tabs)/discover' : '/onboarding'} />;
}
