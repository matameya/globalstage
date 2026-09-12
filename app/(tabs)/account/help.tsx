import { Linking, StyleSheet, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Screen } from '@/components/Screen';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { colors, spacing, typography } from '@/theme/colors';

export default function HelpScreen() {
  const { t } = useTranslation();

  const faqs = [
    { q: t('help.faq1Q'), a: t('help.faq1A') },
    { q: t('help.faq2Q'), a: t('help.faq2A') },
    { q: t('help.faq3Q'), a: t('help.faq3A') },
  ];

  return (
    <Screen>
      <Text style={styles.title}>{t('help.title')}</Text>
      {faqs.map((faq) => (
        <Card key={faq.q} style={styles.card}>
          <Text style={styles.question}>{faq.q}</Text>
          <Text style={styles.answer}>{faq.a}</Text>
        </Card>
      ))}
      <Button
        title={t('help.contactSupport')}
        onPress={() => Linking.openURL('mailto:support@globalstage.app')}
        variant="secondary"
        style={styles.cta}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.h2, color: colors.textPrimary, marginBottom: spacing.md },
  card: { marginBottom: spacing.sm },
  question: { ...typography.bodyBold, color: colors.textPrimary },
  answer: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.xs },
  cta: { marginTop: spacing.md },
});
