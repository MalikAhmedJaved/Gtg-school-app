import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { spacing, typography, borderRadius, shadows } from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';
import { getUpdatesByCategory, getTherapistById } from '../../utils/mockData';

export default function CategoryDetailScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { category } = route.params;
  const updates = getUpdatesByCategory(category.id);

  const renderUpdate = (update) => {
    const therapist = getTherapistById(update.therapistId);
    if (!therapist) return null;

    const updateDate = new Date(update.timestamp);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isToday = updateDate >= today;
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = updateDate >= yesterday && updateDate < today;

    let dateLabel = updateDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
    if (isToday) dateLabel = 'Today';
    if (isYesterday) dateLabel = 'Yesterday';

    return (
      <View key={update.id} style={styles.updateCard}>
        <View style={styles.dateTag}>
          <Text style={styles.dateTagText}>{dateLabel}</Text>
        </View>
        <View style={styles.updateHeader}>
          <View style={[styles.therapistAvatar, { backgroundColor: therapist.color }]}>
            <Text style={styles.avatarText}>{therapist.name.charAt(0)}</Text>
          </View>
          <View style={styles.therapistInfo}>
            <Text style={styles.therapistName}>{therapist.fullName}</Text>
            <Text style={styles.updateTime}>{update.time}</Text>
          </View>
        </View>
        <Text style={styles.updateMessage}>{update.message}</Text>
        {update.hasPhotos && update.photos && update.photos.length > 0 && (
          <View style={update.photos.length === 1 ? styles.singlePhotoWrap : styles.photoRow}>
            {update.photos.map((img, i) => (
              <Image
                key={i}
                source={img}
                style={update.photos.length === 1 ? styles.singlePhoto : styles.gridPhoto}
                resizeMode="cover"
              />
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, spacing.md) + spacing.sm, backgroundColor: category.color }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <Ionicons name={category.icon} size={28} color={colors.white} style={{ marginRight: spacing.sm }} />
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>{category.name}</Text>
          <Text style={styles.headerSubtitle}>{updates.length} update{updates.length !== 1 ? 's' : ''}</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {updates.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name={category.icon} size={64} color={colors.gray[300]} />
            <Text style={styles.emptyTitle}>No updates yet</Text>
            <Text style={styles.emptyText}>Updates from your child's {category.name.toLowerCase()} sessions will appear here.</Text>
          </View>
        ) : (
          updates.map(renderUpdate)
        )}
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
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.md,
      paddingBottom: spacing.lg,
    },
    backButton: {
      padding: spacing.sm,
      marginRight: spacing.xs,
    },
    headerTitle: {
      fontSize: typography.fontSize.xl,
      fontWeight: typography.fontWeight.bold,
      color: colors.white,
    },
    headerSubtitle: {
      fontSize: typography.fontSize.sm,
      color: 'rgba(255,255,255,0.8)',
    },
    scrollContent: {
      padding: spacing.md,
    },
    updateCard: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      marginBottom: spacing.md,
      ...shadows.sm,
    },
    dateTag: {
      alignSelf: 'flex-start',
      backgroundColor: colors.gray[100],
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
      borderRadius: borderRadius.full,
      marginBottom: spacing.sm,
    },
    dateTagText: {
      fontSize: typography.fontSize.xs,
      fontWeight: typography.fontWeight.semibold,
      color: colors.textLight,
    },
    updateHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    therapistAvatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.md,
    },
    avatarText: {
      fontSize: typography.fontSize.md,
      fontWeight: typography.fontWeight.bold,
      color: colors.white,
    },
    therapistInfo: {
      flex: 1,
    },
    therapistName: {
      fontSize: typography.fontSize.md,
      fontWeight: typography.fontWeight.semibold,
      color: colors.textDark,
    },
    updateTime: {
      fontSize: typography.fontSize.xs,
      color: colors.textLight,
      marginTop: 2,
    },
    updateMessage: {
      fontSize: typography.fontSize.md,
      color: colors.text,
      lineHeight: 22,
    },
    emptyState: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing.xxl * 2,
      paddingHorizontal: spacing.xl,
    },
    emptyTitle: {
      fontSize: typography.fontSize.xl,
      fontWeight: typography.fontWeight.bold,
      color: colors.gray[500],
      marginTop: spacing.md,
    },
    emptyText: {
      fontSize: typography.fontSize.md,
      color: colors.textLight,
      textAlign: 'center',
      marginTop: spacing.sm,
    },
    singlePhotoWrap: {
      flexDirection: 'row',
      gap: spacing.sm,
      marginTop: spacing.md,
    },
    singlePhoto: {
      width: 120,
      height: 90,
      borderRadius: borderRadius.md,
    },
    photoRow: {
      flexDirection: 'row',
      gap: spacing.sm,
      marginTop: spacing.md,
    },
    gridPhoto: {
      width: 120,
      height: 90,
      borderRadius: borderRadius.md,
    },
    bottomPadding: {
      height: spacing.xl,
    },
  });
