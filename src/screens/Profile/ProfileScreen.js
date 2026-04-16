import React from 'react';
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
import { colors, spacing, typography, borderRadius, shadows } from '../../constants/theme';
import { THERAPISTS } from '../../utils/mockData';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { userData, logout } = useAuth();

  const menuItems = [
    { icon: 'person-outline', label: 'Edit Profile', color: colors.primary },
    { icon: 'notifications-outline', label: 'Notification Settings', color: colors.info },
    { icon: 'document-text-outline', label: "Child's Records", color: colors.success },
    { icon: 'calendar-outline', label: 'Therapy Schedule', color: colors.warning },
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

        {/* Child Info */}
        <View style={styles.childCard}>
          <View style={styles.childHeader}>
            <Ionicons name="heart" size={20} color={colors.error} />
            <Text style={styles.childTitle}>Your Child</Text>
          </View>
          <Text style={styles.childName}>{userData?.childName || 'N/A'}</Text>
          <Text style={styles.childAge}>Age: {userData?.childAge || 'N/A'} years old</Text>

          <Text style={styles.therapistsTitle}>Care Team:</Text>
          {THERAPISTS.map((therapist) => (
            <View key={therapist.id} style={styles.therapistRow}>
              <View style={[styles.therapistDot, { backgroundColor: therapist.color }]} />
              <Text style={styles.therapistName}>{therapist.fullName}</Text>
              <Text style={styles.therapistRole}>{therapist.role}</Text>
            </View>
          ))}
        </View>

        {/* Menu Items */}
        <View style={styles.menuCard}>
          {menuItems.map((item, index) => (
            <TouchableOpacity key={index} style={styles.menuItem} activeOpacity={0.7}>
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

const styles = StyleSheet.create({
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
    backgroundColor: colors.white,
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
    backgroundColor: colors.white,
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
    marginBottom: spacing.md,
  },
  therapistsTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.textDark,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
    paddingTop: spacing.md,
  },
  therapistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  therapistDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.sm,
  },
  therapistName: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.textDark,
    flex: 1,
  },
  therapistRole: {
    fontSize: typography.fontSize.xs,
    color: colors.textLight,
  },
  menuCard: {
    backgroundColor: colors.white,
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
    backgroundColor: colors.white,
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
