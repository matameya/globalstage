import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '@/theme/colors';
import { Button } from './Button';

export function EmptyState({
  title,
  ctaLabel,
  onPressCta,
}: {
  title: string;
  ctaLabel?: string;
  onPressCta?: () => void;
}) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {ctaLabel && onPressCta && (
        <Button title={ctaLabel} onPress={onPressCta} variant="secondary" style={styles.button} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.xxl, paddingHorizontal: spacing.lg },
  title: { ...typography.body, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.md },
  button: { minWidth: 180 },
});
