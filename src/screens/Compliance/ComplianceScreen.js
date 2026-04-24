import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { spacing, typography, borderRadius, shadows } from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';
import {
  getMyDocuments,
  getComplianceSummary,
  STATUS_META,
} from '../../services/compliance';

const FILTERS = [
  { key: 'all', labelKey: 'app.compliance.filters.all', fallback: 'All' },
  { key: 'attention', labelKey: 'app.compliance.filters.attention', fallback: 'Needs Attention' },
  { key: 'valid', labelKey: 'app.compliance.filters.valid', fallback: 'Valid' },
  { key: 'pending', labelKey: 'app.compliance.filters.pending', fallback: 'Pending' },
];

const STATUS_PRIORITY = {
  expired: 0,
  rejected: 1,
  missing: 2,
  expiring_soon: 3,
  pending: 4,
  valid: 5,
  no_expiry: 6,
};

function formatDate(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function daysFromNow(iso) {
  if (!iso) return null;
  return Math.floor((new Date(iso) - new Date()) / (1000 * 60 * 60 * 24));
}

export default function ComplianceScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { userData } = useAuth();
  const { t } = useLanguage();

  const [items, setItems] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');

  const load = useCallback(async () => {
    try {
      const [docs, sum] = await Promise.all([getMyDocuments(), getComplianceSummary()]);
      setItems(docs);
      setSummary(sum);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Refresh when the screen is re-focused (e.g. after an upload in detail screen).
  useEffect(() => {
    const unsub = navigation?.addListener?.('focus', load);
    return unsub;
  }, [navigation, load]);

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  const filtered = useMemo(() => {
    let list = [...items];
    if (filter === 'attention') {
      list = list.filter((i) =>
        ['expired', 'expiring_soon', 'rejected', 'missing'].includes(i.status)
      );
    } else if (filter === 'valid') {
      list = list.filter((i) => ['valid', 'no_expiry'].includes(i.status));
    } else if (filter === 'pending') {
      list = list.filter((i) => i.status === 'pending');
    }
    list.sort((a, b) => {
      const p = (STATUS_PRIORITY[a.status] ?? 99) - (STATUS_PRIORITY[b.status] ?? 99);
      if (p !== 0) return p;
      return a.type.name.localeCompare(b.type.name);
    });
    return list;
  }, [items, filter]);

  const openDetail = (item) => {
    navigation.navigate('ComplianceDetail', {
      typeId: item.type.id,
      docId: item.document?.id || null,
    });
  };

  const renderHeader = () => (
    <>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, spacing.md) + spacing.sm }]}>
        <Text style={styles.headerTitle}>
          {t('app.compliance.title', 'My Compliance')}
        </Text>
        <Text style={styles.headerSubtitle}>
          {userData?.name || t('app.compliance.employee', 'Employee')}
          {userData?.jobTitle ? ` · ${userData.jobTitle}` : ''}
        </Text>
      </View>

      {summary ? (
        <View style={styles.summaryRow}>
          <SummaryCard
            value={summary.needsAttention}
            label={t('app.compliance.needsAttention', 'Needs Attention')}
            color={summary.needsAttention > 0 ? colors.error : colors.success}
            styles={styles}
          />
          <SummaryCard
            value={summary.pending}
            label={t('app.compliance.pending', 'Pending')}
            color={colors.info}
            styles={styles}
          />
          <SummaryCard
            value={summary.valid + summary.no_expiry}
            label={t('app.compliance.onFile', 'On File')}
            color={colors.success}
            styles={styles}
          />
        </View>
      ) : null}

      <View style={styles.filterRow}>
        {FILTERS.map((f) => {
          const active = filter === f.key;
          return (
            <TouchableOpacity
              key={f.key}
              onPress={() => setFilter(f.key)}
              style={[styles.chip, active && styles.chipActive]}
              activeOpacity={0.8}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {t(f.labelKey, f.fallback)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        {renderHeader()}
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {renderHeader()}

        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="checkmark-circle-outline" size={48} color={colors.gray[400]} />
            <Text style={styles.emptyText}>
              {t('app.compliance.emptyForFilter', 'Nothing here.')}
            </Text>
          </View>
        ) : (
          filtered.map((item) => (
            <DocumentCard
              key={item.type.id}
              item={item}
              onPress={() => openDetail(item)}
              styles={styles}
              colors={colors}
            />
          ))
        )}

        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </View>
  );
}

function SummaryCard({ value, label, color, styles }) {
  return (
    <View style={[styles.summaryCard, { borderLeftColor: color }]}>
      <Text style={[styles.summaryValue, { color }]}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

function DocumentCard({ item, onPress, styles, colors }) {
  const meta = STATUS_META[item.status];
  const daysLeft = item.document?.expiresAt ? daysFromNow(item.document.expiresAt) : null;

  let expiryLine;
  if (item.status === 'missing') {
    expiryLine = 'Not uploaded';
  } else if (item.status === 'no_expiry') {
    expiryLine = "Doesn't expire";
  } else if (item.document?.expiresAt) {
    if (daysLeft < 0) {
      expiryLine = `Expired ${Math.abs(daysLeft)}d ago · ${formatDate(item.document.expiresAt)}`;
    } else if (daysLeft <= 30) {
      expiryLine = `Expires in ${daysLeft}d · ${formatDate(item.document.expiresAt)}`;
    } else {
      expiryLine = `Expires ${formatDate(item.document.expiresAt)}`;
    }
  } else {
    expiryLine = '—';
  }

  return (
    <TouchableOpacity style={styles.docCard} activeOpacity={0.7} onPress={onPress}>
      <View style={[styles.docIcon, { backgroundColor: item.category.color + '15' }]}>
        <Ionicons name={item.category.icon} size={22} color={item.category.color} />
      </View>
      <View style={styles.docBody}>
        <View style={styles.docTopRow}>
          <Text style={styles.docName} numberOfLines={1}>
            {item.type.name}
          </Text>
          <View style={[styles.statusPill, { backgroundColor: meta.bg }]}>
            <Text style={[styles.statusPillText, { color: meta.color }]}>{meta.label}</Text>
          </View>
        </View>
        <Text style={styles.docCategory}>{item.category.name}</Text>
        <Text style={styles.docExpiry}>{expiryLine}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.gray[400]} />
    </TouchableOpacity>
  );
}

const makeStyles = (colors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scrollContent: { paddingBottom: spacing.xl },
    header: {
      backgroundColor: colors.primary,
      paddingHorizontal: spacing.md,
      paddingBottom: spacing.md,
    },
    headerTitle: {
      fontSize: typography.fontSize.xxl,
      fontWeight: typography.fontWeight.bold,
      color: colors.white,
    },
    headerSubtitle: {
      fontSize: typography.fontSize.sm,
      color: colors.white,
      opacity: 0.85,
      marginTop: 2,
    },
    summaryRow: {
      flexDirection: 'row',
      gap: spacing.sm,
      paddingHorizontal: spacing.md,
      marginTop: -spacing.md,
      marginBottom: spacing.sm,
    },
    summaryCard: {
      flex: 1,
      backgroundColor: colors.card,
      borderLeftWidth: 4,
      borderRadius: borderRadius.lg,
      padding: spacing.sm + 2,
      ...shadows.sm,
    },
    summaryValue: {
      fontSize: typography.fontSize.xxl,
      fontWeight: typography.fontWeight.bold,
    },
    summaryLabel: {
      fontSize: typography.fontSize.xs,
      color: colors.textLight,
      marginTop: 2,
    },
    filterRow: {
      flexDirection: 'row',
      gap: spacing.sm,
      paddingHorizontal: spacing.md,
      marginTop: spacing.sm,
      marginBottom: spacing.sm,
      flexWrap: 'wrap',
    },
    chip: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs + 2,
      borderRadius: borderRadius.full,
      borderWidth: 1,
      borderColor: colors.gray[300],
      backgroundColor: colors.card,
    },
    chipActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    chipText: {
      fontSize: typography.fontSize.sm,
      color: colors.textDark,
      fontWeight: typography.fontWeight.medium,
    },
    chipTextActive: { color: colors.white },
    docCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      marginHorizontal: spacing.md,
      marginBottom: spacing.sm,
      padding: spacing.md,
      borderRadius: borderRadius.lg,
      ...shadows.sm,
    },
    docIcon: {
      width: 44,
      height: 44,
      borderRadius: borderRadius.md,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.sm + 4,
    },
    docBody: { flex: 1 },
    docTopRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 2,
    },
    docName: {
      flex: 1,
      fontSize: typography.fontSize.md,
      fontWeight: typography.fontWeight.semibold,
      color: colors.textDark,
      marginRight: spacing.xs,
    },
    docCategory: {
      fontSize: typography.fontSize.xs,
      color: colors.textLight,
      marginBottom: 2,
    },
    docExpiry: {
      fontSize: typography.fontSize.xs,
      color: colors.text,
    },
    statusPill: {
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
      borderRadius: borderRadius.full,
    },
    statusPillText: {
      fontSize: 10,
      fontWeight: typography.fontWeight.bold,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    loader: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    empty: {
      alignItems: 'center',
      padding: spacing.xl,
    },
    emptyText: {
      marginTop: spacing.sm,
      color: colors.textLight,
      fontSize: typography.fontSize.sm,
    },
  });
