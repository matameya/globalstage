import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Screen } from '@/components/Screen';
import { FormField, TextField } from '@/components/FormField';
import { Button } from '@/components/Button';
import { colors, spacing, typography } from '@/theme/colors';
import { useFamilyStore } from '@/store/familyStore';

export default function SignupScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const createGuardian = useFamilyStore((s) => s.createGuardian);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const canSubmit = fullName.trim().length > 1 && email.includes('@') && phone.trim().length >= 7;

  const handleSubmit = () => {
    createGuardian({ fullName: fullName.trim(), email: email.trim(), phone: phone.trim() });
    router.push('/onboarding/consent');
  };

  return (
    <Screen>
      <Text style={styles.title}>{t('auth.createAccountTitle')}</Text>
      <Text style={styles.subtitle}>{t('auth.createAccountSubtitle')}</Text>

      <FormField label={t('auth.fullName')}>
        <TextField value={fullName} onChangeText={setFullName} autoCapitalize="words" placeholder="Jane Rivera" />
      </FormField>
      <FormField label={t('auth.email')}>
        <TextField
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="jane@example.com"
        />
      </FormField>
      <FormField label={t('auth.phone')}>
        <TextField value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="(555) 123-4567" />
      </FormField>

      <Button title={t('auth.createAccount')} onPress={handleSubmit} disabled={!canSubmit} style={styles.cta} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.h2, color: colors.textPrimary, marginBottom: spacing.xs },
  subtitle: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.lg },
  cta: { marginTop: spacing.md },
});
