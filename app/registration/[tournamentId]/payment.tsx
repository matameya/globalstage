import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Screen } from '@/components/Screen';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { colors, radius, spacing, typography } from '@/theme/colors';
import { getTournament } from '@/services/tournaments';
import { buildPaymentSchedule } from '@/services/paymentPlan';
import { simulateChargeCard } from '@/lib/stripe';
import { useRegistrationDraftStore } from '@/store/registrationDraftStore';
import { useRegistrationStore } from '@/store/registrationStore';
import { useNotificationStore } from '@/store/notificationStore';
import { formatCurrency, formatDate } from '@/utils/format';
import type { PaymentPlanType, Tournament } from '@/types';

export default function PaymentScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { tournamentId } = useLocalSearchParams<{ tournamentId: string }>();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [plan, setPlan] = useState<PaymentPlanType>('deposit_plus_installments');
  const [processing, setProcessing] = useState(false);

  const playerId = useRegistrationDraftStore((s) => s.playerId);
  const waivers = useRegistrationDraftStore((s) => s.waivers);
  const resetDraft = useRegistrationDraftStore((s) => s.reset);
  const createRegistration = useRegistrationStore((s) => s.createRegistration);
  const markDepositPaid = useRegistrationStore((s) => s.markDepositPaid);
  const addNotification = useNotificationStore((s) => s.addNotification);

  useEffect(() => {
    getTournament(tournamentId).then((result) => setTournament(result ?? null));
  }, [tournamentId]);

  const schedule = useMemo(() => (tournament ? buildPaymentSchedule(tournament, plan) : []), [tournament, plan]);
  const dueNow = schedule[0];

  const handlePayNow = async () => {
    if (!tournament || !playerId || !dueNow) return;
    setProcessing(true);
    try {
      await simulateChargeCard({
        amount: dueNow.amount,
        currency: tournament.currency.toLowerCase() as 'usd' | 'cad',
        description: `${tournament.name} - ${dueNow.label}`,
      });

      const registration = createRegistration({ playerId, tournamentId: tournament.id, waivers, paymentPlan: plan });
      markDepositPaid(registration.id);
      addNotification({
        title: 'Payment received',
        body: `Your ${dueNow.label.toLowerCase()} for ${tournament.name} was successful.`,
        kind: 'payment_reminder',
      });
      resetDraft();
      router.replace(`/registration/${tournament.id}/confirmation?registrationId=${registration.id}`);
    } finally {
      setProcessing(false);
    }
  };

  if (!tournament) return null;

  return (
    <Screen>
      <Text style={styles.title}>{t('registration.paymentTitle')}</Text>

      <Pressable
        style={[styles.planCard, plan === 'deposit_plus_installments' && styles.planCardSelected]}
        onPress={() => setPlan('deposit_plus_installments')}
      >
        <Text style={styles.planTitle}>{t('registration.planDeposit')}</Text>
        <Text style={styles.planBody}>{t('registration.planDepositBody')}</Text>
      </Pressable>

      <Pressable
        style={[styles.planCard, plan === 'full' && styles.planCardSelected]}
        onPress={() => setPlan('full')}
      >
        <Text style={styles.planTitle}>{t('registration.planFull')}</Text>
        <Text style={styles.planBody}>{t('registration.planFullBody')}</Text>
      </Pressable>

      <Text style={styles.sectionTitle}>{t('registration.scheduleTitle')}</Text>
      <Card>
        {schedule.map((item, index) => (
          <View key={item.id} style={[styles.scheduleRow, index > 0 && styles.scheduleRowBorder]}>
            <View>
              <Text style={styles.scheduleLabel}>{item.label}</Text>
              <Text style={styles.scheduleDate}>{formatDate(item.dueDate)}</Text>
            </View>
            <Text style={styles.scheduleAmount}>{formatCurrency(item.amount, tournament.currency)}</Text>
          </View>
        ))}
      </Card>

      <Button
        title={
          processing
            ? t('registration.processing')
            : t('registration.payNow', { amount: formatCurrency(dueNow?.amount ?? 0, tournament.currency) })
        }
        onPress={handlePayNow}
        loading={processing}
        style={styles.cta}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.h2, color: colors.textPrimary, marginBottom: spacing.md },
  planCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.surface,
  },
  planCardSelected: { borderColor: colors.primary, borderWidth: 2 },
  planTitle: { ...typography.bodyBold, color: colors.textPrimary },
  planBody: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  sectionTitle: { ...typography.h3, color: colors.textPrimary, marginTop: spacing.lg, marginBottom: spacing.sm },
  scheduleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.sm },
  scheduleRowBorder: { borderTopWidth: 1, borderTopColor: colors.border },
  scheduleLabel: { ...typography.bodyBold, color: colors.textPrimary },
  scheduleDate: { ...typography.caption, color: colors.textSecondary },
  scheduleAmount: { ...typography.bodyBold, color: colors.primary },
  cta: { marginTop: spacing.lg },
});
