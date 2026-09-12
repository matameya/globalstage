import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { colors, spacing, typography } from '@/theme/colors';
import { useFamilyStore } from '@/store/familyStore';

function CheckboxRow({
  checked,
  onToggle,
  label,
}: {
  checked: boolean;
  onToggle: () => void;
  label: string;
}) {
  return (
    <Pressable onPress={onToggle} style={styles.checkboxRow}>
      <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
        {checked && <Ionicons name="checkmark" size={16} color={colors.white} />}
      </View>
      <Text style={styles.checkboxLabel}>{label}</Text>
    </Pressable>
  );
}

export default function ConsentScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const recordConsent = useFamilyStore((s) => s.recordConsent);

  const [parentalChecked, setParentalChecked] = useState(false);
  const [privacyChecked, setPrivacyChecked] = useState(false);

  const canContinue = parentalChecked && privacyChecked;

  const handleContinue = () => {
    recordConsent('parentalConsent');
    recordConsent('privacyPolicy');
    recordConsent('terms');
    router.push('/onboarding/add-player');
  };

  return (
    <Screen>
      <Text style={styles.title}>{t('consent.title')}</Text>
      <Card style={styles.introCard}>
        <Text style={styles.intro}>{t('consent.intro')}</Text>
        <Text style={styles.bullet}>{'•'} {t('consent.bullet1')}</Text>
        <Text style={styles.bullet}>{'•'} {t('consent.bullet2')}</Text>
        <Text style={styles.bullet}>{'•'} {t('consent.bullet3')}</Text>
      </Card>

      <CheckboxRow checked={parentalChecked} onToggle={() => setParentalChecked((v) => !v)} label={t('consent.acceptParental')} />
      <CheckboxRow checked={privacyChecked} onToggle={() => setPrivacyChecked((v) => !v)} label={t('consent.acceptPrivacy')} />

      <Button title={t('consent.continueButton')} onPress={handleContinue} disabled={!canContinue} style={styles.cta} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.h2, color: colors.textPrimary, marginBottom: spacing.md },
  introCard: { marginBottom: spacing.lg },
  intro: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.sm },
  bullet: { ...typography.caption, color: colors.textSecondary, marginBottom: spacing.xs },
  checkboxRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing.md },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border,
    marginRight: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxChecked: { backgroundColor: colors.primary, borderColor: colors.primary },
  checkboxLabel: { ...typography.body, color: colors.textPrimary, flex: 1 },
  cta: { marginTop: spacing.md },
});
