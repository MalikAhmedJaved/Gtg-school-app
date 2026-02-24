import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { useLanguage } from '../../contexts/LanguageContext';
import { colors, spacing, typography, borderRadius } from '../../constants/theme';
import Button from '../../components/Common/Button';
import { useNavigation } from '@react-navigation/native';

const PrivateCleaning = () => {
  const { t } = useLanguage();
  const navigation = useNavigation();

  const features = [
    t('services.privateCleaning.features.kitchen', 'Kitchen cleaning including appliances'),
    t('services.privateCleaning.features.bathroom', 'Bathroom sanitization and deep cleaning'),
    t('services.privateCleaning.features.dusting', 'Dusting and polishing of all surfaces'),
    t('services.privateCleaning.features.floors', 'Vacuuming and mopping of all floors'),
    t('services.privateCleaning.features.trash', 'Trash removal and recycling'),
    t('services.privateCleaning.features.windows', 'Window and mirror cleaning'),
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {t('services.privateCleaning.title', 'Private Cleaning Services')}
        </Text>
        <Text style={styles.subtitle}>
          {t('services.privateCleaning.subtitle', 'Professional residential cleaning tailored to your home')}
        </Text>
      </View>

      <View style={styles.content}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800&h=600&fit=crop' }}
          style={styles.image}
          resizeMode="cover"
        />

        <Text style={styles.heading}>
          {t('services.privateCleaning.heading', 'Comprehensive Home Cleaning Solutions')}
        </Text>
        <Text style={styles.description}>
          {t('services.privateCleaning.description', 'Our private cleaning services are designed to keep your home spotless and comfortable.')}
        </Text>

        <Text style={styles.sectionTitle}>
          {t('services.privateCleaning.whatWeInclude', 'What We Include')}
        </Text>
        {features.map((feature, index) => (
          <View key={index} style={styles.featureItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}

        <View style={styles.ctaContainer}>
          <Button
            title={t('services.getQuote', 'Get a Quote')}
            onPress={() => navigation.navigate('Contact')}
            variant="primary"
            style={styles.button}
          />
          <Button
            title={t('services.backToServices', 'Back to Services')}
            onPress={() => navigation.goBack()}
            variant="outline"
            style={styles.button}
          />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.primary,
    padding: spacing.xl,
  },
  title: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.fontSize.lg,
    color: colors.white,
    opacity: 0.9,
  },
  content: {
    padding: spacing.xl,
  },
  image: {
    width: '100%',
    height: 250,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
  },
  heading: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textDark,
    marginBottom: spacing.md,
  },
  description: {
    fontSize: typography.fontSize.md,
    color: colors.text,
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textDark,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  featureItem: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  bullet: {
    fontSize: typography.fontSize.lg,
    color: colors.primary,
    marginRight: spacing.sm,
  },
  featureText: {
    flex: 1,
    fontSize: typography.fontSize.md,
    color: colors.text,
    lineHeight: 24,
  },
  ctaContainer: {
    marginTop: spacing.xl,
    gap: spacing.md,
  },
  button: {
    marginBottom: spacing.sm,
  },
});

export default PrivateCleaning;
