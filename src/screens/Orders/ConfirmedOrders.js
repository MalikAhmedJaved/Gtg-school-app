import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { colors, spacing, typography, borderRadius, shadows } from '../../constants/theme';
import { getOrders, sortOrdersBySchedule, SERVICE_TYPES, ORDER_STATUSES } from '../../utils/orderService';
import { formatDate, formatTimeRange } from '../../utils/formatters';
import { navigate as rootNavigate } from '../../utils/rootNavigation';
import Button from '../../components/Common/Button';

const groupRecurringOrders = (items) => {
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
      groups.set(key, { ...task, isRecurring: true, recurrenceCount: 1, _count: 1 });
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

  return [...grouped, ...singles];
};

const ConfirmedOrders = ({ navigation }) => {
  const { t } = useLanguage();
  const { isAuthenticated, userRole } = useAuth();
  const [orders, setOrders] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    try {
      const data = await getOrders();
      const visibleOrders = userRole === 'cleaner'
        ? data.filter((order) => !['assigned', 'completed', 'cancelled', 'archived'].includes(order.status))
        : data.filter((order) => !['completed', 'cancelled', 'archived'].includes(order.status));
      const nextOrders = userRole === 'cleaner'
        ? sortOrdersBySchedule(visibleOrders, 'desc')
        : sortOrdersBySchedule(groupRecurringOrders(visibleOrders), 'desc');
      setOrders(nextOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  }, [userRole]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, fetchOrders]);

  // Refresh when screen is focused
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (isAuthenticated) fetchOrders();
    });
    return unsubscribe;
  }, [navigation, isAuthenticated, fetchOrders]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  };

  const formatClientLocation = (client) => {
    return `${client?.city || '-'} • ${client?.zipCode || '-'}`;
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Ionicons name="lock-closed-outline" size={64} color={colors.gray[300]} />
          <Text style={styles.emptyTitle}>{t('orders.loginRequired', 'Login Required')}</Text>
          <Text style={styles.emptyMessage}>
            {t('orders.loginRequiredMsg', 'Please log in to view your orders.')}
          </Text>
          <Button
            title={t('orders.goToLogin', 'Go to Login')}
            onPress={() => rootNavigate('MenuTab', { screen: 'Login' })}
          />
        </View>
      </SafeAreaView>
    );
  }

  const renderOrderCard = ({ item }) => {
    const statusInfo = ORDER_STATUSES[item.status] || ORDER_STATUSES.pending;
    const serviceLabel = SERVICE_TYPES[item.serviceType] || item.serviceType;

    return (
      <TouchableOpacity
        style={styles.orderCard}
        onPress={() => navigation.navigate('OrderDetail', { order: item })}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <Ionicons name="document-text-outline" size={20} color={colors.primary} />
            <Text style={styles.serviceType}>{serviceLabel}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusInfo.color + '20' }]}>
            <Text style={[styles.statusText, { color: statusInfo.color }]}>
              {statusInfo.label}
            </Text>
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

        <View style={styles.cardDetails}>
          {item.address ? (
            <View style={styles.detailRow}>
              <Ionicons name="location-outline" size={16} color={colors.textLight} />
              <Text style={styles.detailText} numberOfLines={1}>{item.address}</Text>
            </View>
          ) : null}
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={16} color={colors.textLight} />
            <Text style={styles.detailText}>
              {formatDate(item.date)}  •  {formatTimeRange(item.time, item.endTime)}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="time-outline" size={16} color={colors.textLight} />
            <Text style={styles.detailText}>
              {item.calculatedHours || item.manualHours || '–'} {t('admin.hours', 'hours')}
            </Text>
          </View>
          {userRole === 'cleaner' && item.client?.name ? (
            <View style={styles.detailRow}>
              <Ionicons name="person-outline" size={16} color={colors.textLight} />
              <Text style={styles.detailText}>
                {t('cleaner.client', 'Client')}: {item.client.name}
                {' • '}{formatClientLocation(item.client)}
              </Text>
            </View>
          ) : null}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('orders.title', 'My Orders')}</Text>
      </View>

      {orders.length === 0 && !loading ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="receipt-outline" size={64} color={colors.gray[300]} />
          <Text style={styles.emptyTitle}>{t('orders.noOrders', 'No orders yet')}</Text>
          <Text style={styles.emptyMessage}>
            {t('orders.noOrdersDesc', 'Your orders will appear here once you place one.')}
          </Text>
          <Button
            title={t('orders.createNewOrder', 'Create New Order')}
            onPress={() => rootNavigate('NewOrderTab')}
          />
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
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  header: {
    backgroundColor: colors.primary,
    padding: spacing.lg,
    paddingTop: spacing.xl,
  },
  headerTitle: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  orderCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
    borderWidth: 1,
    borderColor: colors.gray[100],
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  serviceType: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginLeft: spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
  },
  statusText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    textTransform: 'uppercase',
  },
  categoryLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
    marginBottom: spacing.sm,
    marginLeft: 28,
  },
  recurringBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryDark + '10',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.md,
    alignSelf: 'flex-start',
    marginBottom: spacing.xs,
    marginLeft: 28,
  },
  recurringText: {
    fontSize: typography.fontSize.xs,
    color: colors.primaryDark,
    marginLeft: 4,
    fontWeight: typography.fontWeight.medium,
  },
  cardDetails: {
    marginTop: spacing.xs,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailText: {
    fontSize: typography.fontSize.sm,
    color: colors.textLight,
    marginLeft: spacing.sm,
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  emptyMessage: {
    fontSize: typography.fontSize.md,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 22,
  },
});

export default ConfirmedOrders;
