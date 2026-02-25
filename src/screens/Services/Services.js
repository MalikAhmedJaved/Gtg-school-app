import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ImageBackground, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useLanguage } from '../../contexts/LanguageContext';
import { colors, spacing, typography, borderRadius, shadows } from '../../constants/theme';

const Services = () => {
  const { t } = useLanguage();
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const imageHeight = Math.max(180, Math.min(280, Math.round(width * 0.55)));
  const smallScreen = width < 360;

  const services = [
    {
      key: 'private',
      title: t('home.privateCleaning', 'Private Cleaning'),
      description: t('home.privateCleaningDesc', 'Professional residential cleaning services.'),
      image: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=600&h=400&fit=crop',
      route: 'PrivateCleaning',
    },
    {
      key: 'commercial',
      title: t('home.commercialCleaning', 'Commercial Cleaning'),
      description: t('home.commercialCleaningDesc', 'Comprehensive office and business cleaning solutions.'),
      image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=400&fit=crop',
      route: 'CommercialCleaning',
    },
    {
      key: 'move',
      title: t('home.moveInMoveOut', 'Move-in/Move-out Cleaning'),
      description: t('home.moveInMoveOutDesc', 'Complete deep cleaning services for relocation.'),
      image: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=600&h=400&fit=crop',
      route: 'MoveInMoveOut',
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, smallScreen && { fontSize: typography.fontSize.xxl }] }>
          {t('services.pageTitle', 'Our Services')}
        </Text>
        <Text style={styles.subtitle}>
          {t('services.pageSubtitle', 'Professional cleaning solutions for every need')}
        </Text>
      </View>

      {services.map((service) => (
        <TouchableOpacity
          key={service.key}
          style={styles.serviceCard}
          onPress={() => navigation.navigate(service.route)}
          activeOpacity={0.8}
        >
          <ImageBackground
            source={{ uri: service.image }}
            style={[styles.serviceImage, { height: imageHeight }]}
            resizeMode="cover"
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
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.xl,
    backgroundColor: colors.primary,
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
  serviceCard: {
    margin: spacing.md,
    marginBottom: spacing.lg,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.md,
  },
  serviceImage: {
    height: 250,
    justifyContent: 'flex-end',
  },
  serviceGradient: {
    padding: spacing.lg,
  },
  serviceTitle: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
    marginBottom: spacing.xs,
  },
  serviceDescription: {
    fontSize: typography.fontSize.md,
    color: colors.white,
    opacity: 0.9,
  },
});

export default Services;
