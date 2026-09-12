import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { colors, spacing, typography } from '@/theme/colors';
import { useNotificationStore } from '@/store/notificationStore';
import { formatDate } from '@/utils/format';
import type { AppNotification } from '@/types';

const iconByKind: Record<AppNotification['kind'], string> = {
  payment_reminder: '💳',
  logistics: '🧳',
  content: '🎥',
  general: '⭐',
};

export default function NotificationsScreen() {
  const { t } = useTranslation();
  const notifications = useNotificationStore((s) => s.notifications);
  const markRead = useNotificationStore((s) => s.markRead);

  const markAllRead = () => notifications.forEach((n) => !n.read && markRead(n.id));

  return (
    <Screen scroll={false}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{t('notifications.title')}</Text>
        {notifications.some((n) => !n.read) && (
          <Button title={t('notifications.markAllRead')} onPress={markAllRead} variant="ghost" />
        )}
      </View>
      {notifications.length === 0 ? (
        <EmptyState title={t('notifications.empty')} />
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Card style={[styles.card, !item.read && styles.unreadCard]}>
              <View style={styles.row}>
                <Text style={styles.icon}>{iconByKind[item.kind]}</Text>
                <View style={styles.content}>
                  <Text style={styles.notifTitle}>{item.title}</Text>
                  <Text style={styles.notifBody}>{item.body}</Text>
                  <Text style={styles.notifDate}>{formatDate(item.createdAt)}</Text>
                </View>
              </View>
            </Card>
          )}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { ...typography.h2, color: colors.textPrimary, marginBottom: spacing.md },
  card: { marginBottom: spacing.sm },
  unreadCard: { borderColor: colors.accent },
  row: { flexDirection: 'row', gap: spacing.sm },
  icon: { fontSize: 20 },
  content: { flex: 1 },
  notifTitle: { ...typography.bodyBold, color: colors.textPrimary },
  notifBody: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  notifDate: { ...typography.small, color: colors.textMuted, marginTop: spacing.xs },
});
