import { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { Card } from '@/components/Card';
import { Chip } from '@/components/Chip';
import { Button } from '@/components/Button';
import { colors, spacing, typography } from '@/theme/colors';
import { getTournament } from '@/services/tournaments';
import { formatCurrency, formatDate, formatDateRange } from '@/utils/format';
import type { Tournament } from '@/types';

export default function TournamentDetailScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { tournamentId } = useLocalSearchParams<{ tournamentId: string }>();
  const [tournament, setTournament] = useState<Tournament | null>(null);

  useEffect(() => {
    getTournament(tournamentId).then((result) => setTournament(result ?? null));
  }, [tournamentId]);

  if (!tournament) return null;

  const isFull = tournament.spotsAvailable <= 0;

  return (
    <Screen padded={false}>
      <Image source={{ uri: tournament.heroImageUrl }} style={styles.hero} />
      <View style={styles.content}>
        <Text style={styles.name}>{tournament.name}</Text>
        <View style={styles.metaRow}>
          <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
          <Text style={styles.metaText}>{tournament.venue}, {tournament.city}, {tournament.stateOrProvince}</Text>
        </View>
        <View style={styles.metaRow}>
          <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
          <Text style={styles.metaText}>{formatDateRange(tournament.startDate, tournament.endDate)}</Text>
        </View>

        <Card style={styles.priceCard}>
          <View style={styles.priceRow}>
            <View>
              <Text style={styles.priceLabel}>{t('tournamentDetail.price')}</Text>
              <Text style={styles.priceValue}>{formatCurrency(tournament.price, tournament.currency)}</Text>
            </View>
            <View style={styles.priceDivider} />
            <View>
              <Text style={styles.priceLabel}>{t('tournamentDetail.deadline')}</Text>
              <Text style={styles.priceValue}>{formatDate(tournament.registrationDeadline)}</Text>
            </View>
          </View>
        </Card>

        <Text style={styles.sectionTitle}>{t('tournamentDetail.about')}</Text>
        <Text style={styles.body}>{tournament.description}</Text>

        <Text style={styles.sectionTitle}>{t('tournamentDetail.categories')}</Text>
        <View style={styles.chipRow}>
          {tournament.categories.map((c) => (
            <Chip key={c} label={c} />
          ))}
        </View>

        <Text style={styles.sectionTitle}>{t('tournamentDetail.includes')}</Text>
        {tournament.includes.map((item) => (
          <View key={item} style={styles.includeRow}>
            <Ionicons name="checkmark-circle" size={16} color={colors.success} />
            <Text style={styles.includeText}>{item}</Text>
          </View>
        ))}

        {isFull ? (
          <Text style={styles.fullyBooked}>{t('tournamentDetail.fullyBooked')}</Text>
        ) : (
          <Button
            title={t('tournamentDetail.registerButton')}
            onPress={() => router.push(`/registration/${tournament.id}/select-player`)}
            style={styles.registerButton}
          />
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { width: '100%', height: 220, backgroundColor: colors.border },
  content: { padding: spacing.md },
  name: { ...typography.h2, color: colors.textPrimary, marginBottom: spacing.sm },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xs, gap: spacing.xs },
  metaText: { ...typography.caption, color: colors.textSecondary },
  priceCard: { marginVertical: spacing.md },
  priceRow: { flexDirection: 'row', alignItems: 'center' },
  priceLabel: { ...typography.caption, color: colors.textMuted },
  priceValue: { ...typography.h3, color: colors.textPrimary },
  priceDivider: { width: 1, height: 32, backgroundColor: colors.border, marginHorizontal: spacing.lg },
  sectionTitle: { ...typography.h3, color: colors.textPrimary, marginTop: spacing.lg, marginBottom: spacing.sm },
  body: { ...typography.body, color: colors.textSecondary },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap' },
  includeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xs, gap: spacing.xs },
  includeText: { ...typography.body, color: colors.textSecondary },
  registerButton: { marginTop: spacing.xl },
  fullyBooked: { ...typography.bodyBold, color: colors.danger, marginTop: spacing.xl, textAlign: 'center' },
});
