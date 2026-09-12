import { useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { TextField } from '@/components/FormField';
import { TournamentCard } from '@/components/TournamentCard';
import { EmptyState } from '@/components/EmptyState';
import { colors, radius, spacing, typography } from '@/theme/colors';
import { listTournaments } from '@/services/tournaments';
import { useDiscoverFiltersStore, countActiveFilters } from '@/store/discoverFiltersStore';
import type { Tournament } from '@/types';
import { TournamentMap } from '@/components/TournamentMap';

export default function DiscoverScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const filters = useDiscoverFiltersStore((s) => s.filters);
  const [search, setSearch] = useState('');
  const [view, setView] = useState<'list' | 'map'>('list');
  const [tournaments, setTournaments] = useState<Tournament[]>([]);

  useEffect(() => {
    listTournaments(filters).then(setTournaments);
  }, [filters]);

  const filtered = useMemo(() => {
    if (!search.trim()) return tournaments;
    const q = search.trim().toLowerCase();
    return tournaments.filter(
      (tItem) => tItem.name.toLowerCase().includes(q) || tItem.city.toLowerCase().includes(q)
    );
  }, [tournaments, search]);

  const activeFilterCount = countActiveFilters(filters);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('discover.title')}</Text>
        <View style={styles.searchRow}>
          <TextField
            value={search}
            onChangeText={setSearch}
            placeholder={t('discover.searchPlaceholder') ?? ''}
            style={styles.search}
          />
          <Pressable style={styles.filterButton} onPress={() => router.push('/(tabs)/discover/filters')}>
            <Ionicons name="options-outline" size={20} color={colors.primary} />
            {activeFilterCount > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
              </View>
            )}
          </Pressable>
        </View>

        <View style={styles.toggleRow}>
          <Pressable
            style={[styles.toggleButton, view === 'list' && styles.toggleButtonActive]}
            onPress={() => setView('list')}
          >
            <Text style={[styles.toggleLabel, view === 'list' && styles.toggleLabelActive]}>
              {t('discover.listView')}
            </Text>
          </Pressable>
          <Pressable
            style={[styles.toggleButton, view === 'map' && styles.toggleButtonActive]}
            onPress={() => setView('map')}
          >
            <Text style={[styles.toggleLabel, view === 'map' && styles.toggleLabelActive]}>
              {t('discover.mapView')}
            </Text>
          </Pressable>
        </View>
      </View>

      {filtered.length === 0 ? (
        <EmptyState title={t('discover.noResults')} />
      ) : view === 'list' ? (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TournamentCard
              tournament={item}
              onPress={() => router.push(`/(tabs)/discover/${item.id}`)}
            />
          )}
        />
      ) : (
        <TournamentMap
          tournaments={filtered}
          onSelect={(id) => router.push(`/(tabs)/discover/${id}`)}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: spacing.md, paddingTop: spacing.sm },
  title: { ...typography.h1, color: colors.textPrimary, marginBottom: spacing.md },
  searchRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  search: { flex: 1, marginRight: spacing.sm },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.accent,
    borderRadius: radius.pill,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  filterBadgeText: { color: colors.white, fontSize: 11, fontWeight: '700' },
  toggleRow: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 3,
    marginBottom: spacing.sm,
  },
  toggleButton: { flex: 1, paddingVertical: spacing.xs, borderRadius: radius.pill, alignItems: 'center' },
  toggleButtonActive: { backgroundColor: colors.primary },
  toggleLabel: { ...typography.bodyBold, color: colors.textSecondary },
  toggleLabelActive: { color: colors.white },
  listContent: { padding: spacing.md, paddingTop: spacing.xs },
});
