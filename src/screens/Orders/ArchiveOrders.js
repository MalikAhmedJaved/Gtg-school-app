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
import { colors, spacing, typography, borderRadius, shadows } from '../../constants/theme';
import { getOrders, SERVICE_TYPES, CLEANING_CATEGORIES, ORDER_STATUSES } from '../../utils/orderService';

const ArchiveOrders = ({ navigation }) => {
  const { t } = useLanguage();
  const [orders, setOrders] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    try {
      const data = await getOrders({ status: ['completed', 'archived', 'cancelled'] });
      setOrders(data);
    } catch (error) {
      console.error('Error fetching archived orders:', error);
    } finally {
      setLoading(false);
    }
  }, []);

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
    const statusInfo = ORDER_STATUSES[item.status] || ORDER_STATUSES.archived;
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
          <Ionicons name="calendar-outline" size={15} color={colors.textLight} />
          <Text style={styles.detailText}>{item.date || '—'}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="time-outline" size={15} color={colors.textLight} />
          <Text style={styles.detailText}>
            {item.calculatedHours || item.manualHours || '–'} {t('admin.hours', 'hours')}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {orders.length === 0 && !loading ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="archive-outline" size={64} color={colors.gray[300]} />
          <Text style={styles.emptyTitle}>{t('orders.archivedOrders', 'Archived Orders')}</Text>
          <Text style={styles.emptyMessage}>{t('client.noCompletedTasks', 'No completed tasks yet.')}</Text>
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

export default ArchiveOrders;
