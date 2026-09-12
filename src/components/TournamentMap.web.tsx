import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import type { Tournament } from '@/types';
import { colors, radius, spacing, typography } from '@/theme/colors';

/**
 * react-native-maps has no first-class web renderer in this project setup.
 * The web build falls back to a simple location list so Discover still works
 * when previewed with `expo start --web`; iOS/Android get the real map.
 */
export function TournamentMap({
  tournaments,
  onSelect,
}: {
  tournaments: Tournament[];
  onSelect: (id: string) => void;
}) {
  return (
    <FlatList
      data={tournaments}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => (
        <Pressable style={styles.row} onPress={() => onSelect(item.id)}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.location}>{item.city}, {item.stateOrProvince}</Text>
        </Pressable>
      )}
      ListHeaderComponent={
        <View style={styles.notice}>
          <Text style={styles.noticeText}>Interactive map view is available in the iOS and Android app.</Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.md },
  notice: { backgroundColor: colors.accentSoft, borderRadius: radius.md, padding: spacing.sm, marginBottom: spacing.md },
  noticeText: { ...typography.caption, color: colors.primary },
  row: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  name: { ...typography.bodyBold, color: colors.textPrimary },
  location: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
});
