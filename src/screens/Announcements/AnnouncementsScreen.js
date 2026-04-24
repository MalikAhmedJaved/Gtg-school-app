import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../contexts/LanguageContext';
import { spacing, typography, borderRadius, shadows } from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';

const DUMMY_ITEMS = [
  {
    id: 'a1',
    kind: 'event',
    title: 'Spring Family Fun Day',
    summary: 'Join us for a day of games, food, and family activities at our Miami center.',
    date: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
    location: 'Glory to God PPEC — Miami',
    image: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=800&q=80',
    pinned: true,
  },
  {
    id: 'a2',
    kind: 'announcement',
    title: 'Schedule change: Memorial Day',
    summary:
      'The center will be closed on Monday, May 26 for Memorial Day. Regular schedule resumes Tuesday.',
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    pinned: true,
  },
  {
    id: 'a3',
    kind: 'event',
    title: 'Parent Support Group Meeting',
    summary:
      'Monthly meet-up for parents to share experiences and connect with our therapy team.',
    date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    location: 'Conference Room A',
    image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&q=80',
  },
  {
    id: 'a4',
    kind: 'news',
    title: 'New speech therapy equipment has arrived!',
    summary:
      'We have added new sensory-friendly tools and interactive devices to our speech therapy room.',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'a5',
    kind: 'announcement',
    title: 'Annual health forms due May 15',
    summary:
      'Please complete and submit updated medical and consent forms before the deadline. Contact the office if you need help.',
    date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const KIND_META = {
  event: { label: 'Event', icon: 'calendar-outline', color: '#27AE60' },
  announcement: { label: 'Announcement', icon: 'megaphone-outline', color: '#F39C12' },
  news: { label: 'News', icon: 'newspaper-outline', color: '#2980B9' },
};

function formatDate(d) {
  if (!d) return '';
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export default function AnnouncementsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { t } = useLanguage();
  const [refreshing, setRefreshing] = useState(false);
  const [items, setItems] = useState(DUMMY_ITEMS);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setItems([...DUMMY_ITEMS]);
      setRefreshing(false);
    }, 700);
  };

  const sorted = useMemo(() => {
    return [...items].sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }, [items]);

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, spacing.md) + spacing.sm }]}>
        <TouchableOpacity onPress={() => navigation?.goBack?.()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {t('app.announcements.title', 'Announcements & Events')}
        </Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {sorted.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="megaphone-outline" size={44} color={colors.gray[400]} />
            <Text style={styles.emptyText}>
              {t('app.announcements.empty', 'No announcements yet.')}
            </Text>
          </View>
        ) : (
          sorted.map((item) => {
            const meta = KIND_META[item.kind] || KIND_META.news;
            return (
              <View key={item.id} style={styles.card}>
                {item.image ? (
                  <Image source={{ uri: item.image }} style={styles.cardImage} resizeMode="cover" />
                ) : null}

                <View style={styles.cardBody}>
                  <View style={styles.cardHeaderRow}>
                    <View style={[styles.kindBadge, { backgroundColor: meta.color }]}>
                      <Ionicons name={meta.icon} size={12} color={colors.white} />
                      <Text style={styles.kindBadgeText}>{meta.label}</Text>
                    </View>
                    {item.pinned ? (
                      <View style={styles.pinned}>
                        <Ionicons name="pin" size={12} color={colors.secondary} />
                        <Text style={styles.pinnedText}>Pinned</Text>
                      </View>
                    ) : null}
                  </View>

                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text style={styles.cardSummary}>{item.summary}</Text>

                  <View style={styles.metaRow}>
                    <Ionicons name="time-outline" size={14} color={colors.textLight} />
                    <Text style={styles.metaText}>{formatDate(item.date)}</Text>
                    {item.location ? (
                      <>
                        <View style={styles.metaDot} />
                        <Ionicons name="location-outline" size={14} color={colors.textLight} />
                        <Text style={styles.metaText} numberOfLines={1}>
                          {item.location}
                        </Text>
                      </>
                    ) : null}
                  </View>
                </View>
              </View>
            );
          })
        )}

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
      color: colors.white,
      textAlign: 'center',
    },
    scrollContent: {
      padding: spacing.md,
      gap: spacing.md,
    },
    emptyState: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing.xl * 2,
      gap: spacing.xs,
    },
    emptyText: {
      fontSize: typography.fontSize.sm,
      color: colors.gray[500],
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.lg,
      overflow: 'hidden',
      ...shadows.sm,
    },
    cardImage: {
      width: '100%',
      height: 150,
      backgroundColor: colors.gray[200],
    },
    cardBody: {
      padding: spacing.md,
    },
    cardHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.xs,
    },
    kindBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: spacing.sm,
      paddingVertical: 3,
      borderRadius: borderRadius.full,
    },
    kindBadgeText: {
      color: colors.white,
      fontSize: typography.fontSize.xs,
      fontWeight: typography.fontWeight.semibold,
    },
    pinned: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
    },
    pinnedText: {
      fontSize: typography.fontSize.xs,
      color: colors.secondaryDark,
      fontWeight: typography.fontWeight.semibold,
    },
    cardTitle: {
      fontSize: typography.fontSize.md,
      fontWeight: typography.fontWeight.bold,
      color: colors.textDark,
      marginTop: 4,
    },
    cardSummary: {
      fontSize: typography.fontSize.sm,
      color: colors.gray[700],
      lineHeight: 20,
      marginTop: 4,
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginTop: spacing.sm,
      flexWrap: 'wrap',
    },
    metaText: {
      fontSize: typography.fontSize.xs,
      color: colors.textLight,
    },
    metaDot: {
      width: 3,
      height: 3,
      borderRadius: 2,
      backgroundColor: colors.gray[400],
      marginHorizontal: 4,
    },
  });
