import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Platform,
  StatusBar,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { colors, spacing, typography, borderRadius, shadows } from '../../constants/theme';
import { getOrders, sortOrdersBySchedule, SERVICE_TYPES, CLEANING_CATEGORIES, ORDER_STATUSES } from '../../utils/orderService';
import { formatDate, formatTimeRange } from '../../utils/formatters';

const PendingOrders = ({ navigation }) => {
  const { t } = useLanguage();
  const { userRole } = useAuth();
  const isCleaner = userRole === 'cleaner';
  const [orders, setOrders] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const groupRecurringClientOrders = (items) => {
    const groups = new Map();
    const singles = [];

    (Array.isArray(items) ? items : []).forEach((task) => {
      const groupId = task.recurrenceGroupId;
      if (!groupId) {
        singles.push({ ...task, recurrenceCount: task.recurrenceCount || 1, isRecurring: Boolean(task.isRecurring) });
        return;
      }

      const key = String(groupId);
      const existing = groups.get(key);
      if (!existing) {
        groups.set(key, {
          ...task,
          isRecurring: true,
          recurrenceCount: 1,
          _count: 1,
        });
        return;
      }

      existing._count += 1;
      existing.recurrenceCount = Math.max(existing.recurrenceCount || 1, existing._count, task.recurrenceCount || 1);

      const existingDate = existing.date ? new Date(existing.date) : null;
      const candidateDate = task.date ? new Date(task.date) : null;
      if (candidateDate && (!existingDate || candidateDate < existingDate)) {
        Object.assign(existing, {
          ...task,
          isRecurring: true,
          recurrenceCount: existing.recurrenceCount,
          _count: existing._count,
        });
      }
    });

    const grouped = Array.from(groups.values()).map((task) => {
      const normalized = { ...task };
      delete normalized._count;
      return normalized;
    });

    return sortOrdersBySchedule([...grouped, ...singles], 'desc');
  };

  const fetchOrders = useCallback(async () => {
    try {
      const data = await getOrders({ status: isCleaner ? 'assigned' : 'pending' });
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const upcomingOnly = (Array.isArray(data) ? data : []).filter((task) => {
        if (!task.date) return true;
        const taskDate = new Date(task.date);
        taskDate.setHours(0, 0, 0, 0);
        return taskDate >= today;
      });
      const filteredData = isCleaner
        ? groupRecurringClientOrders(upcomingOnly.filter((task) => task.status === 'assigned'))
        : groupRecurringClientOrders(upcomingOnly);
      setOrders(filteredData);
    } catch (error) {
      console.error('Error fetching pending orders:', error);
    } finally {
      setLoading(false);
    }
  }, [isCleaner]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', fetchOrders);
    return unsubscribe;
  }, [navigation, fetchOrders]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  };

  const formatClientLocation = (client) => {
    return `${client?.city || '-'} • ${client?.zipCode || '-'}`;
  };

  const renderOrderCard = ({ item }) => {
    const statusInfo = ORDER_STATUSES[item.status] || ORDER_STATUSES.pending;
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('OrderDetail', { order: item })}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.serviceType}>
            {SERVICE_TYPES[item.serviceType] || item.serviceType}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: statusInfo.color + '20' }]}>
            <Text style={[styles.statusText, { color: statusInfo.color }]}>{statusInfo.label}</Text>
          </View>
        </View>
        {item.isRecurring ? (
          <View style={styles.recurringBadge}>
            <Ionicons name="repeat" size={13} color={colors.primaryDark} />
            <Text style={styles.recurringText}>
              {`Recurring every ${item.recurrenceEvery ?? 1} week(s)`}
              {item.recurrenceCount ? ` (${item.recurrenceCount} tasks)` : ''}
            </Text>
          </View>
        ) : null}
        <View style={styles.detailRow}>
          <Ionicons name="location-outline" size={15} color={colors.textLight} />
          <Text style={styles.detailText} numberOfLines={1}>{item.address || '—'}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={15} color={colors.textLight} />
          <Text style={styles.detailText}>{formatDate(item.date)}  •  {formatTimeRange(item.time, item.endTime)}</Text>
        </View>
        {(item.calculatedHours || item.hours) ? (
          <View style={styles.detailRow}>
            <Ionicons name="hourglass-outline" size={15} color={colors.textLight} />
            <Text style={styles.detailText}>{item.calculatedHours || item.hours} {t('admin.hours', 'hours')}</Text>
          </View>
        ) : null}
        {isCleaner && item.client?.name ? (
          <View style={styles.detailRow}>
            <Ionicons name="person-outline" size={15} color={colors.textLight} />
            <Text style={styles.detailText}>
              {t('cleaner.client', 'Client')}: {item.client.name}
              {' • '}{formatClientLocation(item.client)}
            </Text>
          </View>
        ) : null}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {orders.length === 0 && !loading ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="time-outline" size={64} color={colors.gray[300]} />
          <Text style={styles.emptyTitle}>{t('orders.pendingOrders', 'Pending Orders')}</Text>
          <Text style={styles.emptyMessage}>{t('client.noPendingRequests', 'No pending requests.')}</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrderCard}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray[50], paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  listContent: { padding: spacing.md, paddingBottom: spacing.xxl },
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
    borderWidth: 1,
    borderColor: colors.gray[100],
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  serviceType: { fontSize: typography.fontSize.md, fontWeight: typography.fontWeight.bold, color: colors.text },
  statusBadge: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: borderRadius.full },
  statusText: { fontSize: typography.fontSize.xs, fontWeight: typography.fontWeight.bold, textTransform: 'uppercase' },
  category: { fontSize: typography.fontSize.sm, color: colors.primary, marginBottom: spacing.xs },
  recurringBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    marginBottom: spacing.xs,
  },
  recurringText: {
    fontSize: typography.fontSize.xs,
    color: colors.primaryDark,
    fontWeight: typography.fontWeight.semibold,
    marginLeft: 4,
  },
  detailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 3 },
  detailText: { fontSize: typography.fontSize.sm, color: colors.textLight, marginLeft: spacing.xs, flex: 1 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  emptyTitle: { fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.bold, color: colors.text, marginTop: spacing.md },
  emptyMessage: { fontSize: typography.fontSize.md, color: colors.textLight, textAlign: 'center', marginTop: spacing.sm },
});

export default PendingOrders;
