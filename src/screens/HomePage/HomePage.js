import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ImageBackground,
  TouchableOpacity,
  Image,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useLanguage } from '../../contexts/LanguageContext';
import { colors, spacing, typography, borderRadius, shadows } from '../../constants/theme';
import Logo from '../../components/Common/Logo';
import Button from '../../components/Common/Button';

const HomePage = () => {
  const { t } = useLanguage();
  const navigation = useNavigation();
  const { width, height } = useWindowDimensions();
  const isSmallScreen = width < 360;
  const heroHeight = Math.min(Math.max(height * 0.5, 360), 520);
  const quickCardWidth = isSmallScreen ? '100%' : '48%';
  const goToServices = () => navigation.navigate('Services');
  const goToService = (route) => () => navigation.navigate(route);
  const goToScreen = (screen) => () => navigation.navigate(screen);

  const serviceCards = [
    {
      key: 'private',
      title: t('home.privateCleaning', 'Private Cleaning'),
      description: t('home.privateCleaningDesc', 'Professional residential cleaning services to keep your home spotless and comfortable.'),
      image: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=600&h=400&fit=crop',
      route: 'PrivateCleaning',
    },
    {
      key: 'commercial',
      title: t('home.commercialCleaning', 'Commercial Cleaning'),
      description: t('home.commercialCleaningDesc', 'Comprehensive office and business cleaning solutions to maintain a professional workspace.'),
      image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=400&fit=crop',
      route: 'CommercialCleaning',
    },
    {
      key: 'move',
      title: t('home.moveInMoveOut', 'Move-in/Move-out Cleaning'),
      description: t('home.moveInMoveOutDesc', 'Complete deep cleaning services for tenants and homeowners during relocation.'),
      image: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=600&h=400&fit=crop',
      route: 'MoveInMoveOut',
    },
  ];

  const trustItems = [
    {
      icon: '✓',
      title: t('home.verifiedCleaners', 'Verified Cleaners'),
      description: t('home.verifiedCleanersDesc', 'All our cleaners have background checks and verified credentials'),
    },
    {
      icon: '🔒',
      title: t('home.secureSafe', 'Secure & Safe'),
      description: t('home.secureSafeDesc', 'Your keys and personal information are handled with the utmost security'),
    },
    {
      icon: '⭐',
      title: t('home.qualityGuaranteed', 'Quality Guaranteed'),
      description: t('home.qualityGuaranteedDesc', 'We ensure high-quality service with satisfaction guaranteed'),
    },
    {
      icon: '📞',
      title: t('home.directContact', 'Direct Contact'),
      description: t('home.directContactDesc', 'Get direct contact with your cleaning team for better communication'),
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hero Section */}
      <View style={[styles.heroContainer, { height: heroHeight }]}>
        <ImageBackground
          source={{ uri: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=1200&h=800&fit=crop' }}
          style={styles.heroImage}
          resizeMode="cover"
        >
          <LinearGradient
            colors={[
              'rgba(0, 64, 102, 0.95)',   // darker navy-tinted blue
              'rgba(51, 122, 28, 0.95)',  // darker green
            ]}
            style={styles.heroGradient}
          >
            <View style={[styles.heroContent, { paddingHorizontal: isSmallScreen ? spacing.sm : 0 }]}>
              <Logo width={120} height={120} />
              <Text style={[styles.heroTitle, { fontSize: isSmallScreen ? typography.fontSize.xxl : typography.fontSize.xxxl }]}>
                {t('home.heroTitle', 'Professional Cleaning Services')}
              </Text>
              <Text style={[styles.heroSubtitle, { fontSize: isSmallScreen ? typography.fontSize.md : typography.fontSize.lg }]}>
                {t('home.heroSubtitle', 'Your trusted partner for quality cleaning solutions')}
              </Text>
              <View style={[styles.heroButtons, isSmallScreen && { flexDirection: 'column', width: '100%' }]}>
                <Button
                  title={t('nav.services', 'Services')}
                  onPress={goToServices}
                  variant="primary"
                  style={[styles.heroButton, isSmallScreen && { width: '100%' }]}
                />
                <Button
                  title={t('nav.contact', 'Contact')}
                  onPress={goToScreen('Contact')}
                  variant="outline"
                  style={[styles.heroButton, isSmallScreen && { width: '100%' }]}
                />
              </View>
            </View>
          </LinearGradient>
        </ImageBackground>
      </View>

      {/* Quick Links Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {t('nav.explore', 'Explore Our Website')}
        </Text>
        <View style={styles.quickLinks}>
          <TouchableOpacity
            style={[styles.quickLinkCard, { width: quickCardWidth }]}
            onPress={goToServices}
            activeOpacity={0.8}
          >
            <Text style={styles.quickLinkIcon}>🧹</Text>
            <Text style={styles.quickLinkTitle}>{t('nav.services', 'Services')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.quickLinkCard, { width: quickCardWidth }]}
            onPress={goToScreen('About')}
            activeOpacity={0.8}
          >
            <Text style={styles.quickLinkIcon}>ℹ️</Text>
            <Text style={styles.quickLinkTitle}>{t('nav.about', 'About')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.quickLinkCard, { width: quickCardWidth }]}
            onPress={goToScreen('Contact')}
            activeOpacity={0.8}
          >
            <Text style={styles.quickLinkIcon}>📞</Text>
            <Text style={styles.quickLinkTitle}>{t('nav.contact', 'Contact')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.quickLinkCard, { width: quickCardWidth }]}
            onPress={goToScreen('Careers')}
            activeOpacity={0.8}
          >
            <Text style={styles.quickLinkIcon}>💼</Text>
            <Text style={styles.quickLinkTitle}>{t('nav.careers', 'Careers')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Services Description */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {t('home.servicesTitle', 'Our Cleaning Services')}
        </Text>
        <Text style={styles.sectionText}>
          {t('home.servicesIntro', 'We provide professional cleaning solutions tailored to meet your specific needs.')}
        </Text>
      </View>

      {/* Services Grid */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {t('home.whatWeOffer', 'What We Offer')}
        </Text>
        {serviceCards.map((service) => (
          <TouchableOpacity
            key={service.key}
            style={styles.serviceCard}
            onPress={goToService(service.route)}
            activeOpacity={0.8}
          >
            <ImageBackground
              source={{ uri: service.image }}
              style={styles.serviceImage}
              resizeMode="cover"
              onError={(error) => console.log('Service image error:', error)}
            >
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.7)']}
                style={styles.serviceGradient}
              >
                <Text style={styles.serviceTitle}>{service.title}</Text>
                <Text style={styles.serviceDescription}>{service.description}</Text>
              </LinearGradient>
            </ImageBackground>
          </TouchableOpacity>
        ))}
      </View>

      {/* Trust Section */}
      <View style={[styles.section, styles.trustSection]}>
        <Text style={styles.sectionTitle}>
          {t('home.trustTitle', 'A Cleaning Service You Can Trust')}
        </Text>
        {trustItems.map((item, index) => (
          <View key={index} style={styles.trustItem}>
            <Text style={styles.trustIcon}>{item.icon}</Text>
            <View style={styles.trustContent}>
              <Text style={styles.trustTitle}>{item.title}</Text>
              <Text style={styles.trustDescription}>{item.description}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  heroContainer: {
    height: 500,
    marginBottom: spacing.xl,
  },
  heroImage: {
    flex: 1,
    width: '100%',
  },
  heroGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  heroContent: {
    alignItems: 'center',
    width: '100%',
  },
  heroTitle: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
    textAlign: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  heroSubtitle: {
    fontSize: typography.fontSize.lg,
    color: colors.white,
    textAlign: 'center',
    marginBottom: spacing.xl,
    opacity: 0.95,
  },
  heroButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  heroButton: {
    minWidth: 120,
  },
  section: {
    padding: spacing.xl,
    backgroundColor: colors.white,
  },
  sectionTitle: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textDark,
    marginBottom: spacing.md,
  },
  sectionText: {
    fontSize: typography.fontSize.md,
    color: colors.text,
    lineHeight: 24,
  },
  serviceCard: {
    marginBottom: spacing.lg,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.md,
  },
  serviceImage: {
    height: 200,
    justifyContent: 'flex-end',
  },
  serviceGradient: {
    padding: spacing.lg,
  },
  serviceTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
    marginBottom: spacing.xs,
  },
  serviceDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.white,
    opacity: 0.9,
  },
  trustSection: {
    backgroundColor: colors.backgroundLight,
  },
  trustItem: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    ...shadows.sm,
  },
  trustIcon: {
    fontSize: 32,
    marginRight: spacing.md,
  },
  trustContent: {
    flex: 1,
  },
  trustTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textDark,
    marginBottom: spacing.xs,
  },
  trustDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.text,
    lineHeight: 20,
  },
  quickLinks: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  quickLinkCard: {
    width: '48%',
    backgroundColor: colors.backgroundLight,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  quickLinkIcon: {
    fontSize: 40,
    marginBottom: spacing.sm,
  },
  quickLinkTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textDark,
    textAlign: 'center',
  },
});

export default HomePage;
