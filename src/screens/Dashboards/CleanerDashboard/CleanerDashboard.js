import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLanguage } from '../../../contexts/LanguageContext';
import { colors, spacing, typography, borderRadius } from '../../../constants/theme';
import DashboardSidebar from '../../../components/Layout/DashboardSidebar';
import Profile from '../../../components/Dashboards/Profile';
import Button from '../../../components/Common/Button';
import api from '../../../utils/api';
import { sortOrdersBySchedule } from '../../../utils/orderService';
import { formatDate, formatTimeRange } from '../../../utils/formatters';

const groupRecurringTasks = (items) => {
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

  return sortOrdersBySchedule([...grouped, ...singles], 'desc');
};

const CleanerDashboard = () => {
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('tasks');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [availableTasks, setAvailableTasks] = useState([]);
  const [archivedTasks, setArchivedTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const menuItems = [
    {
      label: t('cleaner.availableTasks', 'Available Tasks'),
      icon: '📋',
      active: activeTab === 'tasks',
      onClick: () => setActiveTab('tasks'),
    },
    {
      label: t('cleaner.myArchives', 'My Archives'),
      icon: '📁',
      active: activeTab === 'archives',
      onClick: () => setActiveTab('archives'),
    },
    {
      label: t('dashboard.profile', 'Profile'),
      icon: '👤',
      active: activeTab === 'profile',
      onClick: () => setActiveTab('profile'),
    },
  ];

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const [assignedRes, completedRes] = await Promise.all([
        api.get('/tasks/assigned'),
        api.get('/tasks/completed'),
      ]);

      const assignedData = assignedRes.data?.success ? (assignedRes.data.data || []) : [];
      const onlyAssigned = assignedData.filter((task) => task.status === 'assigned');
      setAvailableTasks(groupRecurringTasks(onlyAssigned));
      setArchivedTasks(completedRes.data?.success ? groupRecurringTasks(completedRes.data.data || []) : []);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Failed to load tasks');
      setAvailableTasks([]);
      setArchivedTasks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab !== 'profile') {
      fetchTasks();
    }
  }, [activeTab, fetchTasks]);

  const handleAcceptTask = async (taskId) => {
    try {
      await api.post(`/tasks/${taskId}/accept`);
      fetchTasks();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to accept task');
    }
  };

  const handleCompleteTask = async (task) => {
    try {
      await api.post(`/tasks/${task.id}/complete`, { actualHours: task.hours || 1 });
      fetchTasks();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to complete task');
    }
  };

  const renderTaskCard = (task, isArchive = false) => (
    <View key={task.id} style={styles.taskCard}>
      <View style={styles.taskHeader}>
        <Text style={styles.taskId}>Task #{task.id}</Text>
        <Text style={[styles.taskStatus, task.status === 'completed' && styles.statusCompleted]}>
          {task.status}
        </Text>
      </View>
      <Text style={styles.taskAddress}>📍 {task.address || '-'}</Text>
      <Text style={styles.taskDate}>📅 {formatDate(task.date)}  •  {formatTimeRange(task.time, task.endTime)}</Text>
      <Text style={styles.taskHours}>⏱️ {task.hours || '-'} hours</Text>
      <Text style={styles.taskClient}>👤 Client: {task.client?.name || '-'}</Text>
      {task.isRecurring ? (
        <View style={styles.recurringBadge}>
          <Text style={styles.recurringText}>
            🔁 Recurring every {task.recurrenceEvery ?? 1} week(s){task.recurrenceCount ? ` (${task.recurrenceCount} tasks)` : ''}
          </Text>
        </View>
      ) : null}
      {task.rating ? <Text style={styles.taskRating}>⭐ Rating: {task.rating}/5</Text> : null}

      {!isArchive ? (
        <View style={styles.buttonRow}>
          {task.status === 'assigned' ? (
            <Button title="Accept Task" onPress={() => handleAcceptTask(task.id)} variant="primary" style={styles.actionButton} />
          ) : null}
          {task.status === 'assigned' || task.status === 'accepted' ? (
            <Button title="Complete Task" onPress={() => handleCompleteTask(task)} variant="secondary" style={styles.actionButton} />
          ) : null}
        </View>
      ) : null}
    </View>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'tasks':
        return (
          <View style={styles.contentSection}>
            <Text style={styles.sectionTitle}>{t('cleaner.availableTasks', 'Available Tasks')}</Text>
            {availableTasks.map((task) => renderTaskCard(task, false))}
            {!loading && availableTasks.length === 0 ? <Text style={styles.emptyText}>No tasks assigned.</Text> : null}
          </View>
        );
      case 'archives':
        return (
          <View style={styles.contentSection}>
            <Text style={styles.sectionTitle}>{t('cleaner.myArchives', 'My Archives')}</Text>
            {archivedTasks.map((task) => renderTaskCard(task, true))}
            {!loading && archivedTasks.length === 0 ? <Text style={styles.emptyText}>No completed tasks.</Text> : null}
          </View>
        );
      case 'profile':
        return <Profile userRole="cleaner" />;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <DashboardSidebar menuItems={menuItems} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <View style={[styles.mainContent, !sidebarOpen && styles.mainContentFull]}>
        <View style={[styles.mobileHeader, { paddingTop: Math.max(insets.top, spacing.md) }]}>
          <TouchableOpacity style={styles.menuButton} onPress={() => setSidebarOpen(!sidebarOpen)}>
            <Text style={styles.menuIcon}>☰</Text>
          </TouchableOpacity>
          <Text style={styles.mobileTitle}>{t('dashboard.cleanerDashboard', 'Cleaner Dashboard')}</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView style={styles.scrollContent} contentContainerStyle={styles.scrollContentContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.dashboardContainer}>
            <View style={styles.headerWrapper}>
              <Text style={styles.desktopTitle}>{t('dashboard.cleanerDashboard', 'Cleaner Dashboard')}</Text>
            </View>

            {activeTab === 'profile' ? (
              <View style={styles.contentWrapper}>
                <Profile userRole="cleaner" />
              </View>
            ) : (
              <View style={styles.contentWrapper}>
                <View style={styles.topActions}>
                  <TouchableOpacity style={styles.refreshBtn} onPress={fetchTasks}>
                    <Text style={styles.refreshText}>Refresh</Text>
                  </TouchableOpacity>
                </View>
                {loading ? <Text style={styles.emptyText}>Loading tasks...</Text> : null}
                {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
                <ScrollView style={styles.dashboardContent} contentContainerStyle={styles.dashboardContentContainer} showsVerticalScrollIndicator>
                  {renderContent()}
                </ScrollView>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
    flexDirection: 'row',
  },
  mainContent: { flex: 1 },
  mainContentFull: { marginLeft: 0 },
  mobileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  menuButton: { padding: spacing.sm },
  menuIcon: { fontSize: 24, color: colors.primary },
  mobileTitle: {
    flex: 1,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
    textAlign: 'center',
    marginHorizontal: spacing.md,
  },
  headerSpacer: { width: 40 },
  scrollContent: { flex: 1 },
  scrollContentContainer: { flexGrow: 1 },
  dashboardContainer: { flex: 1, width: '100%', padding: spacing.md },
  headerWrapper: { marginBottom: spacing.lg },
  desktopTitle: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  contentWrapper: { flex: 1, minHeight: 400 },
  dashboardContent: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  dashboardContentContainer: { paddingBottom: spacing.xl },
  contentSection: { padding: spacing.md },
  sectionTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textDark,
    marginBottom: spacing.md,
  },
  emptyText: {
    fontSize: typography.fontSize.md,
    color: colors.textLight,
    textAlign: 'center',
    padding: spacing.xl,
  },
  errorText: {
    color: colors.error,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  taskCard: {
    backgroundColor: colors.backgroundLight,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  taskHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  taskId: { fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.bold, color: colors.primary },
  taskStatus: { fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.semibold, color: colors.warning },
  statusCompleted: { color: colors.success },
  taskAddress: { fontSize: typography.fontSize.md, color: colors.textDark, marginBottom: spacing.xs },
  taskDate: { fontSize: typography.fontSize.sm, color: colors.text, marginBottom: spacing.xs },
  taskHours: { fontSize: typography.fontSize.sm, color: colors.text, marginBottom: spacing.xs },
  taskClient: { fontSize: typography.fontSize.sm, color: colors.text, marginBottom: spacing.xs },
  taskRating: { fontSize: typography.fontSize.sm, color: colors.text, marginTop: spacing.xs, fontWeight: typography.fontWeight.semibold },
  recurringBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e7f1ff',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    marginTop: spacing.xs,
    alignSelf: 'flex-start',
  },
  recurringText: {
    fontSize: typography.fontSize.sm,
    color: '#0d6efd',
    fontWeight: typography.fontWeight.semibold,
  },
  buttonRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.sm },
  actionButton: { marginTop: spacing.xs },
  topActions: { alignItems: 'flex-end', marginBottom: spacing.md },
  refreshBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primaryLight,
  },
  refreshText: { color: colors.primaryDark, fontWeight: typography.fontWeight.semibold },
});

export default CleanerDashboard;
