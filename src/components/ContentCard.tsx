import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { ContentItem } from '@/types';
import { colors, radius, spacing, typography } from '@/theme/colors';

const typeLabelKey: Record<ContentItem['type'], string> = {
  tip: 'content.typeTip',
  pdf: 'content.typePdf',
  video: 'content.typeVideo',
};

export function ContentCard({ item, onPress }: { item: ContentItem; onPress: () => void }) {
  const { t } = useTranslation();
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <Image source={{ uri: item.thumbnailUrl }} style={styles.thumb} />
      <View style={styles.body}>
        <Text style={styles.type}>{t(typeLabelKey[item.type]).toUpperCase()}</Text>
        <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.summary} numberOfLines={2}>{item.summary}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    marginBottom: spacing.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: { opacity: 0.9 },
  thumb: { width: 96, height: 96, backgroundColor: colors.border },
  body: { flex: 1, padding: spacing.sm },
  type: { ...typography.small, color: colors.accent, marginBottom: 2 },
  title: { ...typography.bodyBold, color: colors.textPrimary },
  summary: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
});
