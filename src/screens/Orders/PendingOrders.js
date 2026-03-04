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
import { getOrders, SERVICE_TYPES, CLEANING_CATEGORIES, ORDER_STATUSES } from '../../utils/orderService';

const PendingOrders = ({ navigation }) => {
  const { t } = useLanguage();
  const { userRole } = useAuth();
  const isCleaner = userRole === 'cleaner';
  const [orders, setOrders] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const cleanerChecklist = [
    t('cleanerChecklist.arriveOnTime', 'Arrive on time and confirm access details before starting.'),
    t('cleanerChecklist.bringEquipment', 'Bring required equipment and verify any special products needed.'),
    t('cleanerChecklist.handleFragile', 'Handle fragile items carefully and report any issue immediately.'),
    t('cleanerChecklist.followChecklist', 'Follow the task checklist and complete all required areas.'),
    t('cleanerChecklist.beforeAfter', 'Take before/after photos when required by admin or task notes.'),
    t('cleanerChecklist.finalCheck', 'Do a final quality check before leaving the location.'),
  ];

  const fetchOrders = useCallback(async () => {
    try {
      const data = await getOrders({ status: isCleaner ? 'assigned' : 'pending' });
      const filteredData = isCleaner
        ? (Array.isArray(data) ? data.filter((task) => task.status === 'assigned') : [])
        : data;
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
        {item.cleaningCategory && (
          <Text style={styles.category}>{CLEANING_CATEGORIES[item.cleaningCategory]}</Text>
        )}
        <View style={styles.detailRow}>
          <Ionicons name="location-outline" size={15} color={colors.textLight} />
          <Text style={styles.detailText} numberOfLines={1}>{item.address || '—'}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={15} color={colors.textLight} />
          <Text style={styles.detailText}>{item.date || '—'}{item.time ? `  •  ${item.time}` : ''}</Text>
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
            <Text style={styles.detailText}>{t('cleaner.client', 'Client')}: {item.client.name}</Text>
          </View>
        ) : null}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {isCleaner ? (
        <View style={styles.checklistCard}>
          <Text style={styles.checklistTitle}>{t('cleanerChecklist.title', 'Cleaner Checklist')}</Text>
          {cleanerChecklist.map((point, index) => (
            <View key={`check-${index}`} style={styles.checklistRow}>
              <Ionicons name="checkmark-circle" size={16} color={colors.success} />
              <Text style={styles.checklistText}>{point}</Text>
            </View>
          ))}
        </View>
      ) : null}

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
  container: { flex: 1, backgroundColor: colors.gray[50] },
  checklistCard: {
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.gray[200],
    padding: spacing.md,
    ...shadows.sm,
  },
  checklistTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.primaryDark,
    marginBottom: spacing.sm,
  },
  checklistRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  checklistText: {
    flex: 1,
    marginLeft: spacing.xs,
    fontSize: typography.fontSize.sm,
    color: colors.text,
    lineHeight: 20,
  },
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
  detailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 3 },
  detailText: { fontSize: typography.fontSize.sm, color: colors.textLight, marginLeft: spacing.xs, flex: 1 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  emptyTitle: { fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.bold, color: colors.text, marginTop: spacing.md },
  emptyMessage: { fontSize: typography.fontSize.md, color: colors.textLight, textAlign: 'center', marginTop: spacing.sm },
});

export default PendingOrders;
