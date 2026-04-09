import React from 'react';
import { SafeAreaView, StyleSheet, ScrollView, View, Text, Platform, StatusBar } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { colors, spacing, typography } from '../../constants/theme';
import { navigate as rootNavigate } from '../../utils/rootNavigation';
import Profile from '../../components/Dashboards/Profile';
import Button from '../../components/Common/Button';

const ProfileScreen = () => {
  const { isAuthenticated, userRole } = useAuth();
  const { t } = useLanguage();

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loginPrompt}>
          <Text style={styles.loginTitle}>{t('orders.loginRequired', 'Login Required')}</Text>
          <Text style={styles.loginMessage}>
            {t('orders.loginRequiredMsg', 'Please log in to view your profile.')}
          </Text>
          <Button
            title={t('orders.goToLogin', 'Go to Login')}
            onPress={() => rootNavigate('MenuTab', { screen: 'Login' })}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Profile userRole={userRole || 'client'} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  scrollContent: {
    flexGrow: 1,
  },
  loginPrompt: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  loginTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  loginMessage: {
    fontSize: typography.fontSize.md,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 22,
  },
});

export default ProfileScreen;
