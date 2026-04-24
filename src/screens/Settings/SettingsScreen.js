import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { spacing, typography, borderRadius, shadows } from '../../constants/theme';

const LANGUAGES = [
  { code: 'en', native: 'English' },
  { code: 'es', native: 'Español' },
];

const THEME_OPTIONS = [
  { code: 'system', labelKey: 'app.settings.themeSystem', fallback: 'System', icon: 'phone-portrait-outline' },
  { code: 'light', labelKey: 'app.settings.themeLight', fallback: 'Light', icon: 'sunny-outline' },
  { code: 'dark', labelKey: 'app.settings.themeDark', fallback: 'Dark', icon: 'moon-outline' },
];

export default function SettingsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { logout } = useAuth();
  const { language, changeLanguage, t } = useLanguage();
  const { colors, preference, setPreference } = useTheme();
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(false);

  const styles = useMemo(() => makeStyles(colors), [colors]);

  const handleSignOut = () => {
    Alert.alert(
      t('app.settings.signOut', 'Sign Out'),
      t('app.settings.signOutConfirm', 'Are you sure you want to sign out?'),
      [
        { text: t('app.settings.cancel', 'Cancel'), style: 'cancel' },
        {
          text: t('app.settings.confirm', 'Confirm'),
          style: 'destructive',
          onPress: () => logout(),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, spacing.md) + spacing.sm }]}>
        <TouchableOpacity onPress={() => navigation?.goBack?.()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.onPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('app.settings.title', 'Settings')}</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Appearance */}
        <Text style={styles.sectionLabel}>{t('app.settings.appearance', 'Appearance')}</Text>
        <View style={styles.card}>
          <Text style={styles.cardDescription}>
            {t('app.settings.themeDescription', 'Choose how the app looks')}
          </Text>
          <View style={styles.themeRow}>
            {THEME_OPTIONS.map((opt) => {
              const active = preference === opt.code;
              return (
                <TouchableOpacity
                  key={opt.code}
                  style={[styles.themeChip, active && styles.themeChipActive]}
                  onPress={() => setPreference(opt.code)}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={opt.icon}
                    size={18}
                    color={active ? colors.onPrimary : colors.primary}
                  />
                  <Text style={[styles.themeChipText, active && styles.themeChipTextActive]}>
                    {t(opt.labelKey, opt.fallback)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Language */}
        <Text style={styles.sectionLabel}>{t('app.settings.language', 'Language')}</Text>
        <View style={styles.card}>
          <Text style={styles.cardDescription}>
            {t('app.settings.languageDescription', 'Choose your preferred language')}
          </Text>
          <View style={styles.langRow}>
            {LANGUAGES.map((lang) => {
              const active = language === lang.code;
              return (
                <TouchableOpacity
                  key={lang.code}
                  style={[styles.langChip, active && styles.langChipActive]}
                  onPress={() => changeLanguage(lang.code)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.langChipText, active && styles.langChipTextActive]}>
                    {lang.native}
                  </Text>
                  {active ? (
                    <Ionicons
                      name="checkmark-circle"
                      size={18}
                      color={colors.onPrimary}
                      style={styles.langCheck}
                    />
                  ) : null}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Notifications */}
        <Text style={styles.sectionLabel}>
          {t('app.settings.notifications', 'Notifications')}
        </Text>
        <View style={styles.card}>
          <View style={styles.toggleRow}>
            <View style={styles.toggleText}>
              <Text style={styles.toggleLabel}>
                {t('app.settings.pushNotifications', 'Push Notifications')}
              </Text>
              <Text style={styles.toggleDescription}>
                {t('app.settings.pushDescription', 'Receive alerts for new updates')}
              </Text>
            </View>
            <Switch
              value={pushEnabled}
              onValueChange={setPushEnabled}
              trackColor={{ false: colors.gray[300], true: colors.primaryLight }}
              thumbColor={pushEnabled ? colors.primary : colors.gray[100]}
            />
          </View>
          <View style={styles.divider} />
          <View style={styles.toggleRow}>
            <View style={styles.toggleText}>
              <Text style={styles.toggleLabel}>
                {t('app.settings.emailNotifications', 'Email Notifications')}
              </Text>
            </View>
            <Switch
              value={emailEnabled}
              onValueChange={setEmailEnabled}
              trackColor={{ false: colors.gray[300], true: colors.primaryLight }}
              thumbColor={emailEnabled ? colors.primary : colors.gray[100]}
            />
          </View>
        </View>

        {/* Account */}
        <Text style={styles.sectionLabel}>{t('app.settings.account', 'Account')}</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.linkRow} activeOpacity={0.7}>
            <Ionicons name="lock-closed-outline" size={22} color={colors.primary} />
            <Text style={styles.linkLabel}>
              {t('app.settings.changePassword', 'Change Password')}
            </Text>
            <Ionicons name="chevron-forward" size={18} color={colors.gray[400]} />
          </TouchableOpacity>
        </View>

        {/* About */}
        <Text style={styles.sectionLabel}>{t('app.settings.about', 'About')}</Text>
        <View style={styles.card}>
          <View style={styles.linkRow}>
            <Ionicons name="information-circle-outline" size={22} color={colors.textLight} />
            <Text style={styles.linkLabel}>
              {t('app.settings.version', 'Version')}
            </Text>
            <Text style={styles.versionValue}>1.0.0</Text>
          </View>
        </View>

        {/* Sign Out */}
        <TouchableOpacity
          style={styles.signOutButton}
          onPress={handleSignOut}
          activeOpacity={0.8}
        >
          <Ionicons name="log-out-outline" size={22} color={colors.error} />
          <Text style={styles.signOutText}>
            {t('app.settings.signOut', 'Sign Out')}
          </Text>
        </TouchableOpacity>

        <View style={{ height: spacing.xl }} />
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
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.md,
      paddingBottom: spacing.md,
    },
    backBtn: {
      width: 36,
      height: 36,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerTitle: {
      flex: 1,
      fontSize: typography.fontSize.xl,
      fontWeight: typography.fontWeight.bold,
      color: colors.onPrimary,
      textAlign: 'center',
    },
    scrollContent: {
      padding: spacing.md,
    },
    sectionLabel: {
      fontSize: typography.fontSize.xs,
      fontWeight: typography.fontWeight.bold,
      color: colors.textLight,
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginTop: spacing.md,
      marginBottom: spacing.xs,
      paddingHorizontal: spacing.sm,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      ...shadows.sm,
    },
    cardDescription: {
      fontSize: typography.fontSize.sm,
      color: colors.textLight,
      marginBottom: spacing.md,
    },
    themeRow: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    themeChip: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      paddingVertical: spacing.sm + 2,
      borderRadius: borderRadius.lg,
      borderWidth: 1.5,
      borderColor: colors.primary,
      backgroundColor: colors.card,
    },
    themeChipActive: {
      backgroundColor: colors.primary,
    },
    themeChipText: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.semibold,
      color: colors.primary,
    },
    themeChipTextActive: { color: colors.onPrimary },
    langRow: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    langChip: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing.sm + 2,
      borderRadius: borderRadius.lg,
      borderWidth: 1.5,
      borderColor: colors.primary,
      backgroundColor: colors.card,
    },
    langChipActive: {
      backgroundColor: colors.primary,
    },
    langChipText: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.semibold,
      color: colors.primary,
    },
    langChipTextActive: {
      color: colors.onPrimary,
    },
    langCheck: {
      marginLeft: 6,
    },
    toggleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: spacing.xs,
    },
    toggleText: {
      flex: 1,
      paddingRight: spacing.md,
    },
    toggleLabel: {
      fontSize: typography.fontSize.md,
      color: colors.textDark,
      fontWeight: typography.fontWeight.medium,
    },
    toggleDescription: {
      fontSize: typography.fontSize.xs,
      color: colors.textLight,
      marginTop: 2,
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: spacing.sm,
    },
    linkRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.sm,
    },
    linkLabel: {
      flex: 1,
      fontSize: typography.fontSize.md,
      color: colors.textDark,
      marginLeft: spacing.md,
    },
    versionValue: {
      fontSize: typography.fontSize.sm,
      color: colors.textLight,
    },
    signOutButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.card,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      marginTop: spacing.lg,
      ...shadows.sm,
    },
    signOutText: {
      fontSize: typography.fontSize.md,
      fontWeight: typography.fontWeight.semibold,
      color: colors.error,
      marginLeft: spacing.sm,
    },
  });
