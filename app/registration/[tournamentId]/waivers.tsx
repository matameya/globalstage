import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { FormField, TextField } from '@/components/FormField';
import { Button } from '@/components/Button';
import { colors, spacing, typography } from '@/theme/colors';
import { useRegistrationDraftStore } from '@/store/registrationDraftStore';

function CheckboxRow({ checked, onToggle, label }: { checked: boolean; onToggle: () => void; label: string }) {
  return (
    <Pressable onPress={onToggle} style={styles.checkboxRow}>
      <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
        {checked && <Ionicons name="checkmark" size={16} color={colors.white} />}
      </View>
      <Text style={styles.checkboxLabel}>{label}</Text>
    </Pressable>
  );
}

export default function WaiversScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { tournamentId } = useLocalSearchParams<{ tournamentId: string }>();
  const waivers = useRegistrationDraftStore((s) => s.waivers);
  const setWaivers = useRegistrationDraftStore((s) => s.setWaivers);

  const [medicalConsent, setMedicalConsent] = useState(waivers.medicalConsent);
  const [imageRelease, setImageRelease] = useState(waivers.imageRelease);
  const [emergencyContactName, setEmergencyContactName] = useState(waivers.emergencyContactName);
  const [emergencyContactPhone, setEmergencyContactPhone] = useState(waivers.emergencyContactPhone);
  const [emergencyContactRelationship, setEmergencyContactRelationship] = useState(
    waivers.emergencyContactRelationship
  );
  const [medicalNotes, setMedicalNotes] = useState(waivers.medicalNotes);

  const canContinue =
    medicalConsent &&
    imageRelease &&
    emergencyContactName.trim().length > 1 &&
    emergencyContactPhone.trim().length >= 7 &&
    emergencyContactRelationship.trim().length > 1;

  const handleContinue = () => {
    setWaivers({
      medicalConsent,
      imageRelease,
      emergencyContactName: emergencyContactName.trim(),
      emergencyContactPhone: emergencyContactPhone.trim(),
      emergencyContactRelationship: emergencyContactRelationship.trim(),
      medicalNotes: medicalNotes.trim(),
    });
    router.push(`/registration/${tournamentId}/payment`);
  };

  return (
    <Screen>
      <Text style={styles.title}>{t('registration.waiversTitle')}</Text>

      <CheckboxRow checked={medicalConsent} onToggle={() => setMedicalConsent((v) => !v)} label={t('registration.medicalConsent')} />
      <CheckboxRow checked={imageRelease} onToggle={() => setImageRelease((v) => !v)} label={t('registration.imageRelease')} />

      <Text style={styles.sectionTitle}>{t('registration.emergencyContact')}</Text>
      <FormField label={t('registration.emergencyContactName')}>
        <TextField value={emergencyContactName} onChangeText={setEmergencyContactName} autoCapitalize="words" />
      </FormField>
      <FormField label={t('registration.emergencyContactPhone')}>
        <TextField value={emergencyContactPhone} onChangeText={setEmergencyContactPhone} keyboardType="phone-pad" />
      </FormField>
      <FormField label={t('registration.emergencyContactRelationship')}>
        <TextField value={emergencyContactRelationship} onChangeText={setEmergencyContactRelationship} />
      </FormField>
      <FormField label={t('registration.medicalNotes')} optional>
        <TextField value={medicalNotes} onChangeText={setMedicalNotes} multiline numberOfLines={3} />
      </FormField>

      <Button title={t('common.continue')} onPress={handleContinue} disabled={!canContinue} style={styles.cta} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.h2, color: colors.textPrimary, marginBottom: spacing.md },
  sectionTitle: { ...typography.h3, color: colors.textPrimary, marginTop: spacing.md, marginBottom: spacing.sm },
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
  cta: { marginTop: spacing.lg },
});
