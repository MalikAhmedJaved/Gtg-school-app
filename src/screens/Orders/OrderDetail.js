import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { colors, spacing, typography, borderRadius, shadows } from '../../constants/theme';
import { SERVICE_TYPES, ORDER_STATUSES, getOrderById, getCleanerReviews, completeOrder, rateOrder } from '../../utils/orderService';
import SectionCard from '../../components/Common/SectionCard';
import Button from '../../components/Common/Button';
import { formatDate, formatTimeRange } from '../../utils/formatters';
import { navigate as rootNavigate } from '../../utils/rootNavigation';
import api from '../../utils/api';

const OrderDetail = ({ route, navigation }) => {
  const { t } = useLanguage();
  const { userRole } = useAuth();
  const { showToast } = useToast();
  const [order, setOrder] = useState(route.params.order);
  const [accepting, setAccepting] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [showCompleteForm, setShowCompleteForm] = useState(false);
  const [checklistCompleted, setChecklistCompleted] = useState([]);
  const [submittingRating, setSubmittingRating] = useState(false);
  const [rating, setRating] = useState(0);
  const [ratingComment, setRatingComment] = useState('');
  const [loadingCleanerMeta, setLoadingCleanerMeta] = useState(false);
  const [cleanerReviews, setCleanerReviews] = useState({ averageRating: null, count: 0, reviews: [] });

  const statusInfo = ORDER_STATUSES[order.status] || ORDER_STATUSES.pending;
  const canEditPending = userRole === 'client' && order.status === 'pending';
  const canCleanerAccept = userRole === 'cleaner' && order.status === 'assigned';
  const canCleanerComplete = userRole === 'cleaner' && order.status === 'accepted';
  const canClientViewCleaner = userRole === 'client' && ['assigned', 'accepted'].includes(order.status) && Boolean(order.cleaner?.id);
  const canClientRate = userRole === 'client' && order.status === 'completed' && Boolean(order.cleaner?.id) && !order.rating && order.canRate;
  const checklistItems = Array.isArray(order.checklist) ? order.checklist : [];

  useEffect(() => {
    let mounted = true;
    const taskId = route?.params?.order?.id || order?.id || order?._id;
    if (!taskId) return () => { mounted = false; };

    const loadOrderMeta = async () => {
      const shouldLoadCleanerReviews = userRole === 'client' && ['assigned', 'accepted'].includes(order.status);
      if (shouldLoadCleanerReviews) {
        setLoadingCleanerMeta(true);
      }

      try {
        const latest = await getOrderById(taskId);
        if (!mounted || !latest) return;

        setOrder((prev) => ({ ...prev, ...latest }));

        const cleanerId = latest?.cleaner?.id;
        if (shouldLoadCleanerReviews && cleanerId) {
          const reviews = await getCleanerReviews(cleanerId);
          if (mounted) {
            setCleanerReviews(reviews);
          }
        }
      } finally {
        if (mounted && shouldLoadCleanerReviews) setLoadingCleanerMeta(false);
      }
    };

    loadOrderMeta();
    return () => { mounted = false; };
  }, [route?.params?.order?.id, order?.id, order?._id, order.status, userRole]);

  useEffect(() => {
    setChecklistCompleted(checklistItems.map(() => false));
  }, [order.id, order._id, checklistItems.length]);

  const getCleanerPhotoUri = () => {
    const photo = order?.cleaner?.photo;
    if (!photo || typeof photo !== 'string') return null;
    if (photo.startsWith('data:image') || photo.startsWith('http://') || photo.startsWith('https://')) return photo;
    if (/^[A-Za-z0-9+/=\n\r]+$/.test(photo) && photo.length > 100) {
      return `data:image/jpeg;base64,${photo.replace(/\s/g, '')}`;
    }
    if (photo.startsWith('/')) {
      const apiBase = String(api.defaults.baseURL || '').replace(/\/api\/?$/, '');
      return `${apiBase}${photo}`;
    }
    if (photo.startsWith('uploads/')) {
      const apiBase = String(api.defaults.baseURL || '').replace(/\/api\/?$/, '');
      return `${apiBase}/${photo}`;
    }
    return null;
  };

  const openCleanerChat = () => {
    if (!order?.cleaner?.id) return;

    rootNavigate('MessagesTab', {
      startWithUser: {
        id: order.cleaner.id,
        name: order.cleaner.name || t('cleaner.cleaner', 'Cleaner'),
        role: 'cleaner',
      },
    });
  };

  const renderStars = (value) => {
    const rating = Math.max(0, Math.min(5, Number(value) || 0));
    const full = Math.round(rating);
    return `${'★'.repeat(full)}${'☆'.repeat(Math.max(0, 5 - full))}`;
  };

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

  const startEdit = async () => {
    const taskId = order.id || order._id;
    let editPayload = order;

    if (taskId) {
      try {
        const latest = await getOrderById(taskId);
        if (latest) {
          editPayload = latest;
          setOrder(latest);
        }
      } catch {
        // Fall back to currently loaded order if refresh fails.
      }
    }

    rootNavigate('NewOrderTab', {
      screen: 'NewOrder',
      params: {
        editMode: true,
        editOrder: editPayload,
      },
    });
  };

  const handleAcceptTask = async () => {
    const taskId = order.id || order._id;
    if (!taskId) return;

    setAccepting(true);
    try {
      const response = await api.post(`/tasks/${taskId}/accept`);
      const updated = response.data?.data;

      if (response.data?.success && updated) {
        setOrder((prev) => ({
          ...prev,
          status: updated.status || 'accepted',
          updatedAt: updated.updatedAt || prev.updatedAt,
        }));
        Alert.alert('Success', t('cleaner.taskAccepted', 'Task accepted successfully'));
        rootNavigate('OrdersTab');
      } else {
        Alert.alert('Error', response.data?.message || 'Failed to accept task');
      }
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to accept task');
    } finally {
      setAccepting(false);
    }
  };

  const toggleChecklistItem = (index) => {
    setChecklistCompleted((prev) => prev.map((value, idx) => (idx === index ? !value : value)));
  };

  const handleCompleteTask = async () => {
    const taskId = order.id || order._id;
    if (!taskId || completing) return;

    setCompleting(true);
    try {
      const updated = await completeOrder(taskId, {
        checklistCompleted,
      });
      setOrder((prev) => ({ ...prev, ...updated }));
      setShowCompleteForm(false);
      showToast(t('cleaner.taskCompleted', 'Task marked as completed!'), 'success');
      Alert.alert('Success', t('cleaner.taskCompleted', 'Task marked as completed!'));
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || error.message || t('cleaner.errorCompleting', 'Error completing task. Please try again.'));
    } finally {
      setCompleting(false);
    }
  };

  const handleSubmitRating = async () => {
    const taskId = order.id || order._id;
    if (!taskId || !rating || submittingRating) return;

    setSubmittingRating(true);
    try {
      const updated = await rateOrder(taskId, {
        rating,
        ratingComment,
      });
      setOrder((prev) => ({ ...prev, ...updated }));
      showToast(t('client.thankYou', 'Thank you for your feedback!'), 'success');
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || error.message || t('client.errorRating', 'Error submitting rating. Please try again.'));
    } finally {
      setSubmittingRating(false);
    }
  };

  const renderRatingSection = () => {
    if (userRole !== 'client' || order.status !== 'completed' || !order.cleaner?.id) return null;

    if (order.rating) {
      return (
        <SectionCard title={t('client.yourRating', 'Your Rating')}>
          <Text style={styles.valueText}>{renderStars(order.rating)} {order.rating} {t('client.outOf5', 'out of 5')}</Text>
          {order.ratingComment ? <Text style={styles.commentText}>{order.ratingComment}</Text> : null}
        </SectionCard>
      );
    }

    if (!canClientRate) {
      return order.ratingBlockedReason ? (
        <SectionCard title={t('client.rateService', 'Rate Your Cleaning Service')}>
          <Text style={styles.helperText}>{order.ratingBlockedReason}</Text>
        </SectionCard>
      ) : null;
    }

    return (
      <SectionCard title={t('client.rateService', 'Rate Your Cleaning Service')}>
        <Text style={styles.helperText}>{t('client.ratePrompt', 'How was your experience? Please rate and leave a comment to help us improve!')}</Text>
        <View style={styles.ratingRow}>
          {[1, 2, 3, 4, 5].map((value) => (
            <TouchableOpacity key={value} onPress={() => setRating(value)} style={styles.starButton}>
              <Ionicons
                name={value <= rating ? 'star' : 'star-outline'}
                size={28}
                color={value <= rating ? '#f59e0b' : colors.gray[400]}
              />
            </TouchableOpacity>
          ))}
        </View>
        <TextInput
          style={styles.commentInput}
          placeholder={t('client.yourComment', 'Your Comment')}
          value={ratingComment}
          onChangeText={setRatingComment}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
        <Button
          title={t('client.submitRating', 'Submit Rating')}
          onPress={handleSubmitRating}
          disabled={!rating || submittingRating}
          loading={submittingRating}
          variant="primary"
        />
      </SectionCard>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.statusHeader}>
          <View style={[styles.statusBadgeLg, { backgroundColor: statusInfo.color + '20' }]}>
            <Text style={[styles.statusTextLg, { color: statusInfo.color }]}>
              {statusInfo.label}
            </Text>
          </View>
        </View>

        {canEditPending ? (
          <View style={styles.actionBar}>
            <Button title="Edit Pending Order" onPress={startEdit} variant="secondary" />
          </View>
        ) : null}

        {canCleanerAccept ? (
          <View style={styles.actionBar}>
            <Button
              title={accepting ? t('common.loading', 'Loading...') : t('cleaner.acceptTask', 'Accept Task')}
              onPress={handleAcceptTask}
              loading={accepting}
              disabled={accepting}
              variant="primary"
            />
          </View>
        ) : null}

        {canCleanerComplete ? (
          <View style={styles.actionBar}>
            {!showCompleteForm ? (
              <Button
                title={t('cleaner.markAsCompleted', 'Mark the Order Complete')}
                onPress={() => setShowCompleteForm(true)}
                variant="success"
              />
            ) : (
              <SectionCard title={t('cleaner.markWhatYouCompleted', 'Mark what you completed')}>
                {checklistItems.length > 0 ? checklistItems.map((item, index) => (
                  <TouchableOpacity
                    key={`${item}-${index}`}
                    style={styles.checkToggleRow}
                    onPress={() => toggleChecklistItem(index)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={checklistCompleted[index] ? 'checkbox' : 'square-outline'}
                      size={22}
                      color={checklistCompleted[index] ? colors.secondary : colors.textLight}
                    />
                    <Text style={styles.checkToggleText}>{item}</Text>
                  </TouchableOpacity>
                )) : (
                  <Text style={styles.helperText}>{t('cleaner.completeTask', 'Complete Task')}</Text>
                )}

                <View style={styles.inlineActions}>
                  <Button
                    title={t('cleaner.completeTask', 'Complete Task')}
                    onPress={handleCompleteTask}
                    loading={completing}
                    disabled={completing}
                    variant="success"
                    style={styles.inlineActionButton}
                  />
                  <Button
                    title={t('common.cancel', 'Cancel')}
                    onPress={() => setShowCompleteForm(false)}
                    variant="secondary"
                    style={styles.inlineActionButton}
                  />
                </View>
              </SectionCard>
            )}
          </View>
        ) : null}

        <SectionCard title={t('newOrder.serviceType', 'Service Type')}>
          <Text style={styles.valueText}>
            {SERVICE_TYPES[order.serviceType] || order.serviceType}
          </Text>
        </SectionCard>

        {(userRole === 'cleaner' || userRole === 'admin') && order.client ? (
          <SectionCard title={t('cleaner.clientInfo', 'Client Information')}>
            <View style={styles.detailRow}>
              <Ionicons name="person-outline" size={18} color={colors.primary} />
              <Text style={styles.detailValue}>{order.client.name || '-'}</Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="business-outline" size={18} color={colors.primary} />
              <Text style={styles.detailValue}>{t('auth.city', 'City')}: {order.client.city || '-'}</Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="mail-outline" size={18} color={colors.primary} />
              <Text style={styles.detailValue}>{t('auth.zipCode', 'Zip Code')}: {order.client.zipCode || '-'}</Text>
            </View>
          </SectionCard>
        ) : null}

        {canClientViewCleaner ? (
          <SectionCard title={t('orders.cleanerInfo', 'Assigned Cleaner')}>
            {loadingCleanerMeta ? (
              <View style={styles.loaderRow}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.loaderText}>{t('common.loading', 'Loading...')}</Text>
              </View>
            ) : null}

            <View style={styles.cleanerHeaderRow}>
              {getCleanerPhotoUri() ? (
                <Image source={{ uri: getCleanerPhotoUri() }} style={styles.cleanerPhoto} />
              ) : (
                <View style={styles.cleanerAvatarFallback}>
                  <Text style={styles.cleanerAvatarFallbackText}>
                    {(order.cleaner?.name || '?').charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
              <View style={styles.cleanerMeta}>
                <Text style={styles.cleanerName}>{order.cleaner?.name || t('cleaner.cleaner', 'Cleaner')}</Text>
                {typeof cleanerReviews?.averageRating === 'number' ? (
                  <Text style={styles.cleanerRatingSummary}>
                    {renderStars(cleanerReviews.averageRating)}  {cleanerReviews.averageRating.toFixed(1)} ({cleanerReviews.count})
                  </Text>
                ) : (
                  <Text style={styles.cleanerNoReviews}>{t('orders.noReviews', 'No reviews yet')}</Text>
                )}
              </View>
            </View>

            <View style={styles.chatButtonWrap}>
              <Button title={t('chat.chatWithCleaner', 'Chat with Cleaner')} onPress={openCleanerChat} variant="primary" />
            </View>

            {Array.isArray(cleanerReviews?.reviews) && cleanerReviews.reviews.length > 0 ? (
              <View style={styles.reviewsSection}>
                <Text style={styles.reviewsTitle}>{t('orders.reviews', 'Reviews')}</Text>
                {cleanerReviews.reviews.slice(0, 3).map((review) => (
                  <View key={String(review.id)} style={styles.reviewCard}>
                    <Text style={styles.reviewStars}>{renderStars(review.rating)}  {Number(review.rating).toFixed(1)}</Text>
                    {review.ratingComment ? (
                      <Text style={styles.reviewComment}>{review.ratingComment}</Text>
                    ) : null}
                    <Text style={styles.reviewMeta}>
                      {(review.client?.name || t('orders.client', 'Client'))} • {formatDate(review.completedAt || review.date)}
                    </Text>
                  </View>
                ))}
              </View>
            ) : null}
          </SectionCard>
        ) : null}

        {order.isRecurring ? (
          <SectionCard title={t('orders.recurringInfo', 'Recurring Information')}>
            <View style={styles.detailRow}>
              <Ionicons name="repeat" size={18} color={colors.primary} />
              <Text style={styles.detailValue}>
                Every {order.recurrenceEvery ?? 1} week(s){order.recurrenceCount ? ` (${order.recurrenceCount} tasks)` : ''}
              </Text>
            </View>
            {Array.isArray(order.recurrenceDays) && order.recurrenceDays.length > 0 ? (
              <View style={styles.detailRow}>
                <Ionicons name="calendar-outline" size={18} color={colors.primary} />
                <Text style={styles.detailValue}>
                  {order.recurrenceDays.map(d => ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d] || d).join(', ')}
                </Text>
              </View>
            ) : null}
            {order.recurrenceUntil ? (
              <View style={styles.detailRow}>
                <Ionicons name="flag-outline" size={18} color={colors.primary} />
                <Text style={styles.detailValue}>Until {order.recurrenceUntil}</Text>
              </View>
            ) : null}
          </SectionCard>
        ) : null}

        {order.title ? (
          <SectionCard title={t('orders.title', 'Title')}>
            <Text style={styles.valueText}>{order.title}</Text>
          </SectionCard>
        ) : null}

        <SectionCard title={t('newOrder.bookingDetails', 'Booking Details')}>
          <>
            <View style={styles.detailRow}>
              <Ionicons name="location-outline" size={18} color={colors.primary} />
              <Text style={styles.detailValue}>{order.address || '—'}</Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="calendar-outline" size={18} color={colors.primary} />
              <Text style={styles.detailValue}>{formatDate(order.date)}</Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="time-outline" size={18} color={colors.primary} />
              <Text style={styles.detailValue}>
                {order.allDay
                  ? t('orders.allDay', 'All Day')
                  : formatTimeRange(order.time, order.endTime)}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="hourglass-outline" size={18} color={colors.primary} />
              <Text style={styles.detailValue}>
                {order.calculatedHours || order.manualHours || '–'} {t('admin.hours', 'hours')}
              </Text>
            </View>
          </>
        </SectionCard>

        {renderList(order.asNeededSelections, t('newOrder.asNeeded', 'As Needed'))}
        {renderList(order.mainCleaningExtras, t('newOrder.mainCleaningExtras', 'Main Cleaning Extras'))}
        {renderList(order.adhocSelections, t('newOrder.adhocOptions', 'Ad hoc Options'))}
        {renderEquipment()}
        {renderExtra()}

        {renderList(order.checklistItems, t('client.whatNeedsToBeDone', 'What needs to be done'))}

        {(order.comments || order.adhocFreeText) ? (
          <SectionCard title={t('newOrder.additionalComments', 'Comments')}>
            <Text style={styles.commentText}>
              {order.comments || order.adhocFreeText}
            </Text>
          </SectionCard>
        ) : null}

        {renderRatingSection()}

        {order.createdAt && (
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>{t('orders.orderDate', 'Order Date')}</Text>
            <Text style={styles.metaValue}>
              {formatDate(order.createdAt)}
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
  actionBar: {
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
  loaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  loaderText: {
    marginLeft: spacing.xs,
    color: colors.textLight,
    fontSize: typography.fontSize.sm,
  },
  cleanerHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  cleanerPhoto: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.gray[200],
    marginRight: spacing.sm,
  },
  cleanerAvatarFallback: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  cleanerAvatarFallbackText: {
    color: colors.white,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },
  cleanerMeta: {
    flex: 1,
  },
  cleanerName: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  cleanerRatingSummary: {
    marginTop: 2,
    fontSize: typography.fontSize.sm,
    color: colors.textLight,
  },
  cleanerNoReviews: {
    marginTop: 2,
    fontSize: typography.fontSize.sm,
    color: colors.textLight,
  },
  chatButtonWrap: {
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  reviewsSection: {
    marginTop: spacing.sm,
  },
  reviewsTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  reviewCard: {
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginBottom: spacing.xs,
    backgroundColor: colors.gray[50],
  },
  reviewStars: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: 2,
  },
  reviewComment: {
    fontSize: typography.fontSize.sm,
    color: colors.text,
    marginBottom: 4,
  },
  reviewMeta: {
    fontSize: typography.fontSize.xs,
    color: colors.textLight,
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
  helperText: {
    fontSize: typography.fontSize.sm,
    color: colors.textLight,
    lineHeight: 20,
  },
  inlineActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  inlineActionButton: {
    flex: 1,
  },
  checkToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  checkToggleText: {
    flex: 1,
    marginLeft: spacing.sm,
    fontSize: typography.fontSize.md,
    color: colors.text,
  },
  ratingRow: {
    flexDirection: 'row',
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  starButton: {
    marginRight: spacing.xs,
  },
  commentInput: {
    minHeight: 110,
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    fontSize: typography.fontSize.md,
    color: colors.text,
    backgroundColor: colors.white,
    marginBottom: spacing.sm,
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
