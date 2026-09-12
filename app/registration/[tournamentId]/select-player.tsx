import { useEffect, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { Button } from '@/components/Button';
import { colors, radius, spacing, typography } from '@/theme/colors';
import { useFamilyStore } from '@/store/familyStore';
import { useRegistrationDraftStore } from '@/store/registrationDraftStore';
import { getTournament } from '@/services/tournaments';
import type { Tournament } from '@/types';

export default function SelectPlayerScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { tournamentId } = useLocalSearchParams<{ tournamentId: string }>();
  const players = useFamilyStore((s) => s.players);
  const setPlayerId = useRegistrationDraftStore((s) => s.setPlayerId);
  const selectedPlayerId = useRegistrationDraftStore((s) => s.playerId);
  const [tournament, setTournament] = useState<Tournament | null>(null);

  useEffect(() => {
    getTournament(tournamentId).then((result) => setTournament(result ?? null));
  }, [tournamentId]);

  const handleContinue = () => {
    if (!selectedPlayerId) return;
    router.push(`/registration/${tournamentId}/waivers`);
  };

  return (
    <Screen>
      <Text style={styles.title}>{t('registration.selectPlayerTitle')}</Text>
      <Text style={styles.subtitle}>
        {t('registration.selectPlayerSubtitle', { tournament: tournament?.name ?? '' })}
      </Text>

      {players.map((player) => {
        const selected = player.id === selectedPlayerId;
        return (
          <Pressable
            key={player.id}
            style={[styles.playerRow, selected && styles.playerRowSelected]}
            onPress={() => setPlayerId(player.id)}
          >
            {player.photoUrl ? (
              <Image source={{ uri: player.photoUrl }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitial}>{player.fullName.charAt(0)}</Text>
              </View>
            )}
            <View style={styles.playerInfo}>
              <Text style={styles.playerName}>{player.fullName}</Text>
              <Text style={styles.playerMeta}>{player.category} · {t(`player.position_${player.position}`)}</Text>
            </View>
            {selected && <Ionicons name="checkmark-circle" size={22} color={colors.primary} />}
          </Pressable>
        );
      })}

      <Pressable
        style={styles.addPlayerRow}
        onPress={() => router.push('/(tabs)/account/add-player')}
      >
        <Ionicons name="add-circle-outline" size={20} color={colors.accent} />
        <Text style={styles.addPlayerText}>{t('registration.addPlayerCta')}</Text>
      </Pressable>

      <Button title={t('common.continue')} onPress={handleContinue} disabled={!selectedPlayerId} style={styles.cta} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.h2, color: colors.textPrimary, marginBottom: spacing.xs },
  subtitle: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.lg },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  playerRowSelected: { borderColor: colors.primary, borderWidth: 2 },
  avatar: { width: 48, height: 48, borderRadius: 24, marginRight: spacing.sm },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  avatarInitial: { ...typography.h3, color: colors.accent },
  playerInfo: { flex: 1 },
  playerName: { ...typography.bodyBold, color: colors.textPrimary },
  playerMeta: { ...typography.caption, color: colors.textSecondary },
  addPlayerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginVertical: spacing.md },
  addPlayerText: { ...typography.bodyBold, color: colors.accent },
  cta: { marginTop: spacing.md },
});
