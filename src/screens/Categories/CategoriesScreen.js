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
import { spacing, typography, borderRadius, shadows } from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { THERAPY_CATEGORIES, getUpdatesByCategory } from '../../utils/mockData';

export default function CategoriesScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t, lr } = useLanguage();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, spacing.md) + spacing.sm }]}>
        <Text style={styles.headerTitle}>
          {t('app.categories.title', 'Therapy Categories')}
        </Text>
        <Text style={styles.headerSubtitle}>
          {t('app.categories.subtitle', 'Tap a category to see updates')}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {THERAPY_CATEGORIES.map((category) => {
          const updates = getUpdatesByCategory(category.id);
          const todayCount = updates.filter(u => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return new Date(u.timestamp) >= today;
          }).length;

          return (
            <TouchableOpacity
              key={category.id}
              style={styles.categoryCard}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('CategoryDetail', { category })}
            >
              <View style={[styles.iconContainer, { backgroundColor: category.color + '15' }]}>
                <Ionicons name={category.icon} size={32} color={category.color} />
              </View>
              <View style={styles.categoryInfo}>
                <Text style={styles.categoryName}>{lr(category.name)}</Text>
                <Text style={styles.categoryDescription}>{lr(category.description)}</Text>
                {todayCount > 0 && (
                  <View style={styles.badgeRow}>
                    <View style={[styles.badge, { backgroundColor: category.color }]}>
                      <Text style={styles.badgeText}>
                        {t(
                          todayCount > 1
                            ? 'app.categories.updatesToday'
                            : 'app.categories.updateToday',
                          todayCount > 1 ? '{n} updates today' : '{n} update today'
                        ).replace('{n}', todayCount)}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
              <Ionicons name="chevron-forward" size={24} color={colors.gray[400]} />
            </TouchableOpacity>
          );
        })}

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
    headerSubtitle: {
      fontSize: typography.fontSize.sm,
      color: 'rgba(255,255,255,0.7)',
      marginTop: spacing.xs,
    },
    scrollContent: {
      padding: spacing.md,
    },
    categoryCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      marginBottom: spacing.md,
      ...shadows.sm,
    },
    iconContainer: {
      width: 60,
      height: 60,
      borderRadius: 30,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.md,
    },
    categoryInfo: {
      flex: 1,
    },
    categoryName: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.bold,
      color: colors.textDark,
    },
    categoryDescription: {
      fontSize: typography.fontSize.sm,
      color: colors.textLight,
      marginTop: 2,
    },
    badgeRow: {
      flexDirection: 'row',
      marginTop: spacing.sm,
    },
    badge: {
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
      borderRadius: borderRadius.full,
    },
    badgeText: {
      fontSize: typography.fontSize.xs,
      fontWeight: typography.fontWeight.semibold,
      color: colors.white,
    },
    bottomPadding: {
      height: spacing.xl,
    },
  });
