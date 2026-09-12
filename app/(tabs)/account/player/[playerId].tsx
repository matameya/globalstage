import { StyleSheet, Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Screen } from '@/components/Screen';
import { PlayerForm, type PlayerFormValues } from '@/components/PlayerForm';
import { Button } from '@/components/Button';
import { colors, spacing, typography } from '@/theme/colors';
import { useFamilyStore } from '@/store/familyStore';

export default function PlayerDetailScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { playerId } = useLocalSearchParams<{ playerId: string }>();
  const player = useFamilyStore((s) => s.players.find((p) => p.id === playerId));
  const updatePlayer = useFamilyStore((s) => s.updatePlayer);
  const removePlayer = useFamilyStore((s) => s.removePlayer);

  if (!player) return null;

  const handleSubmit = (values: PlayerFormValues) => {
    updatePlayer(player.id, values);
    router.back();
  };

  const handleRemove = () => {
    removePlayer(player.id);
    router.back();
  };

  return (
    <Screen>
      <Text style={styles.title}>{t('player.editTitle')}</Text>
      <PlayerForm initial={player} submitLabel={t('common.save')} onSubmit={handleSubmit} />
      <Button title="Remove player" onPress={handleRemove} variant="danger" style={styles.removeButton} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.h2, color: colors.textPrimary, marginBottom: spacing.lg },
  removeButton: { marginTop: spacing.md },
});
