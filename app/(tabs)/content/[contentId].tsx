import { useEffect, useState } from 'react';
import { Alert, Image, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Screen } from '@/components/Screen';
import { Button } from '@/components/Button';
import { colors, spacing, typography } from '@/theme/colors';
import { getContent } from '@/services/content';
import { downloadForOffline, isDownloaded } from '@/lib/downloads';
import type { ContentItem } from '@/types';

const typeLabelKey: Record<ContentItem['type'], string> = {
  tip: 'content.typeTip',
  pdf: 'content.typePdf',
  video: 'content.typeVideo',
};

export default function ContentDetailScreen() {
  const { t } = useTranslation();
  const { contentId } = useLocalSearchParams<{ contentId: string }>();
  const [item, setItem] = useState<ContentItem | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  useEffect(() => {
    getContent(contentId).then((result) => {
      setItem(result ?? null);
      if (result?.type === 'pdf') {
        setDownloaded(isDownloaded(result.id, result.mediaUrl));
      }
    });
  }, [contentId]);

  if (!item) return null;

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await downloadForOffline(item.id, item.mediaUrl);
      setDownloaded(true);
    } catch (error) {
      Alert.alert('Download failed', 'Please check your connection and try again.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Screen padded={false}>
      <Image source={{ uri: item.thumbnailUrl }} style={styles.hero} />
      <View style={styles.content}>
        <Text style={styles.type}>{t(typeLabelKey[item.type]).toUpperCase()}</Text>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.summary}>{item.summary}</Text>

        {item.type === 'pdf' && (
          <Button
            title={downloaded ? t('common.downloaded') : t('content.downloadPdf')}
            onPress={handleDownload}
            loading={downloading}
            disabled={downloaded}
            variant={downloaded ? 'secondary' : 'primary'}
            style={styles.cta}
          />
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { width: '100%', height: 220, backgroundColor: colors.border },
  content: { padding: spacing.md },
  type: { ...typography.small, color: colors.accent, marginTop: spacing.md },
  title: { ...typography.h2, color: colors.textPrimary, marginTop: spacing.xs, marginBottom: spacing.sm },
  summary: { ...typography.body, color: colors.textSecondary },
  cta: { marginTop: spacing.lg },
});
