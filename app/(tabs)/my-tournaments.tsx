import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { colors, radius, spacing, typography } from '@/theme/colors';
import { useRegistrationStore } from '@/store/registrationStore';
import { useFamilyStore } from '@/store/familyStore';
import { getTournamentById } from '@/data/sampleTournaments';
import { formatCurrency, formatDate, daysUntil } from '@/utils/format';
import type { Registration, RegistrationStatus } from '@/types';

const statusLabelKey: Record<RegistrationStatus, string> = {
  confirmed: 'myTournaments.statusConfirmed',
  pending_payment: 'myTournaments.statusPendingPayment',
  cancelled: 'myTournaments.statusCancelled',
  waitlisted: 'myTournaments.statusWaitlisted',
};

const statusColor: Record<RegistrationStatus, string> = {
  confirmed: colors.success,
  pending_payment: colors.warning,
  cancelled: colors.danger,
  waitlisted: colors.textMuted,
};

function RegistrationCard({ registration }: { registration: Registration }) {
  const { t } = useTranslation();
  const tournament = getTournamentById(registration.tournamentId);
  const players = useFamilyStore((s) => s.players);
  const player = players.find((p) => p.id === registration.playerId);

  if (!tournament || !player) return null;

  const nextPayment = registration.paymentSchedule.find((item) => item.status === 'upcoming');
  const days = daysUntil(tournament.startDate);

  return (
    <Card style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.tournamentName} numberOfLines={1}>{tournament.name}</Text>
        <View style={[styles.statusPill, { backgroundColor: statusColor[registration.status] }]}>
          <Text style={styles.statusText}>{t(statusLabelKey[registration.status])}</Text>
        </View>
      </View>
      <Text style={styles.playerName}>{player.fullName} · {player.category}</Text>
      <Text style={styles.countdown}>
        {days >= 0 ? t('myTournaments.daysUntil', { count: days }) : t('myTournaments.daysUntilPast')}
      </Text>

      {nextPayment && (
        <View style={styles.paymentRow}>
          <Text style={styles.paymentLabel}>{t('myTournaments.nextPayment')}</Text>
          <Text style={styles.paymentValue}>
            {formatCurrency(nextPayment.amount, tournament.currency)} · {formatDate(nextPayment.dueDate)}
          </Text>
        </View>
      )}
    </Card>
  );
}

export default function MyTournamentsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const registrations = useRegistrationStore((s) => s.registrations);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Text style={styles.title}>{t('myTournaments.title')}</Text>
      {registrations.length === 0 ? (
        <EmptyState
          title={t('myTournaments.empty')}
          ctaLabel={t('myTournaments.discoverCta')}
          onPressCta={() => router.push('/(tabs)/discover')}
        />
      ) : (
        <FlatList
          data={registrations}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => <RegistrationCard registration={item} />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  title: { ...typography.h1, color: colors.textPrimary, padding: spacing.md, paddingBottom: 0 },
  listContent: { padding: spacing.md },
  card: { marginBottom: spacing.md },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.sm },
  tournamentName: { ...typography.h3, color: colors.textPrimary, flex: 1 },
  statusPill: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.pill },
  statusText: { ...typography.small, color: colors.white },
  playerName: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.xs },
  countdown: { ...typography.caption, color: colors.accent, marginTop: 2 },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  paymentLabel: { ...typography.caption, color: colors.textMuted },
  paymentValue: { ...typography.bodyBold, color: colors.textPrimary },
});
