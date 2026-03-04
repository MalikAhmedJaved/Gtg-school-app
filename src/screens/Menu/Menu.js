import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { colors, spacing, typography, borderRadius } from '../../constants/theme';
import Logo from '../../components/Common/Logo';

const MenuScreen = ({ navigation }) => {
  const { t } = useLanguage();
  const { isAuthenticated, logout, userRole } = useAuth();
  const isAdmin = userRole === 'admin';

  const handleLogout = async () => {
    await logout();
    // Stay on menu after logout
  };

  // Admin-specific menu items
  const adminItems = [
    {
      key: 'users',
      label: t('admin.users', 'Users'),
      icon: 'people-outline',
      screen: 'AdminDashboard',
      params: { initialTab: 'users' },
    },
    {
      key: 'tasks',
      label: t('admin.taskManagement', 'Task Management'),
      icon: 'clipboard-outline',
      screen: 'AdminDashboard',
      params: { initialTab: 'tasks' },
    },
    {
      key: 'jobseekers',
      label: t('admin.jobSeekers', 'Job Seekers'),
      icon: 'document-text-outline',
      screen: 'AdminDashboard',
      params: { initialTab: 'jobseekers' },
    },
    {
      key: 'archives',
      label: t('dashboard.archives', 'Archives'),
      icon: 'folder-outline',
      screen: 'AdminDashboard',
      params: { initialTab: 'archives' },
    },
  ];

  // Primary menu items — the main sections for non-admin
  const primaryItems = isAdmin ? adminItems : [
    {
      key: 'pending',
      label: t('nav.pending', 'Pending'),
      icon: 'time-outline',
      screen: 'PendingOrders',
    },
    {
      key: 'contact',
      label: t('nav.contact', 'Contact'),
      icon: 'call-outline',
      screen: 'Contact',
    },
    {
      key: 'archive',
      label: t('nav.archive', 'Archive'),
      icon: 'archive-outline',
      screen: 'ArchiveOrders',
    },
  ];

  // Secondary menu items (hidden for admin)
  const secondaryItems = isAdmin ? [] : [
    { key: 'about', label: t('nav.about', 'About'), icon: 'information-circle-outline', screen: 'About' },
  ];

  const authItems = !isAuthenticated
    ? [
        { key: 'login', label: t('nav.login', 'Login'), icon: 'log-in-outline', screen: 'Login' },
        { key: 'register', label: t('nav.register', 'Register'), icon: 'person-add-outline', screen: 'Register' },
      ]
    : [
        { key: 'logout', label: t('nav.logout', 'Logout'), icon: 'log-out-outline', action: handleLogout },
      ];

  const handleNavigate = (item) => {
    if (item.action) {
      item.action();
      return;
    }
    if (item.params) {
      navigation.navigate(item.screen, item.params);
    } else {
      navigation.navigate(item.screen);
    }
  };

  const renderMenuItem = (item) => (
    <TouchableOpacity
      key={item.key}
      style={styles.menuItem}
      onPress={() => handleNavigate(item)}
      activeOpacity={0.7}
    >
      <Ionicons name={item.icon} size={22} color={colors.primary} style={styles.menuIcon} />
      <Text style={styles.menuLabel}>{item.label}</Text>
      <Ionicons name="chevron-forward" size={18} color={colors.gray[300]} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Logo width={80} height={80} />
        <Text style={styles.headerTitle}>{t('nav.cleaningService', 'RentPlus')}</Text>
      </View>

      <ScrollView style={styles.menuContainer}>
        {/* Primary Menu */}
        <View style={styles.menuSection}>
          {primaryItems.map(renderMenuItem)}
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Secondary (hidden for admin) */}
        {secondaryItems.length > 0 ? (
          <>
            <View style={styles.menuSection}>
              <Text style={styles.sectionTitle}>{t('nav.explore', 'Explore')}</Text>
              {secondaryItems.map(renderMenuItem)}
            </View>
            <View style={styles.divider} />
          </>
        ) : null}


        {/* Auth items */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>
            {!isAuthenticated ? t('nav.account', 'Account') : t('nav.myAccount', 'My Account')}
          </Text>
          {authItems.map(renderMenuItem)}
        </View>

        <View style={{ height: 30 }} />
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
    backgroundColor: colors.primaryDark,
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
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.textLight,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: colors.gray[200],
    marginHorizontal: spacing.lg,
    marginVertical: spacing.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
    marginBottom: 2,
  },
  menuIcon: {
    marginRight: spacing.md,
    width: 28,
    textAlign: 'center',
  },
  menuLabel: {
    flex: 1,
    fontSize: typography.fontSize.md,
    color: colors.textDark,
    fontWeight: typography.fontWeight.medium,
  },
});

export default MenuScreen;

