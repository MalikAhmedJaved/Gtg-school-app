import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { useLanguage } from '../../contexts/LanguageContext';
import { colors, spacing, typography, borderRadius } from '../../constants/theme';
import Button from '../../components/Common/Button';
import { useNavigation } from '@react-navigation/native';

const MoveInMoveOut = () => {
  const { t } = useLanguage();
  const navigation = useNavigation();

  const features = [
    t('services.moveInMoveOut.features.kitchen', 'Complete kitchen deep clean including inside all appliances'),
    t('services.moveInMoveOut.features.bathroom', 'Bathroom sanitization and detailed scrubbing'),
    t('services.moveInMoveOut.features.floors', 'All floors vacuumed, mopped, and polished'),
    t('services.moveInMoveOut.features.windows', 'Window cleaning inside and out'),
    t('services.moveInMoveOut.features.baseboards', 'Baseboard and door frame cleaning'),
    t('services.moveInMoveOut.features.lights', 'Light fixtures and ceiling fan cleaning'),
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {t('services.moveInMoveOut.title', 'Move-in/Move-out Cleaning Services')}
        </Text>
        <Text style={styles.subtitle}>
          {t('services.moveInMoveOut.subtitle', 'Complete deep cleaning for your relocation')}
        </Text>
      </View>

      <View style={styles.content}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&h=600&fit=crop' }}
          style={styles.image}
          resizeMode="cover"
        />

        <Text style={styles.heading}>
          {t('services.moveInMoveOut.heading', 'Comprehensive Relocation Cleaning')}
        </Text>
        <Text style={styles.description}>
          {t('services.moveInMoveOut.description', 'Moving can be stressful, but cleaning doesn\'t have to be.')}
        </Text>

        <Text style={styles.sectionTitle}>
          {t('services.moveInMoveOut.whatWeInclude', 'What We Include')}
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

export default MoveInMoveOut;
