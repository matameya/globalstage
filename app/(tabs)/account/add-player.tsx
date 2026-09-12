import { StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Screen } from '@/components/Screen';
import { PlayerForm, type PlayerFormValues } from '@/components/PlayerForm';
import { colors, spacing, typography } from '@/theme/colors';
import { useFamilyStore } from '@/store/familyStore';

export default function AddPlayerScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const addPlayer = useFamilyStore((s) => s.addPlayer);

  const handleSubmit = (values: PlayerFormValues) => {
    addPlayer(values);
    router.back();
  };

  return (
    <Screen>
      <Text style={styles.title}>{t('player.addTitle')}</Text>
      <PlayerForm submitLabel={t('player.save')} onSubmit={handleSubmit} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.h2, color: colors.textPrimary, marginBottom: spacing.lg },
});
