import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../contexts/LanguageContext';
import { colors, spacing, typography, borderRadius } from '../../constants/theme';
import { SERVICE_TYPES, CLEANING_CATEGORIES } from '../../utils/orderService';
import { navigate as rootNavigate } from '../../utils/rootNavigation';
import Button from '../../components/Common/Button';
import { formatDate } from '../../utils/formatters';

const OrderConfirmation = ({ route }) => {
  const { t } = useLanguage();
  const { order } = route.params || {};

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="checkmark-circle" size={80} color={colors.secondary} />
        </View>

        <Text style={styles.title}>
          {t('orders.orderConfirmation', 'Order Confirmed!')}
        </Text>
        <Text style={styles.message}>
          {t(
            'orders.orderConfirmationMsg',
            'Your cleaning order has been submitted successfully. We will review it and confirm shortly.'
          )}
        </Text>

        {order && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>
              {t('orders.orderSummary', 'Order Summary')}
            </Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{t('newOrder.serviceType', 'Service Type')}</Text>
              <Text style={styles.summaryValue}>
                {SERVICE_TYPES[order.serviceType] || order.serviceType}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{t('newOrder.address', 'Address')}</Text>
              <Text style={styles.summaryValue}>{order.address}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{t('newOrder.preferredDate', 'Date')}</Text>
              <Text style={styles.summaryValue}>{formatDate(order.date)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{t('orders.estimatedHours', 'Estimated Hours')}</Text>
              <Text style={styles.summaryValue}>
                {order.calculatedHours || order.manualHours || '–'} h
              </Text>
            </View>
          </View>
        )}

        <View style={styles.buttonContainer}>
          <Button
            title={t('orders.viewOrders', 'View My Orders')}
            onPress={() => rootNavigate('OrdersTab')}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    padding: spacing.xl,
    alignItems: 'center',
    paddingTop: spacing.xxl + 20,
  },
  iconContainer: {
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  message: {
    fontSize: typography.fontSize.md,
    color: colors.textLight,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.xl,
  },
  summaryCard: {
    backgroundColor: colors.gray[50],
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    width: '100%',
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  summaryTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs + 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  summaryLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textLight,
  },
  summaryValue: {
    fontSize: typography.fontSize.sm,
    color: colors.text,
    fontWeight: typography.fontWeight.medium,
    textAlign: 'right',
    flex: 1,
    marginLeft: spacing.md,
  },
  buttonContainer: {
    width: '100%',
  },
});

export default OrderConfirmation;
