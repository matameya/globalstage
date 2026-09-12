import { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/Button';
import { colors, spacing, typography } from '@/theme/colors';

const slides = [
  { key: 'slide1', image: 'https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?w=900' },
  { key: 'slide2', image: 'https://images.unsplash.com/photo-1517927033932-b3d18e61fb3a?w=900' },
  { key: 'slide3', image: 'https://images.unsplash.com/photo-1526676037777-05a232554f77?w=900' },
];

export default function OnboardingWelcome() {
  const { t } = useTranslation();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const slide = slides[step];

  const titles = [t('onboarding.slide1Title'), t('onboarding.slide2Title'), t('onboarding.slide3Title')];
  const bodies = [t('onboarding.slide1Body'), t('onboarding.slide2Body'), t('onboarding.slide3Body')];

  const isLast = step === slides.length - 1;

  return (
    <SafeAreaView style={styles.container}>
      <Image source={{ uri: slide.image }} style={styles.image} />
      <View style={styles.content}>
        <View style={styles.dots}>
          {slides.map((s, i) => (
            <View key={s.key} style={[styles.dot, i === step && styles.dotActive]} />
          ))}
        </View>
        <Text style={styles.title}>{titles[step]}</Text>
        <Text style={styles.body}>{bodies[step]}</Text>

        <Button
          title={isLast ? t('onboarding.getStarted') : t('common.next')}
          onPress={() => (isLast ? router.push('/onboarding/signup') : setStep((s) => s + 1))}
          style={styles.cta}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  image: { width: '100%', height: '48%' },
  content: { flex: 1, padding: spacing.lg, justifyContent: 'center' },
  dots: { flexDirection: 'row', marginBottom: spacing.lg },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.border, marginRight: spacing.xs },
  dotActive: { backgroundColor: colors.primary, width: 20 },
  title: { ...typography.h1, color: colors.textPrimary, marginBottom: spacing.sm },
  body: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.xl },
  cta: { marginTop: spacing.md },
});
