import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLanguage } from '../../../contexts/LanguageContext';
import { colors, spacing, typography, borderRadius } from '../../../constants/theme';
import DashboardSidebar from '../../../components/Layout/DashboardSidebar';
import Profile from '../../../components/Dashboards/Profile';
import Button from '../../../components/Common/Button';
import { navigate as rootNavigate } from '../../../utils/rootNavigation';
import { getOrders } from '../../../utils/orderService';

const ClientDashboard = () => {
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState('pending');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pendingTasks, setPendingTasks] = useState([]);
  const [approvedTasks, setApprovedTasks] = useState([]);
  const [archivedTasks, setArchivedTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const menuItems = [
    {
      label: t('dashboard.newRequest', 'New Request'),
      icon: '➕',
      active: false,
      onClick: () => rootNavigate('NewOrderTab'),
    },
    {
      label: t('dashboard.pending', 'Pending'),
      icon: '⏳',
      active: activeTab === 'pending',
      onClick: () => setActiveTab('pending'),
    },
    {
      label: t('dashboard.approved', 'Approved'),
      icon: '✅',
      active: activeTab === 'approved',
      onClick: () => setActiveTab('approved'),
    },
    {
      label: t('dashboard.archives', 'Archives'),
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

  const fetchTabData = useCallback(async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const [pending, approved, archived] = await Promise.all([
        getOrders({ status: 'pending' }),
        getOrders({ status: ['assigned', 'accepted'] }),
        getOrders({ status: 'completed' }),
      ]);

      setPendingTasks(Array.isArray(pending) ? pending : []);
      setApprovedTasks(Array.isArray(approved) ? approved : []);
      setArchivedTasks(Array.isArray(archived) ? archived : []);
    } catch (error) {
      setErrorMessage(error.message || 'Failed to load tasks');
      setPendingTasks([]);
      setApprovedTasks([]);
      setArchivedTasks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab !== 'profile') {
      fetchTabData();
    }
  }, [activeTab, fetchTabData]);

  const renderTaskCard = (task, statusLabel) => (
    <View key={task.id || task._id} style={styles.taskCard}>
      <View style={styles.taskHeader}>
        <Text style={styles.taskId}>#{task.id || task._id}</Text>
        <Text style={styles.taskStatus}>{statusLabel}</Text>
      </View>
      <Text style={styles.taskAddress}>📍 {task.address || '-'}</Text>
      <Text style={styles.taskDate}>📅 {(task.date || '').slice?.(0, 10) || task.date} {task.time ? `at ${task.time}` : ''}</Text>
      <Text style={styles.taskHours}>⏱️ {task.hours || task.calculatedHours || '-'} hours</Text>
      {task.cleaner?.name ? <Text style={styles.taskCleaner}>🧹 Cleaner: {task.cleaner.name}</Text> : null}
      {task.rating ? <Text style={styles.taskRating}>⭐ Rating: {task.rating}/5</Text> : null}
    </View>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'pending':
        return (
          <View style={styles.contentSection}>
            <Text style={styles.sectionTitle}>{t('client.pendingRequests', 'Pending Requests')}</Text>
            {pendingTasks.map((task) => renderTaskCard(task, '⏳ Pending'))}
            {!loading && pendingTasks.length === 0 ? <Text style={styles.emptyText}>No pending requests.</Text> : null}
          </View>
        );
      case 'approved':
        return (
          <View style={styles.contentSection}>
            <Text style={styles.sectionTitle}>{t('client.approvedJobs', 'Approved Jobs')}</Text>
            {approvedTasks.map((task) => renderTaskCard(task, '✅ Approved'))}
            {!loading && approvedTasks.length === 0 ? <Text style={styles.emptyText}>No approved jobs.</Text> : null}
          </View>
        );
      case 'archives':
        return (
          <View style={styles.contentSection}>
            <Text style={styles.sectionTitle}>{t('dashboard.archives', 'Archives')}</Text>
            {archivedTasks.map((task) => renderTaskCard(task, '✅ Completed'))}
            {!loading && archivedTasks.length === 0 ? <Text style={styles.emptyText}>No archived tasks.</Text> : null}
          </View>
        );
      case 'profile':
        return <Profile userRole="client" />;
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
          <Text style={styles.mobileTitle}>{t('dashboard.clientDashboard', 'Client Dashboard')}</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView style={styles.scrollContent} contentContainerStyle={styles.scrollContentContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.dashboardContainer}>
            <View style={styles.headerWrapper}>
              <Text style={styles.desktopTitle}>{t('dashboard.clientDashboard', 'Client Dashboard')}</Text>
            </View>

            {activeTab === 'profile' ? (
              <View style={styles.contentWrapper}>
                <Profile userRole="client" />
              </View>
            ) : (
              <View style={styles.contentWrapper}>
                <View style={styles.quickActionRow}>
                  <Button title={t('dashboard.newRequest', 'New Request')} onPress={() => rootNavigate('NewOrderTab')} variant="primary" />
                  <TouchableOpacity style={styles.refreshBtn} onPress={fetchTabData}>
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
  taskAddress: { fontSize: typography.fontSize.md, color: colors.textDark, marginBottom: spacing.xs },
  taskDate: { fontSize: typography.fontSize.sm, color: colors.text, marginBottom: spacing.xs },
  taskHours: { fontSize: typography.fontSize.sm, color: colors.text, marginBottom: spacing.xs },
  taskCleaner: { fontSize: typography.fontSize.sm, color: colors.text, marginTop: spacing.xs },
  taskRating: { fontSize: typography.fontSize.sm, color: colors.text, marginTop: spacing.xs, fontWeight: typography.fontWeight.semibold },
  quickActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  refreshBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primaryLight,
  },
  refreshText: { color: colors.primaryDark, fontWeight: typography.fontWeight.semibold },
});

export default ClientDashboard;
