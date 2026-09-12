import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/Button';
import { colors, spacing, typography } from '@/theme/colors';
import { getTournament } from '@/services/tournaments';
import { useFamilyStore } from '@/store/familyStore';
import { useRegistrationStore } from '@/store/registrationStore';
import type { Tournament } from '@/types';

export default function ConfirmationScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { tournamentId, registrationId } = useLocalSearchParams<{ tournamentId: string; registrationId: string }>();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const players = useFamilyStore((s) => s.players);
  const registration = useRegistrationStore((s) => s.registrations.find((r) => r.id === registrationId));

  useEffect(() => {
    getTournament(tournamentId).then((result) => setTournament(result ?? null));
  }, [tournamentId]);

  const player = players.find((p) => p.id === registration?.playerId);

  if (!tournament || !player) return null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <View style={styles.iconWrap}>
          <Ionicons name="checkmark-circle" size={72} color={colors.success} />
        </View>
        <Text style={styles.title}>{t('registration.confirmationTitle')}</Text>
        <Text style={styles.body}>
          {t('registration.confirmationBody', { player: player.fullName, tournament: tournament.name })}
        </Text>

        <Button
          title={t('registration.backToMyTournaments')}
          onPress={() => router.replace('/(tabs)/my-tournaments')}
          style={styles.cta}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, padding: spacing.lg, alignItems: 'center', justifyContent: 'center' },
  iconWrap: { marginBottom: spacing.lg },
  title: { ...typography.h1, color: colors.textPrimary, textAlign: 'center', marginBottom: spacing.sm },
  body: { ...typography.body, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.xl },
  cta: { minWidth: 220 },
});
