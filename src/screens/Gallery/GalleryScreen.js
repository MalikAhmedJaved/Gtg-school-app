import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  Dimensions,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../contexts/LanguageContext';
import { spacing, typography, borderRadius, shadows } from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';

const DUMMY_MEDIA = [
  {
    id: 'm1',
    type: 'photo',
    uri: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=800&q=80',
    caption: 'Music therapy circle time',
    date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'm2',
    type: 'photo',
    uri: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&q=80',
    caption: 'Sensory play with textured balls',
    date: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'm3',
    type: 'video',
    uri: 'https://images.unsplash.com/photo-1503919005314-30d93d07d823?w=800&q=80',
    videoUrl: 'https://www.youtube.com/@glorytogodppec',
    caption: 'First independent steps!',
    date: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'm4',
    type: 'photo',
    uri: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=800&q=80',
    caption: 'Art therapy session',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'm5',
    type: 'photo',
    uri: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=800&q=80',
    caption: 'Outdoor play time',
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'm6',
    type: 'video',
    uri: 'https://images.unsplash.com/photo-1602052577122-f73b9710adba?w=800&q=80',
    videoUrl: 'https://www.youtube.com/@glorytogodppec',
    caption: 'Story time with Ms. Sarah',
    date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'm7',
    type: 'photo',
    uri: 'https://images.unsplash.com/photo-1491013516836-7db643ee125a?w=800&q=80',
    caption: 'Learning through play',
    date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'm8',
    type: 'photo',
    uri: 'https://images.unsplash.com/photo-1519340333755-56e9c1d5cd56?w=800&q=80',
    caption: 'Physical therapy progress',
    date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const TABS = [
  { key: 'all', labelEn: 'All' },
  { key: 'photo', labelKey: 'app.gallery.photos', fallback: 'Photos' },
  { key: 'video', labelKey: 'app.gallery.videos', fallback: 'Videos' },
];

const screenWidth = Dimensions.get('window').width;
const TILE_SIZE = (screenWidth - spacing.md * 2 - spacing.sm * 2) / 3;

function formatDate(d) {
  if (!d) return '';
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return '';
  const diffMs = Date.now() - date.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) return `${Math.max(1, mins)}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString('en-GB');
}

export default function GalleryScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { t } = useLanguage();
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);

  const filtered = useMemo(() => {
    if (filter === 'all') return DUMMY_MEDIA;
    return DUMMY_MEDIA.filter((m) => m.type === filter);
  }, [filter]);

  const openItem = (item) => setSelected(item);
  const closeItem = () => setSelected(null);

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, spacing.md) + spacing.sm }]}>
        <TouchableOpacity onPress={() => navigation?.goBack?.()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('app.gallery.title', 'Photo Gallery')}</Text>
        <View style={styles.backBtn} />
      </View>

      <View style={styles.tabBar}>
        {TABS.map((tab) => {
          const label =
            tab.key === 'all' ? 'All' : t(tab.labelKey, tab.fallback);
          const active = filter === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, active && styles.tabActive]}
              onPress={() => setFilter(tab.key)}
              activeOpacity={0.75}
            >
              <Text style={[styles.tabText, active && styles.tabTextActive]}>{label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="images-outline" size={44} color={colors.gray[400]} />
            <Text style={styles.emptyText}>{t('app.gallery.empty', 'No photos yet.')}</Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {filtered.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.tile}
                activeOpacity={0.85}
                onPress={() => openItem(item)}
              >
                <Image source={{ uri: item.uri }} style={styles.tileImage} resizeMode="cover" />
                {item.type === 'video' ? (
                  <View style={styles.videoBadge}>
                    <Ionicons name="play-circle" size={34} color={colors.white} />
                  </View>
                ) : null}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      <Modal
        visible={!!selected}
        transparent
        animationType="fade"
        onRequestClose={closeItem}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalClose}
            onPress={closeItem}
            activeOpacity={0.8}
          >
            <Ionicons name="close" size={28} color={colors.white} />
          </TouchableOpacity>

          {selected ? (
            <View style={styles.modalBody}>
              <Image source={{ uri: selected.uri }} style={styles.modalImage} resizeMode="contain" />
              {selected.type === 'video' ? (
                <TouchableOpacity
                  style={styles.playBtn}
                  onPress={() =>
                    selected.videoUrl &&
                    Linking.openURL(selected.videoUrl).catch((e) =>
                      console.warn('Failed to open video:', e)
                    )
                  }
                  activeOpacity={0.8}
                >
                  <Ionicons name="play" size={18} color={colors.white} />
                  <Text style={styles.playBtnText}>Play video</Text>
                </TouchableOpacity>
              ) : null}
              <Text style={styles.modalCaption}>{selected.caption}</Text>
              <Text style={styles.modalDate}>{formatDate(selected.date)}</Text>
            </View>
          ) : null}
        </View>
      </Modal>
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
    tabBar: {
      flexDirection: 'row',
      backgroundColor: colors.card,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      gap: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.gray[100],
    },
    tab: {
      paddingVertical: 6,
      paddingHorizontal: spacing.md,
      borderRadius: borderRadius.full,
      backgroundColor: colors.gray[100],
    },
    tabActive: {
      backgroundColor: colors.primary,
    },
    tabText: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.semibold,
      color: colors.textDark,
    },
    tabTextActive: {
      color: colors.white,
    },
    scrollContent: {
      padding: spacing.md,
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
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    tile: {
      width: TILE_SIZE,
      height: TILE_SIZE,
      borderRadius: borderRadius.md,
      overflow: 'hidden',
      backgroundColor: colors.gray[200],
      ...shadows.sm,
    },
    tileImage: {
      width: '100%',
      height: '100%',
    },
    videoBadge: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(0,0,0,0.2)',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.9)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.md,
    },
    modalClose: {
      position: 'absolute',
      top: 48,
      right: spacing.md,
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(255,255,255,0.15)',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2,
    },
    modalBody: {
      width: '100%',
      alignItems: 'center',
      gap: spacing.sm,
    },
    modalImage: {
      width: '100%',
      height: screenWidth,
      maxHeight: 480,
      borderRadius: borderRadius.md,
    },
    playBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.full,
      backgroundColor: colors.primary,
      marginTop: spacing.xs,
    },
    playBtnText: {
      color: colors.white,
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.semibold,
    },
    modalCaption: {
      color: colors.white,
      fontSize: typography.fontSize.md,
      fontWeight: typography.fontWeight.semibold,
      textAlign: 'center',
      marginTop: spacing.sm,
    },
    modalDate: {
      color: colors.gray[300],
      fontSize: typography.fontSize.xs,
    },
  });
