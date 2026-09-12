import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { colors, radius, spacing, typography } from '@/theme/colors';
import { useFamilyStore } from '@/store/familyStore';
import { useNotificationStore } from '@/store/notificationStore';

export default function AccountScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const guardian = useFamilyStore((s) => s.guardian);
  const players = useFamilyStore((s) => s.players);
  const signOut = useFamilyStore((s) => s.signOut);
  const unreadCount = useNotificationStore((s) => s.unreadCount());

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'fr' : 'en');
  };

  return (
    <Screen>
      <Text style={styles.title}>{t('account.title')}</Text>

      <Text style={styles.sectionLabel}>{t('account.guardianSection')}</Text>
      <Card style={styles.guardianCard}>
        <Text style={styles.guardianName}>{guardian?.fullName}</Text>
        <Text style={styles.guardianMeta}>{guardian?.email}</Text>
        <Text style={styles.guardianMeta}>{guardian?.phone}</Text>
      </Card>

      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionLabel}>{t('account.playersSection')}</Text>
        <Pressable onPress={() => router.push('/(tabs)/account/add-player')}>
          <Ionicons name="add-circle-outline" size={22} color={colors.accent} />
        </Pressable>
      </View>

      {players.map((player) => (
        <Pressable
          key={player.id}
          style={styles.playerRow}
          onPress={() => router.push(`/(tabs)/account/player/${player.id}`)}
        >
          {player.photoUrl ? (
            <Image source={{ uri: player.photoUrl }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitial}>{player.fullName.charAt(0)}</Text>
            </View>
          )}
          <View style={styles.playerInfo}>
            <Text style={styles.playerName}>{player.fullName}</Text>
            <Text style={styles.playerMeta}>{player.category} · {t(`player.level_${player.level}`)}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </Pressable>
      ))}

      <Button
        title={t('account.addPlayer')}
        onPress={() => router.push('/(tabs)/account/add-player')}
        variant="secondary"
        style={styles.addPlayerButton}
      />

      <Card style={styles.menuCard}>
        <Pressable style={styles.menuRow} onPress={() => router.push('/(tabs)/account/notifications')}>
          <Ionicons name="notifications-outline" size={20} color={colors.textPrimary} />
          <Text style={styles.menuLabel}>{t('account.notifications')}</Text>
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          )}
        </Pressable>
        <Pressable style={styles.menuRow} onPress={() => router.push('/(tabs)/account/help')}>
          <Ionicons name="help-circle-outline" size={20} color={colors.textPrimary} />
          <Text style={styles.menuLabel}>{t('account.help')}</Text>
        </Pressable>
        <Pressable style={styles.menuRow} onPress={toggleLanguage}>
          <Ionicons name="language-outline" size={20} color={colors.textPrimary} />
          <Text style={styles.menuLabel}>{t('account.language')}: {i18n.language === 'en' ? 'English' : 'Français'}</Text>
        </Pressable>
      </Card>

      <Button title={t('account.signOut')} onPress={signOut} variant="ghost" style={styles.signOutButton} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.h1, color: colors.textPrimary, marginBottom: spacing.md },
  sectionLabel: { ...typography.h3, color: colors.textPrimary, marginBottom: spacing.sm },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  guardianCard: {},
  guardianName: { ...typography.bodyBold, color: colors.textPrimary },
  guardianMeta: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm,
    marginTop: spacing.sm,
  },
  avatar: { width: 44, height: 44, borderRadius: 22, marginRight: spacing.sm },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  avatarInitial: { ...typography.bodyBold, color: colors.accent },
  playerInfo: { flex: 1 },
  playerName: { ...typography.bodyBold, color: colors.textPrimary },
  playerMeta: { ...typography.caption, color: colors.textSecondary },
  addPlayerButton: { marginTop: spacing.sm },
  menuCard: { marginTop: spacing.lg, padding: 0, overflow: 'hidden' },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuLabel: { ...typography.body, color: colors.textPrimary, flex: 1 },
  badge: {
    backgroundColor: colors.accent,
    borderRadius: radius.pill,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: { color: colors.white, fontSize: 11, fontWeight: '700' },
  signOutButton: { marginTop: spacing.lg },
});
