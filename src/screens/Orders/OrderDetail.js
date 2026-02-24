import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../contexts/LanguageContext';
import { colors, spacing, typography, borderRadius, shadows } from '../../constants/theme';
import { SERVICE_TYPES, CLEANING_CATEGORIES, ORDER_STATUSES } from '../../utils/orderService';
import SectionCard from '../../components/Common/SectionCard';

const OrderDetail = ({ route }) => {
  const { t } = useLanguage();
  const { order } = route.params;
  const statusInfo = ORDER_STATUSES[order.status] || ORDER_STATUSES.pending;

  const renderList = (items, label) => {
    if (!items || items.length === 0) return null;
    return (
      <View style={styles.listSection}>
        <Text style={styles.listLabel}>{label}</Text>
        {items.map((item, i) => (
          <View key={i} style={styles.listItem}>
            <Ionicons name="checkmark-circle" size={16} color={colors.secondary} />
            <Text style={styles.listItemText}>{item}</Text>
          </View>
        ))}
      </View>
    );
  };

  const renderEquipment = () => {
    if (!order.equipment) return null;
    const equipKeys = {
      cleaningAgents: t('newOrder.cleaningAgents', 'Cleaning agents'),
      cloth: t('newOrder.cloth', 'Cloth'),
      vacuumCleaner: t('newOrder.vacuumCleaner', 'Vacuum cleaner'),
      mop: t('newOrder.mop', 'Mop'),
      specialProducts: t('newOrder.specialProducts', 'Special products'),
    };
    const selected = Object.entries(order.equipment)
      .filter(([, val]) => val)
      .map(([key]) => equipKeys[key] || key);
    if (selected.length === 0) return null;
    return renderList(selected, t('newOrder.equipment', 'Equipment'));
  };

  const renderExtra = () => {
    if (!order.extraTargeted) return null;
    const items = [];
    if (order.extraTargeted.animalHair) items.push(t('newOrder.animalHair', 'Animal hair'));
    if (order.extraTargeted.smoking) items.push(t('newOrder.smoking', 'Smoking'));
    if (items.length === 0) return null;
    return renderList(items, t('newOrder.extraTargeted', 'Extra Targeted'));
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Status header */}
        <View style={styles.statusHeader}>
          <View style={[styles.statusBadgeLg, { backgroundColor: statusInfo.color + '20' }]}>
            <Text style={[styles.statusTextLg, { color: statusInfo.color }]}>
              {statusInfo.label}
            </Text>
          </View>
        </View>

        {/* Service info */}
        <SectionCard title={t('newOrder.serviceType', 'Service Type')}>
          <Text style={styles.valueText}>
            {SERVICE_TYPES[order.serviceType] || order.serviceType}
          </Text>
          {order.cleaningCategory && (
            <>
              <Text style={styles.subLabel}>{t('newOrder.cleaningCategory', 'Category')}</Text>
              <Text style={styles.valueText}>
                {CLEANING_CATEGORIES[order.cleaningCategory] || order.cleaningCategory}
              </Text>
            </>
          )}
        </SectionCard>

        {/* Booking details */}
        <SectionCard title={t('newOrder.bookingDetails', 'Booking Details')}>
          <View style={styles.detailRow}>
            <Ionicons name="location-outline" size={18} color={colors.primary} />
            <Text style={styles.detailValue}>{order.address || '—'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={18} color={colors.primary} />
            <Text style={styles.detailValue}>{order.date || '—'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="time-outline" size={18} color={colors.primary} />
            <Text style={styles.detailValue}>{order.time || '—'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="hourglass-outline" size={18} color={colors.primary} />
            <Text style={styles.detailValue}>
              {order.calculatedHours || order.manualHours || '–'} {t('admin.hours', 'hours')}
            </Text>
          </View>
        </SectionCard>

        {/* Checklist selections */}
        {renderList(order.asNeededSelections, t('newOrder.asNeeded', 'As Needed'))}
        {renderList(order.mainCleaningExtras, t('newOrder.mainCleaningExtras', 'Main Cleaning Extras'))}
        {renderList(order.adhocSelections, t('newOrder.adhocOptions', 'Ad hoc Options'))}
        {renderEquipment()}
        {renderExtra()}

        {/* Comments */}
        {(order.comments || order.adhocFreeText) ? (
          <SectionCard title={t('newOrder.additionalComments', 'Comments')}>
            <Text style={styles.commentText}>
              {order.comments || order.adhocFreeText}
            </Text>
          </SectionCard>
        ) : null}

        {/* Order date */}
        {order.createdAt && (
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>{t('orders.orderDate', 'Order Date')}</Text>
            <Text style={styles.metaValue}>
              {new Date(order.createdAt).toLocaleDateString()}
            </Text>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  content: {
    padding: spacing.md,
  },
  statusHeader: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  statusBadgeLg: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  statusTextLg: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    textTransform: 'uppercase',
  },
  subLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textLight,
    marginTop: spacing.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  valueText: {
    fontSize: typography.fontSize.md,
    color: colors.text,
    marginTop: 2,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  detailValue: {
    fontSize: typography.fontSize.md,
    color: colors.text,
    marginLeft: spacing.sm,
    flex: 1,
  },
  listSection: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.sm,
    borderWidth: 1,
    borderColor: colors.gray[100],
  },
  listLabel: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  listItemText: {
    fontSize: typography.fontSize.sm,
    color: colors.textLight,
    marginLeft: spacing.sm,
    flex: 1,
  },
  commentText: {
    fontSize: typography.fontSize.md,
    color: colors.text,
    lineHeight: 22,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  metaLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textLight,
  },
  metaValue: {
    fontSize: typography.fontSize.sm,
    color: colors.text,
    fontWeight: typography.fontWeight.medium,
  },
});

export default OrderDetail;
