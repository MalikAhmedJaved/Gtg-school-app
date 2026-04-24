import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { spacing, typography, borderRadius, shadows } from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';

export default function ProfileScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { userData, userRole, logout } = useAuth();
  const isParent = userRole === 'parent';

  const menuItems = [
    { icon: 'person-outline', label: 'Edit Profile', color: colors.primary },
    { icon: 'settings-outline', label: 'Settings', color: colors.primary, onPress: () => navigation.navigate('Settings') },
    ...(isParent
      ? [{ icon: 'document-text-outline', label: "Child's Records", color: colors.success }]
      : []),
    { icon: 'help-circle-outline', label: 'Help & Support', color: colors.textLight },
    { icon: 'information-circle-outline', label: 'About App', color: colors.textLight },
  ];

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, spacing.md) + spacing.sm }]}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Parent Info */}
        <View style={styles.profileCard}>
          <View style={styles.profileAvatar}>
            <Ionicons name="person" size={40} color={colors.white} />
          </View>
          <Text style={styles.profileName}>{userData?.name || 'Parent'}</Text>
          <Text style={styles.profileEmail}>{userData?.email || ''}</Text>
        </View>

        {/* Child Info — parent only */}
        {isParent ? (
          <View style={styles.childCard}>
            <View style={styles.childHeader}>
              <Ionicons name="heart" size={20} color={colors.error} />
              <Text style={styles.childTitle}>Your Child</Text>
            </View>
            <Text style={styles.childName}>{userData?.childName || 'N/A'}</Text>
            <Text style={styles.childAge}>Age: {userData?.childAge || 'N/A'} years old</Text>
          </View>
        ) : null}

        {/* Menu Items */}
        <View style={styles.menuCard}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              activeOpacity={0.7}
              onPress={item.onPress}
            >
              <Ionicons name={item.icon} size={22} color={item.color} />
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.gray[400]} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={logout} activeOpacity={0.7}>
          <Ionicons name="log-out-outline" size={22} color={colors.error} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>Glory to God PPEC v1.0.0</Text>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

const makeStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      backgroundColor: colors.primary,
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.lg,
    },
    headerTitle: {
      fontSize: typography.fontSize.xxl,
      fontWeight: typography.fontWeight.bold,
      color: colors.white,
    },
    scrollContent: {
      padding: spacing.md,
    },
    profileCard: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.lg,
      padding: spacing.xl,
      alignItems: 'center',
      marginBottom: spacing.md,
      ...shadows.sm,
    },
    profileAvatar: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.md,
    },
    profileName: {
      fontSize: typography.fontSize.xl,
      fontWeight: typography.fontWeight.bold,
      color: colors.textDark,
    },
    profileEmail: {
      fontSize: typography.fontSize.sm,
      color: colors.textLight,
      marginTop: spacing.xs,
    },
    childCard: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      marginBottom: spacing.md,
      ...shadows.sm,
    },
    childHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    childTitle: {
      fontSize: typography.fontSize.md,
      fontWeight: typography.fontWeight.bold,
      color: colors.textDark,
      marginLeft: spacing.sm,
    },
    childName: {
      fontSize: typography.fontSize.xl,
      fontWeight: typography.fontWeight.bold,
      color: colors.primary,
    },
    childAge: {
      fontSize: typography.fontSize.sm,
      color: colors.textLight,
    },
    menuCard: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.lg,
      marginBottom: spacing.md,
      ...shadows.sm,
      overflow: 'hidden',
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: colors.gray[100],
    },
    menuLabel: {
      flex: 1,
      fontSize: typography.fontSize.md,
      color: colors.textDark,
      marginLeft: spacing.md,
    },
    logoutButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.card,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      ...shadows.sm,
    },
    logoutText: {
      fontSize: typography.fontSize.md,
      fontWeight: typography.fontWeight.semibold,
      color: colors.error,
      marginLeft: spacing.sm,
    },
    versionText: {
      textAlign: 'center',
      fontSize: typography.fontSize.xs,
      color: colors.textLight,
      marginTop: spacing.lg,
    },
    bottomPadding: {
      height: spacing.xl,
    },
  });
