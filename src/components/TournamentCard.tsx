import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { Tournament } from '@/types';
import { colors, radius, spacing, typography } from '@/theme/colors';
import { formatCurrency, formatDateRange } from '@/utils/format';

export function TournamentCard({ tournament, onPress }: { tournament: Tournament; onPress: () => void }) {
  const { t } = useTranslation();
  const lowSpots = tournament.spotsAvailable <= 10;

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <Image source={{ uri: tournament.heroImageUrl }} style={styles.image} />
      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={1}>{tournament.name}</Text>
        <Text style={styles.location}>{tournament.city}, {tournament.stateOrProvince}</Text>
        <Text style={styles.dates}>{formatDateRange(tournament.startDate, tournament.endDate)}</Text>
        <View style={styles.footerRow}>
          <Text style={styles.price}>{formatCurrency(tournament.price, tournament.currency)}</Text>
          <Text style={[styles.spots, lowSpots && styles.spotsLow]}>
            {lowSpots
              ? t('discover.spotsFew', { count: tournament.spotsAvailable })
              : t('discover.spotsLeft', { count: tournament.spotsAvailable })}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    marginBottom: spacing.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: { opacity: 0.9 },
  image: { width: '100%', height: 140, backgroundColor: colors.border },
  body: { padding: spacing.md },
  name: { ...typography.h3, color: colors.textPrimary },
  location: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  dates: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  price: { ...typography.bodyBold, color: colors.primary },
  spots: { ...typography.small, color: colors.textMuted },
  spotsLow: { color: colors.warning },
});
