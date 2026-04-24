import React, { useCallback, useMemo, useState } from 'react';
import {
  Image,
  Linking,
  Platform,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing, typography, borderRadius, shadows } from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';

const DUMMY_POSTS = [
  {
    id: 'ig-1',
    source: 'instagram',
    handle: '@glorytogodppec',
    caption: {
      en: 'Another joyful day at Glory to God PPEC! Our little ones had so much fun during music therapy today. Swipe to see their smiles!',
      es: '¡Otro día alegre en Glory to God PPEC! Nuestros pequeños se divirtieron mucho durante la terapia musical hoy. ¡Desliza para ver sus sonrisas!',
    },
    thumbnail: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=600&q=80',
    url: 'https://www.instagram.com/glorytogodppec/',
    createdAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
  },
  {
    id: 'yt-1',
    source: 'youtube',
    handle: 'Glory to God PPEC',
    caption: {
      en: 'Watch how our occupational therapy team helps children build confidence and independence through play-based learning.',
      es: 'Mira cómo nuestro equipo de terapia ocupacional ayuda a los niños a desarrollar confianza e independencia a través del aprendizaje basado en el juego.',
    },
    thumbnail: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=600&q=80',
    url: 'https://www.youtube.com/@glorytogodppec',
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'ig-2',
    source: 'instagram',
    handle: '@glorytogodppec',
    caption: {
      en: 'Celebrating milestones big and small. Huge congrats to our superstar for taking their first independent steps today!',
      es: 'Celebrando hitos grandes y pequeños. ¡Felicitaciones a nuestra superestrella por dar sus primeros pasos independientes hoy!',
    },
    thumbnail: 'https://images.unsplash.com/photo-1503919005314-30d93d07d823?w=600&q=80',
    url: 'https://www.instagram.com/glorytogodppec/',
    createdAt: new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'yt-2',
    source: 'youtube',
    handle: 'Glory to God PPEC',
    caption: {
      en: 'A day in the life at our PPEC center — meet the caring team behind every smile.',
      es: 'Un día en la vida de nuestro centro PPEC: conoce al cariñoso equipo detrás de cada sonrisa.',
    },
    thumbnail: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=600&q=80',
    url: 'https://www.youtube.com/@glorytogodppec',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'ig-3',
    source: 'instagram',
    handle: '@glorytogodppec',
    caption: {
      en: 'Sensory-friendly activities keep our kids engaged and growing every day. Thank you to our amazing therapists!',
      es: 'Las actividades amigables a los sentidos mantienen a nuestros niños comprometidos y creciendo cada día. ¡Gracias a nuestros increíbles terapeutas!',
    },
    thumbnail: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=600&q=80',
    url: 'https://www.instagram.com/glorytogodppec/',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

function formatWhen(dateInput, t, language) {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) return '';
  const diffMs = Date.now() - date.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return t('app.notifications.justNow', 'Just now');
  if (mins < 60) return t('app.notifications.minsAgo', '{n}m ago').replace('{n}', mins);
  const hours = Math.floor(mins / 60);
  if (hours < 24) return t('app.notifications.hoursAgo', '{n}h ago').replace('{n}', hours);
  const days = Math.floor(hours / 24);
  if (days < 7) return t('app.notifications.daysAgo', '{n}d ago').replace('{n}', days);
  return date.toLocaleDateString(language === 'es' ? 'es-ES' : 'en-GB');
}

const SOURCE_META = {
  instagram: { label: 'Instagram', icon: 'logo-instagram', color: '#E1306C' },
  youtube: { label: 'YouTube', icon: 'logo-youtube', color: '#FF0000' },
};

const NotificationsScreen = () => {
  const { colors } = useTheme();
  const { t, lr, language } = useLanguage();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [refreshing, setRefreshing] = useState(false);
  const [posts, setPosts] = useState(DUMMY_POSTS);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setPosts([...DUMMY_POSTS]);
      setRefreshing(false);
    }, 700);
  }, []);

  const openPost = (url) => {
    if (!url) return;
    Linking.openURL(url).catch((err) => console.warn('Failed to open link:', err));
  };

  const titleForSource = (source) =>
    source === 'youtube'
      ? t('app.notifications.newVideoYoutube', 'New video on YouTube')
      : t('app.notifications.newPostInstagram', 'New post on Instagram');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('app.notifications.title', 'Notifications')}</Text>
        <Text style={styles.subtitle}>
          {t('app.notifications.subtitle', 'Latest posts from Glory to God PPEC')}
        </Text>
      </View>

      <ScrollView
        style={styles.listWrap}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {posts.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="notifications-off-outline" size={44} color={colors.gray[400]} />
            <Text style={styles.emptyTitle}>
              {t('app.notifications.emptyTitle', 'No notifications yet')}
            </Text>
            <Text style={styles.emptyText}>
              {t('app.notifications.emptyText', 'New social posts will appear here.')}
            </Text>
          </View>
        ) : (
          posts.map((item) => {
            const meta = SOURCE_META[item.source] || SOURCE_META.instagram;
            return (
              <TouchableOpacity
                key={item.id}
                style={styles.card}
                activeOpacity={0.85}
                onPress={() => openPost(item.url)}
              >
                <View style={styles.cardHeaderRow}>
                  <View style={[styles.sourceBadge, { backgroundColor: meta.color }]}>
                    <Ionicons name={meta.icon} size={14} color={colors.white} />
                    <Text style={styles.sourceBadgeText}>{meta.label}</Text>
                  </View>
                  <Text style={styles.cardTime}>{formatWhen(item.createdAt, t, language)}</Text>
                </View>

                {item.thumbnail ? (
                  <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} resizeMode="cover" />
                ) : null}

                <View style={styles.cardBody}>
                  <Text style={styles.cardTitle}>{titleForSource(item.source)}</Text>
                  <Text style={styles.cardHandle}>{item.handle}</Text>
                  <Text style={styles.cardMessage} numberOfLines={3}>
                    {lr(item.caption)}
                  </Text>
                  <View style={styles.openRow}>
                    <Text style={[styles.openLink, { color: meta.color }]}>
                      {t('app.notifications.viewOn', 'View on')} {meta.label}
                    </Text>
                    <Ionicons name="open-outline" size={14} color={meta.color} />
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const makeStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#f4f8fc',
      paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    header: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      backgroundColor: colors.card,
      borderBottomColor: colors.gray[200],
      borderBottomWidth: 1,
    },
    title: {
      fontSize: typography.fontSize.xxl,
      fontWeight: typography.fontWeight.bold,
      color: colors.text,
    },
    subtitle: {
      marginTop: 2,
      fontSize: typography.fontSize.sm,
      color: colors.gray[600],
    },
    listWrap: {
      flex: 1,
    },
    listContent: {
      padding: spacing.md,
      paddingBottom: spacing.xl,
      gap: spacing.md,
    },
    emptyState: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing.xl * 2,
      gap: spacing.xs,
    },
    emptyTitle: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.semibold,
      color: colors.gray[700],
    },
    emptyText: {
      fontSize: typography.fontSize.sm,
      color: colors.gray[500],
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.lg,
      borderWidth: 1,
      borderColor: colors.gray[200],
      overflow: 'hidden',
      ...shadows.sm,
    },
    cardHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: spacing.md,
      paddingTop: spacing.md,
      paddingBottom: spacing.sm,
    },
    sourceBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
      borderRadius: borderRadius.full,
    },
    sourceBadgeText: {
      color: colors.white,
      fontSize: typography.fontSize.xs,
      fontWeight: typography.fontWeight.semibold,
    },
    cardTime: {
      fontSize: typography.fontSize.xs,
      color: colors.gray[500],
    },
    thumbnail: {
      width: '100%',
      height: 180,
      backgroundColor: colors.gray[100],
    },
    cardBody: {
      padding: spacing.md,
      gap: 4,
    },
    cardTitle: {
      fontSize: typography.fontSize.md,
      fontWeight: typography.fontWeight.bold,
      color: colors.text,
    },
    cardHandle: {
      fontSize: typography.fontSize.xs,
      color: colors.gray[500],
      marginBottom: spacing.xs,
    },
    cardMessage: {
      color: colors.gray[700],
      fontSize: typography.fontSize.sm,
      lineHeight: 20,
    },
    openRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginTop: spacing.sm,
    },
    openLink: {
      fontSize: typography.fontSize.xs,
      fontWeight: typography.fontWeight.semibold,
    },
  });

export default NotificationsScreen;
