import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { colors, spacing, typography, borderRadius } from '../../constants/theme';
import Logo from '../Common/Logo';

const CustomDrawer = (props) => {
  const { t } = useLanguage();
  const { isAuthenticated, userRole, logout } = useAuth();
  const navigation = useNavigation();

  const handleLogout = async () => {
    await logout();
    navigation.navigate('Home');
  };

  const menuItems = [
    { key: 'home', label: t('nav.home', 'Home'), route: 'Home', icon: '🏠' },
    { key: 'services', label: t('nav.services', 'Services'), route: 'Services', icon: '🧹' },
    { key: 'about', label: t('nav.about', 'About'), route: 'About', icon: 'ℹ️' },
    { key: 'contact', label: t('nav.contact', 'Contact'), route: 'Contact', icon: '📞' },
    { key: 'careers', label: t('nav.careers', 'Careers'), route: 'Careers', icon: '💼' },
  ];

  const authItems = !isAuthenticated
    ? [
        { key: 'login', label: t('nav.login', 'Login'), route: 'Login', icon: '🔐' },
        { key: 'register', label: t('nav.register', 'Register'), route: 'Register', icon: '📝' },
      ]
    : [
        {
          key: 'dashboard',
          label: t('nav.dashboard', 'Dashboard'),
          route:
            userRole === 'admin'
              ? 'AdminDashboard'
              : userRole === 'cleaner'
              ? 'CleanerDashboard'
              : 'ClientDashboard',
          icon: '📊',
        },
        { key: 'logout', label: t('nav.logout', 'Logout'), route: null, icon: '🚪', action: handleLogout },
      ];

  const navigateTo = (route, action) => {
    if (action) {
      action();
    } else if (route) {
      navigation.navigate(route);
    }
    props.navigation.closeDrawer();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Logo width={80} height={80} />
        <Text style={styles.headerTitle}>{t('nav.cleaningService', 'Cleaning Service')}</Text>
      </View>

      <ScrollView style={styles.menuContainer}>
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>{t('nav.pages', 'Pages')}</Text>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.key}
              style={styles.menuItem}
              onPress={() => navigateTo(item.route)}
            >
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <Text style={styles.menuLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>
            {!isAuthenticated ? t('nav.account', 'Account') : t('nav.myAccount', 'My Account')}
          </Text>
          {authItems.map((item) => (
            <TouchableOpacity
              key={item.key}
              style={styles.menuItem}
              onPress={() => navigateTo(item.route, item.action)}
            >
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <Text style={styles.menuLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {isAuthenticated && (
          <View style={styles.menuSection}>
            <Text style={styles.sectionTitle}>{t('nav.dashboards', 'Dashboards')}</Text>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigateTo('ClientDashboard')}
            >
              <Text style={styles.menuIcon}>👤</Text>
              <Text style={styles.menuLabel}>{t('dashboard.clientDashboard', 'Client Dashboard')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigateTo('AdminDashboard')}
            >
              <Text style={styles.menuIcon}>⚙️</Text>
              <Text style={styles.menuLabel}>{t('dashboard.adminDashboard', 'Admin Dashboard')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigateTo('CleanerDashboard')}
            >
              <Text style={styles.menuIcon}>🧽</Text>
              <Text style={styles.menuLabel}>{t('dashboard.cleanerDashboard', 'Cleaner Dashboard')}</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    backgroundColor: colors.primary,
    padding: spacing.xl,
    alignItems: 'center',
    paddingTop: spacing.xxl,
  },
  headerTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
    marginTop: spacing.md,
  },
  menuContainer: {
    flex: 1,
  },
  menuSection: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.textLight,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.xs,
  },
  menuIcon: {
    fontSize: 24,
    marginRight: spacing.md,
    width: 30,
  },
  menuLabel: {
    fontSize: typography.fontSize.md,
    color: colors.textDark,
    fontWeight: typography.fontWeight.medium,
  },
});

export default CustomDrawer;
