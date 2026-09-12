import { useEffect, useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Chip } from '@/components/Chip';
import { ContentCard } from '@/components/ContentCard';
import { EmptyState } from '@/components/EmptyState';
import { colors, spacing, typography } from '@/theme/colors';
import { listContent, listTopics } from '@/services/content';
import type { ContentItem } from '@/types';

export default function ContentFeedScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [items, setItems] = useState<ContentItem[]>([]);
  const [topic, setTopic] = useState<string | null>(null);

  useEffect(() => {
    listContent(topic ? { topic } : undefined).then(setItems);
  }, [topic]);

  const topics = useMemo(() => listTopics(), []);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('content.title')}</Text>
        <Text style={styles.subtitle}>{t('content.subtitle')}</Text>
        <View style={styles.chipRow}>
          <Chip label={t('content.allTopics')} selected={!topic} onPress={() => setTopic(null)} />
          {topics.map((tp) => (
            <Chip key={tp} label={tp} selected={topic === tp} onPress={() => setTopic(tp)} />
          ))}
        </View>
      </View>

      {items.length === 0 ? (
        <EmptyState title={t('discover.noResults')} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <ContentCard item={item} onPress={() => router.push(`/(tabs)/content/${item.id}`)} />
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: spacing.md, paddingTop: spacing.sm },
  title: { ...typography.h1, color: colors.textPrimary },
  subtitle: { ...typography.body, color: colors.textSecondary, marginTop: spacing.xs, marginBottom: spacing.sm },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: spacing.xs },
  listContent: { padding: spacing.md, paddingTop: spacing.xs },
});
