import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, useWindowDimensions } from 'react-native';
import { useLanguage } from '../../contexts/LanguageContext';
import { colors, spacing, typography, borderRadius } from '../../constants/theme';
import Button from '../../components/Common/Button';
import { useNavigation } from '@react-navigation/native';

const CommercialCleaning = () => {
  const { t } = useLanguage();
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const imageHeight = Math.max(180, Math.min(280, Math.round(width * 0.58)));
  const compact = width < 360;

  const features = [
    t('services.commercialCleaning.features.daily', 'Daily office cleaning and maintenance'),
    t('services.commercialCleaning.features.restroom', 'Restroom sanitization and restocking'),
    t('services.commercialCleaning.features.floors', 'Floor care including vacuuming, mopping, and buffing'),
    t('services.commercialCleaning.features.windows', 'Window and glass cleaning'),
    t('services.commercialCleaning.features.desks', 'Desk and workstation sanitization'),
    t('services.commercialCleaning.features.trash', 'Trash and recycling removal'),
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, compact && { fontSize: typography.fontSize.xxl }] }>
          {t('services.commercialCleaning.title', 'Commercial Cleaning Services')}
        </Text>
        <Text style={styles.subtitle}>
          {t('services.commercialCleaning.subtitle', 'Professional office and business cleaning solutions')}
        </Text>
      </View>

      <View style={[styles.content, compact && { padding: spacing.lg }]}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop' }}
          style={[styles.image, { height: imageHeight }]}
          resizeMode="cover"
        />

        <Text style={styles.heading}>
          {t('services.commercialCleaning.heading', 'Comprehensive Business Cleaning Solutions')}
        </Text>
        <Text style={styles.description}>
          {t('services.commercialCleaning.description', 'Maintain a professional and welcoming workspace with our comprehensive commercial cleaning services.')}
        </Text>

        <Text style={styles.sectionTitle}>
          {t('services.commercialCleaning.whatWeInclude', 'What We Include')}
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

export default CommercialCleaning;
