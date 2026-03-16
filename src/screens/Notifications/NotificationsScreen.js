import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../utils/api';
import { colors, spacing, typography, borderRadius } from '../../constants/theme';

function formatWhen(dateInput) {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) return '';

  const diffMs = Date.now() - date.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString('en-GB');
}

const NotificationsScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [selectedNotification, setSelectedNotification] = useState(null);

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.isRead).length,
    [notifications]
  );

  const fetchNotifications = useCallback(async (showSpinner = false) => {
    if (showSpinner) setLoading(true);
    try {
      const response = await api.get('/notifications?limit=100');
      if (response.data?.success) {
        setNotifications(Array.isArray(response.data.data) ? response.data.data : []);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      if (showSpinner) setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchNotifications(true);
      const timer = setInterval(() => fetchNotifications(false), 15000);
      return () => clearInterval(timer);
    }, [fetchNotifications])
  );

  useEffect(() => {
    fetchNotifications(true);
  }, [fetchNotifications]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications(false);
    setRefreshing(false);
  };

  const openNotificationTarget = async (item) => {
    if (!item?.id) return;

    try {
      if (!item.isRead) {
        await api.post(`/notifications/${item.id}/read`);
        setNotifications((prev) => prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n)));
      }
    } catch (markErr) {
      console.error('Failed to mark notification read:', markErr);
    }

    if (item.targetType === 'task' && item.targetId) {
      try {
        const taskRes = await api.get(`/tasks/${item.targetId}`);
        if (taskRes.data?.success && taskRes.data?.data) {
          navigation.navigate('OrdersTab', {
            screen: 'OrderDetail',
            params: { order: taskRes.data.data },
          });
          return;
        }
      } catch (taskErr) {
        console.error('Failed to load task for notification:', taskErr);
      }
    }

    if ((item.targetType === 'user' || item.targetType === 'job_seeker') && item.targetId) {
      setSelectedNotification(item);
      return;
    }
  };

  const renderPayloadDetails = (item) => {
    const payload = item?.payload;
    if (!payload || typeof payload !== 'object') return null;

    const rows = [
      ['Name', payload.name],
      ['Email', payload.email],
      ['Phone', payload.phone],
      ['Role', payload.role],
      ['Address', payload.address],
      ['City', payload.city],
      ['Zip Code', payload.zipCode],
      ['Experience', payload.experience],
    ].filter(([, value]) => value !== null && value !== undefined && `${value}`.trim() !== '');

    if (!rows.length) return null;

    return (
      <View style={styles.payloadWrap}>
        {rows.map(([label, value]) => (
          <View key={`${item.id}-${label}`} style={styles.payloadRow}>
            <Text style={styles.payloadLabel}>{label}:</Text>
            <Text style={styles.payloadValue}>{String(value)}</Text>
          </View>
        ))}
      </View>
    );
  };

  const markAllAsRead = async () => {
    if (!unreadCount || markingAll) return;
    setMarkingAll(true);
    try {
      await api.post('/notifications/read-all');
      setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    } finally {
      setMarkingAll(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centeredWrap}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading notifications...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Notifications</Text>
        <TouchableOpacity
          style={[styles.markAllBtn, (!unreadCount || markingAll) && styles.markAllBtnDisabled]}
          disabled={!unreadCount || markingAll}
          onPress={markAllAsRead}
        >
          <Text style={styles.markAllBtnText}>
            {markingAll ? 'Marking...' : 'Mark all read'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.listWrap}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        {notifications.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="notifications-off-outline" size={44} color={colors.gray[400]} />
            <Text style={styles.emptyTitle}>No notifications yet</Text>
            <Text style={styles.emptyText}>New updates will appear here.</Text>
          </View>
        ) : notifications.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[styles.card, !item.isRead && styles.cardUnread]}
            activeOpacity={0.85}
            onPress={() => openNotificationTarget(item)}
          >
            <View style={styles.cardHeaderRow}>
              <Text style={styles.cardTitle}>{item.title || 'Notification'}</Text>
              <View style={styles.cardMetaWrap}>
                {!item.isRead ? <View style={styles.unreadDot} /> : null}
                <Text style={styles.cardTime}>{formatWhen(item.createdAt)}</Text>
              </View>
            </View>
            <Text style={styles.cardMessage}>{item.message}</Text>
            {item.targetType === 'user' || item.targetType === 'job_seeker' ? renderPayloadDetails(item) : null}
            {!item.isRead ? <Text style={styles.tapHint}>Tap to open</Text> : null}
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Modal
        visible={!!selectedNotification}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedNotification(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{selectedNotification?.title || 'Notification details'}</Text>
            <Text style={styles.modalMessage}>{selectedNotification?.message || ''}</Text>
            {renderPayloadDetails(selectedNotification)}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalSecondaryBtn]}
                onPress={() => setSelectedNotification(null)}
              >
                <Text style={styles.modalSecondaryText}>Close</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalPrimaryBtn]}
                onPress={() => {
                  setSelectedNotification(null);
                  navigation.navigate('MenuTab', { screen: 'AdminDashboard' });
                }}
              >
                <Text style={styles.modalPrimaryText}>Open Admin</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f8fc',
  },
  centeredWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  loadingText: {
    fontSize: typography.fontSize.md,
    color: colors.gray[600],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomColor: colors.gray[200],
    borderBottomWidth: 1,
  },
  title: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  markAllBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  markAllBtnDisabled: {
    opacity: 0.45,
  },
  markAllBtnText: {
    color: colors.white,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
  },
  listWrap: {
    flex: 1,
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
    gap: spacing.sm,
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
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  cardUnread: {
    borderColor: '#9ed9ff',
    backgroundColor: '#f7fcff',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
    gap: spacing.sm,
  },
  cardTitle: {
    flex: 1,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  cardMetaWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardTime: {
    fontSize: typography.fontSize.xs,
    color: colors.gray[500],
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e53935',
  },
  cardMessage: {
    color: colors.gray[700],
    fontSize: typography.fontSize.sm,
    lineHeight: 20,
  },
  tapHint: {
    marginTop: spacing.xs,
    color: colors.primary,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
  },
  payloadWrap: {
    marginTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
    paddingTop: spacing.sm,
    gap: 4,
  },
  payloadRow: {
    flexDirection: 'row',
    gap: 6,
  },
  payloadLabel: {
    minWidth: 74,
    color: colors.gray[600],
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
  },
  payloadValue: {
    flex: 1,
    color: colors.gray[700],
    fontSize: typography.fontSize.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
  },
  modalCard: {
    width: '100%',
    maxWidth: 460,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  modalTitle: {
    color: colors.text,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.xs,
  },
  modalMessage: {
    color: colors.gray[700],
    fontSize: typography.fontSize.sm,
    marginBottom: spacing.sm,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  modalBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  modalPrimaryBtn: {
    backgroundColor: colors.primary,
  },
  modalSecondaryBtn: {
    backgroundColor: colors.gray[200],
  },
  modalPrimaryText: {
    color: colors.white,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
  },
  modalSecondaryText: {
    color: colors.gray[700],
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
  },
});

export default NotificationsScreen;
