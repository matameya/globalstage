import { useState } from 'react';
import { Image, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { FormField, TextField } from './FormField';
import { Chip } from './Chip';
import { Button } from './Button';
import { colors, radius, spacing, typography } from '@/theme/colors';
import { calculateCategory } from '@/utils/category';
import { formatDate } from '@/utils/format';
import type { Player, PlayerPosition, PlayingFoot, PlayerLevel } from '@/types';

const positions: PlayerPosition[] = ['goalkeeper', 'defender', 'midfielder', 'forward', 'flexible'];
const feet: PlayingFoot[] = ['left', 'right', 'both'];
const levels: PlayerLevel[] = ['recreational', 'competitive', 'elite', 'academy'];

export interface PlayerFormValues {
  fullName: string;
  dateOfBirth: string;
  position: PlayerPosition;
  foot: PlayingFoot;
  club: string | null;
  level: PlayerLevel;
  photoUrl: string | null;
}

const defaultDob = new Date();
defaultDob.setFullYear(defaultDob.getFullYear() - 10);

export function PlayerForm({
  initial,
  submitLabel,
  onSubmit,
}: {
  initial?: Partial<Player>;
  submitLabel: string;
  onSubmit: (values: PlayerFormValues) => void;
}) {
  const { t } = useTranslation();
  const [fullName, setFullName] = useState(initial?.fullName ?? '');
  const [dateOfBirth, setDateOfBirth] = useState<Date>(
    initial?.dateOfBirth ? new Date(initial.dateOfBirth) : defaultDob
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [position, setPosition] = useState<PlayerPosition>(initial?.position ?? 'flexible');
  const [foot, setFoot] = useState<PlayingFoot>(initial?.foot ?? 'right');
  const [club, setClub] = useState(initial?.club ?? '');
  const [level, setLevel] = useState<PlayerLevel>(initial?.level ?? 'recreational');
  const [photoUrl, setPhotoUrl] = useState<string | null>(initial?.photoUrl ?? null);

  const dobIso = dateOfBirth.toISOString().slice(0, 10);
  const category = calculateCategory(dobIso);
  const canSubmit = fullName.trim().length > 1;

  const pickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      setPhotoUrl(result.assets[0].uri);
    }
  };

  const handleSubmit = () => {
    onSubmit({
      fullName: fullName.trim(),
      dateOfBirth: dobIso,
      position,
      foot,
      club: club.trim() || null,
      level,
      photoUrl,
    });
  };

  return (
    <View>
      <Pressable onPress={pickPhoto} style={styles.photoPicker}>
        {photoUrl ? (
          <Image source={{ uri: photoUrl }} style={styles.photo} />
        ) : (
          <Text style={styles.photoPlaceholder}>{t('player.photo')}</Text>
        )}
      </Pressable>

      <FormField label={t('player.fullName')}>
        <TextField value={fullName} onChangeText={setFullName} autoCapitalize="words" placeholder="Leo Rivera" />
      </FormField>

      <FormField label={t('player.dateOfBirth')}>
        <Pressable onPress={() => setShowDatePicker(true)} style={styles.dateButton}>
          <Text style={styles.dateButtonText}>{formatDate(dobIso)}</Text>
        </Pressable>
        {showDatePicker && (
          <DateTimePicker
            value={dateOfBirth}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            maximumDate={new Date()}
            onChange={(_, selected) => {
              setShowDatePicker(Platform.OS === 'ios');
              if (selected) setDateOfBirth(selected);
            }}
          />
        )}
        <Text style={styles.categoryPreview}>{t('player.categoryPreview', { category })}</Text>
      </FormField>

      <FormField label={t('player.position')}>
        <View style={styles.chipRow}>
          {positions.map((p) => (
            <Chip key={p} label={t(`player.position_${p}`)} selected={position === p} onPress={() => setPosition(p)} />
          ))}
        </View>
      </FormField>

      <FormField label={t('player.foot')}>
        <View style={styles.chipRow}>
          {feet.map((f) => (
            <Chip key={f} label={t(`player.foot_${f}`)} selected={foot === f} onPress={() => setFoot(f)} />
          ))}
        </View>
      </FormField>

      <FormField label={t('player.club')} optional>
        <TextField value={club} onChangeText={setClub} placeholder="FC Orlando" />
      </FormField>

      <FormField label={t('player.level')}>
        <View style={styles.chipRow}>
          {levels.map((l) => (
            <Chip key={l} label={t(`player.level_${l}`)} selected={level === l} onPress={() => setLevel(l)} />
          ))}
        </View>
      </FormField>

      <Button title={submitLabel} onPress={handleSubmit} disabled={!canSubmit} style={styles.submit} />
    </View>
  );
}

const styles = StyleSheet.create({
  photoPicker: {
    alignSelf: 'center',
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
  photo: { width: 96, height: 96 },
  photoPlaceholder: { ...typography.small, color: colors.accent, textAlign: 'center', paddingHorizontal: spacing.xs },
  dateButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    backgroundColor: colors.surface,
  },
  dateButtonText: { ...typography.body, color: colors.textPrimary },
  categoryPreview: { ...typography.caption, color: colors.accent, marginTop: spacing.xs },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap' },
  submit: { marginTop: spacing.md },
});
