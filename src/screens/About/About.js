import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useLanguage } from '../../contexts/LanguageContext';
import { colors, spacing, typography, borderRadius, shadows } from '../../constants/theme';
import Button from '../../components/Common/Button';
import { useNavigation } from '@react-navigation/native';

const About = () => {
  const { t } = useLanguage();
  const navigation = useNavigation();

  const features = [
    { icon: '✓', title: t('about.verifiedCleaners', 'Verified Cleaners'), desc: t('about.verifiedCleanersDesc', 'All our cleaners undergo background checks') },
    { icon: '🔒', title: t('about.secureTrusted', 'Secure & Trusted'), desc: t('about.secureTrustedDesc', 'Your keys and personal information are handled with utmost security') },
    { icon: '⭐', title: t('about.qualityGuaranteed', 'Quality Guaranteed'), desc: t('about.qualityGuaranteedDesc', 'We guarantee satisfaction with our cleaning services') },
    { icon: '📞', title: t('about.directContact', 'Direct Contact'), desc: t('about.directContactDesc', 'Get direct contact with your cleaning team') },
    { icon: '🌱', title: t('about.ecoFriendly', 'Eco-Friendly'), desc: t('about.ecoFriendlyDesc', 'We use environmentally friendly cleaning products') },
    { icon: '⏰', title: t('about.flexibleScheduling', 'Flexible Scheduling'), desc: t('about.flexibleSchedulingDesc', 'We work around your schedule') },
  ];

  const values = [
    { title: t('about.reliability', 'Reliability'), desc: t('about.reliabilityDesc', 'We show up on time and deliver consistent service') },
    { title: t('about.trust', 'Trust'), desc: t('about.trustDesc', 'We build long-term relationships based on trust') },
    { title: t('about.excellence', 'Excellence'), desc: t('about.excellenceDesc', 'We strive for excellence in every job') },
    { title: t('about.respect', 'Respect'), desc: t('about.respectDesc', 'We respect your property and privacy') },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('about.title', 'About Us')}</Text>
        <Text style={styles.subtitle}>{t('about.subtitle', 'Your trusted cleaning service partner')}</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('about.whoWeAre', 'Who We Are')}</Text>
          <Text style={styles.text}>
            {t('about.whoWeAreText1', 'We are a professional cleaning service company dedicated to providing high-quality cleaning solutions.')}
          </Text>
          <Text style={styles.text}>
            {t('about.whoWeAreText2', 'Our team consists of trained and verified cleaners who are committed to delivering outstanding results.')}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('about.ourMission', 'Our Mission')}</Text>
          <Text style={styles.text}>
            {t('about.ourMissionText', 'Our mission is to provide exceptional cleaning services that exceed our clients\' expectations.')}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('about.whyChooseUs', 'Why Choose Us')}</Text>
          {features.map((feature, index) => (
            <View key={index} style={styles.featureCard}>
              <Text style={styles.featureIcon}>{feature.icon}</Text>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDesc}>{feature.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('about.ourValues', 'Our Values')}</Text>
          {values.map((value, index) => (
            <View key={index} style={styles.valueCard}>
              <Text style={styles.valueTitle}>{value.title}</Text>
              <Text style={styles.valueDesc}>{value.desc}</Text>
            </View>
          ))}
        </View>

        <View style={styles.ctaContainer}>
          <Button
            title={t('about.contactUs', 'Contact Us')}
            onPress={() => navigation.navigate('Contact')}
            variant="primary"
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
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textDark,
    marginBottom: spacing.md,
  },
  text: {
    fontSize: typography.fontSize.md,
    color: colors.text,
    lineHeight: 24,
    marginBottom: spacing.md,
  },
  featureCard: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  featureIcon: {
    fontSize: 32,
    marginRight: spacing.md,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textDark,
    marginBottom: spacing.xs,
  },
  featureDesc: {
    fontSize: typography.fontSize.sm,
    color: colors.text,
    lineHeight: 20,
  },
  valueCard: {
    backgroundColor: colors.backgroundLight,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  valueTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  valueDesc: {
    fontSize: typography.fontSize.sm,
    color: colors.text,
    lineHeight: 20,
  },
  ctaContainer: {
    marginTop: spacing.lg,
  },
});

export default About;
