import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { colors, spacing, typography, borderRadius, shadows } from '../../constants/theme';
import { getAllUpdates, getTherapistById } from '../../utils/mockData';
import Logo from '../../components/Common/Logo';

const logoPng = require('../../../assets/gtg_logo.png');

export default function HomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { userData } = useAuth();
  const updates = getAllUpdates();
  const childName = userData?.childName || 'your child';

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const renderUpdate = (update) => {
    const therapist = getTherapistById(update.therapistId);
    if (!therapist) return null;

    return (
      <View key={update.id} style={styles.updateCard}>
        <View style={styles.updateHeader}>
          <View style={[styles.therapistAvatar, { backgroundColor: therapist.color }]}>
            <Text style={styles.avatarText}>{therapist.name.charAt(0)}</Text>
          </View>
          <View style={styles.therapistInfo}>
            <View style={styles.therapistNameRow}>
              <Text style={styles.therapistName}>{therapist.name}</Text>
              <Text style={[styles.therapistRole, { color: therapist.color }]}>
                ({therapist.role})
              </Text>
            </View>
            <Text style={styles.updateTime}>{update.time}</Text>
          </View>
        </View>
        <Text style={styles.updateMessage}>{update.message}</Text>
        {update.hasPhotos && update.photos && update.photos.length > 0 && (
          <View style={update.photos.length === 1 ? styles.singlePhotoContainer : styles.photoGrid}>
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
      {/* Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, spacing.md) + spacing.sm }]}>
        <View style={styles.headerContent}>
          <Image source={logoPng} style={styles.headerLogo} resizeMode="cover" />
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Glory to God</Text>
            <Text style={styles.headerSubtitle}>PPEC</Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Greeting */}
        <View style={styles.greetingContainer}>
          <Text style={styles.greeting}>{getGreeting()}, Parent!</Text>
          <Text style={styles.greetingSubtext}>
            Your updates from the therapists today:
          </Text>
        </View>

        {/* Updates Feed */}
        {updates.map(renderUpdate)}

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
    paddingBottom: spacing.md,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerLogo: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  headerTextContainer: {
    marginLeft: spacing.md,
  },
  headerTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  headerSubtitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.secondary,
    letterSpacing: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
  },
  greetingContainer: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  greeting: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  greetingSubtext: {
    fontSize: typography.fontSize.md,
    color: colors.textLight,
  },
  updateCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  updateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  therapistAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  therapistInfo: {
    flex: 1,
  },
  therapistNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  therapistName: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.textDark,
    marginRight: spacing.xs,
  },
  therapistRole: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
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
    marginBottom: spacing.sm,
  },
  singlePhotoContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  singlePhoto: {
    width: 120,
    height: 90,
    borderRadius: borderRadius.md,
  },
  photoGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
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
