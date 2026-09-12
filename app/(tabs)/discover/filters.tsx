import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Screen } from '@/components/Screen';
import { FormField } from '@/components/FormField';
import { Chip } from '@/components/Chip';
import { Button } from '@/components/Button';
import { colors, radius, spacing, typography } from '@/theme/colors';
import { useDiscoverFiltersStore } from '@/store/discoverFiltersStore';
import { listAvailableStates } from '@/services/tournaments';
import { formatDate } from '@/utils/format';
import type { PlayerCategory, PlayerLevel, TournamentFormat, TournamentGender } from '@/types';

const categories: PlayerCategory[] = ['U8', 'U9', 'U10', 'U11', 'U12', 'U13', 'U14', 'U15', 'U16', 'U17', 'U18'];
const levels: PlayerLevel[] = ['recreational', 'competitive', 'elite', 'academy'];
const formats: TournamentFormat[] = ['7v7', '9v9', '11v11'];
const genders: TournamentGender[] = ['boys', 'girls', 'coed'];

export default function FiltersScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const filters = useDiscoverFiltersStore((s) => s.filters);
  const setFilters = useDiscoverFiltersStore((s) => s.setFilters);
  const reset = useDiscoverFiltersStore((s) => s.reset);

  const [dateFrom, setDateFrom] = useState<string | null>(filters.dateFrom);
  const [dateTo, setDateTo] = useState<string | null>(filters.dateTo);
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);
  const [stateOrProvince, setStateOrProvince] = useState<string | null>(filters.stateOrProvince);
  const [categoriesSelected, setCategoriesSelected] = useState<PlayerCategory[]>(filters.categories);
  const [level, setLevel] = useState<PlayerLevel | null>(filters.level);
  const [format, setFormat] = useState<TournamentFormat | null>(filters.format);
  const [gender, setGender] = useState<TournamentGender | null>(filters.gender);

  const states = listAvailableStates();

  const toggleCategory = (c: PlayerCategory) => {
    setCategoriesSelected((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));
  };

  const handleApply = () => {
    setFilters({ dateFrom, dateTo, stateOrProvince, categories: categoriesSelected, level, format, gender });
    router.back();
  };

  const handleReset = () => {
    reset();
    router.back();
  };

  return (
    <Screen>
      <Text style={styles.title}>{t('filters.title')}</Text>

      <FormField label={t('filters.dateRange')}>
        <View style={styles.dateRow}>
          <Pressable style={styles.dateButton} onPress={() => setShowFromPicker(true)}>
            <Text style={styles.dateButtonText}>{dateFrom ? formatDate(dateFrom) : 'From'}</Text>
          </Pressable>
          <Pressable style={styles.dateButton} onPress={() => setShowToPicker(true)}>
            <Text style={styles.dateButtonText}>{dateTo ? formatDate(dateTo) : 'To'}</Text>
          </Pressable>
        </View>
        {showFromPicker && (
          <DateTimePicker
            value={dateFrom ? new Date(dateFrom) : new Date()}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(_, selected) => {
              setShowFromPicker(Platform.OS === 'ios');
              if (selected) setDateFrom(selected.toISOString().slice(0, 10));
            }}
          />
        )}
        {showToPicker && (
          <DateTimePicker
            value={dateTo ? new Date(dateTo) : new Date()}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(_, selected) => {
              setShowToPicker(Platform.OS === 'ios');
              if (selected) setDateTo(selected.toISOString().slice(0, 10));
            }}
          />
        )}
      </FormField>

      <FormField label={t('filters.location')}>
        <View style={styles.chipRow}>
          <Chip label={t('filters.anyLocation')} selected={!stateOrProvince} onPress={() => setStateOrProvince(null)} />
          {states.map((s) => (
            <Chip key={s} label={s} selected={stateOrProvince === s} onPress={() => setStateOrProvince(s)} />
          ))}
        </View>
      </FormField>

      <FormField label={t('filters.category')}>
        <View style={styles.chipRow}>
          {categories.map((c) => (
            <Chip key={c} label={c} selected={categoriesSelected.includes(c)} onPress={() => toggleCategory(c)} />
          ))}
        </View>
      </FormField>

      <FormField label={t('filters.level')}>
        <View style={styles.chipRow}>
          <Chip label={t('filters.anyLevel')} selected={!level} onPress={() => setLevel(null)} />
          {levels.map((l) => (
            <Chip key={l} label={t(`player.level_${l}`)} selected={level === l} onPress={() => setLevel(l)} />
          ))}
        </View>
      </FormField>

      <FormField label={t('filters.format')}>
        <View style={styles.chipRow}>
          <Chip label={t('filters.anyFormat')} selected={!format} onPress={() => setFormat(null)} />
          {formats.map((f) => (
            <Chip key={f} label={f} selected={format === f} onPress={() => setFormat(f)} />
          ))}
        </View>
      </FormField>

      <FormField label={t('filters.gender')}>
        <View style={styles.chipRow}>
          <Chip label={t('filters.anyGender')} selected={!gender} onPress={() => setGender(null)} />
          {genders.map((g) => (
            <Chip key={g} label={t(`filters.gender_${g}`)} selected={gender === g} onPress={() => setGender(g)} />
          ))}
        </View>
      </FormField>

      <Button title={t('filters.apply')} onPress={handleApply} style={styles.applyButton} />
      <Button title={t('filters.reset')} onPress={handleReset} variant="ghost" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.h2, color: colors.textPrimary, marginBottom: spacing.md },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap' },
  dateRow: { flexDirection: 'row', gap: spacing.sm },
  dateButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    backgroundColor: colors.surface,
  },
  dateButtonText: { ...typography.body, color: colors.textPrimary },
  applyButton: { marginTop: spacing.md, marginBottom: spacing.sm },
});
