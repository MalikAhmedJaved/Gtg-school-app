import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useAuth } from '../../../contexts/AuthContext';
import { colors, spacing, typography, borderRadius } from '../../../constants/theme';
import DashboardSidebar from '../../../components/Layout/DashboardSidebar';
import Profile from '../../../components/Dashboards/Profile';
import Button from '../../../components/Common/Button';
import { navigate as rootNavigate } from '../../../utils/rootNavigation';

const ClientDashboard = () => {
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  const { userData } = useAuth();
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('pending');
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  const dummyPendingTasks = [
    { id: 1, address: '123 Main St, Copenhagen', date: '2026-01-30', time: '10:00', hours: 3, status: 'pending' },
    { id: 2, address: '456 Oak Ave, Aarhus', date: '2026-02-01', time: '14:00', hours: 4, status: 'pending' },
  ];

  const dummyApprovedTasks = [
    { id: 3, address: '789 Pine Rd, Odense', date: '2026-01-28', time: '09:00', hours: 2, status: 'approved', cleaner: 'John Doe' },
    { id: 4, address: '321 Elm St, Aalborg', date: '2026-01-29', time: '13:00', hours: 5, status: 'approved', cleaner: 'Jane Smith' },
  ];

  const dummyArchivedTasks = [
    { id: 5, address: '654 Maple Dr, Esbjerg', date: '2026-01-15', hours: 3, status: 'completed', rating: 5 },
    { id: 6, address: '987 Cedar Ln, Roskilde', date: '2026-01-20', hours: 4, status: 'completed', rating: 4 },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'request':
        return (
          <View style={styles.contentSection}>
            <Text style={styles.sectionTitle}>{t('dashboard.newRequest', 'New Request')}</Text>
            <View style={styles.formCard}>
              <Text style={{ textAlign: 'center', color: colors.textSecondary, marginBottom: spacing.md }}>
                {t('dashboard.useNewOrderTab', 'Use the New Order tab to create cleaning requests.')}
              </Text>
              <Button title={t('nav.newOrder', 'New Order')} variant="primary" onPress={() => rootNavigate('NewOrderTab')} />
            </View>
          </View>
        );
      case 'pending':
        return (
          <View style={styles.contentSection}>
            <Text style={styles.sectionTitle}>{t('client.pendingRequests', 'Pending Requests')}</Text>
            {dummyPendingTasks.map((task) => (
              <View key={task.id} style={styles.taskCard}>
                <View style={styles.taskHeader}>
                  <Text style={styles.taskId}>#{task.id}</Text>
                  <Text style={styles.taskStatus}>⏳ Pending</Text>
                </View>
                <Text style={styles.taskAddress}>📍 {task.address}</Text>
                <Text style={styles.taskDate}>📅 {task.date} at {task.time}</Text>
                <Text style={styles.taskHours}>⏱️ {task.hours} hours</Text>
              </View>
            ))}
          </View>
        );
      case 'approved':
        return (
          <View style={styles.contentSection}>
            <Text style={styles.sectionTitle}>{t('client.approvedJobs', 'Approved Jobs')}</Text>
            {dummyApprovedTasks.map((task) => (
              <View key={task.id} style={styles.taskCard}>
                <View style={styles.taskHeader}>
                  <Text style={styles.taskId}>#{task.id}</Text>
                  <Text style={[styles.taskStatus, styles.statusApproved]}>✅ Approved</Text>
                </View>
                <Text style={styles.taskAddress}>📍 {task.address}</Text>
                <Text style={styles.taskDate}>📅 {task.date} at {task.time}</Text>
                <Text style={styles.taskHours}>⏱️ {task.hours} hours</Text>
                <Text style={styles.taskCleaner}>👤 Cleaner: {task.cleaner}</Text>
              </View>
            ))}
          </View>
        );
      case 'archives':
        return (
          <View style={styles.contentSection}>
            <Text style={styles.sectionTitle}>{t('dashboard.archives', 'Archives')}</Text>
            {dummyArchivedTasks.map((task) => (
              <View key={task.id} style={styles.taskCard}>
                <View style={styles.taskHeader}>
                  <Text style={styles.taskId}>#{task.id}</Text>
                  <Text style={[styles.taskStatus, styles.statusCompleted]}>✅ Completed</Text>
                </View>
                <Text style={styles.taskAddress}>📍 {task.address}</Text>
                <Text style={styles.taskDate}>📅 {task.date}</Text>
                <Text style={styles.taskHours}>⏱️ {task.hours} hours</Text>
                <Text style={styles.taskRating}>⭐ Rating: {task.rating}/5</Text>
              </View>
            ))}
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
      <DashboardSidebar
        menuItems={menuItems}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <View style={[styles.mainContent, !sidebarOpen && styles.mainContentFull]}>
        {/* Header with Menu Toggle */}
        <View style={[styles.mobileHeader, { paddingTop: Math.max(insets.top, spacing.md) }]}>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => setSidebarOpen(!sidebarOpen)}
          >
            <Text style={styles.menuIcon}>☰</Text>
          </TouchableOpacity>
          <Text style={styles.mobileTitle}>
            {t('dashboard.clientDashboard', 'Client Dashboard')}
          </Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Dashboard Container */}
        <ScrollView
          style={styles.scrollContent}
          contentContainerStyle={styles.scrollContentContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.dashboardContainer}>
            {/* Desktop Title */}
            <View style={styles.headerWrapper}>
              <Text style={styles.desktopTitle}>
                {t('dashboard.clientDashboard', 'Client Dashboard')}
              </Text>
            </View>

            {/* Dashboard Content: full height for all tabs (same as Profile) */}
            {activeTab === 'profile' ? (
              <View style={styles.contentWrapper}>
                <Profile userRole="client" />
              </View>
            ) : (
              <View style={styles.contentWrapper}>
                <ScrollView style={styles.dashboardContent} contentContainerStyle={styles.dashboardContentContainer} showsVerticalScrollIndicator={true}>
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
  mainContent: {
    flex: 1,
  },
  mainContentFull: {
    marginLeft: 0,
  },
  mobileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  menuButton: {
    padding: spacing.sm,
  },
  menuIcon: {
    fontSize: 24,
    color: colors.primary,
  },
  mobileTitle: {
    flex: 1,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
    textAlign: 'center',
    marginHorizontal: spacing.md,
  },
  headerSpacer: {
    width: 40,
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    flexGrow: 1,
  },
  dashboardContainer: {
    flex: 1,
    width: '100%',
    padding: spacing.md,
  },
  headerWrapper: {
    marginBottom: spacing.lg,
  },
  desktopTitle: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  contentWrapper: {
    flex: 1,
    minHeight: 400,
  },
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
  dashboardContentContainer: {
    paddingBottom: spacing.xl,
  },
  contentSection: {
    padding: spacing.md,
  },
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
  formCard: {
    backgroundColor: colors.backgroundLight,
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textDark,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: typography.fontSize.md,
    backgroundColor: colors.white,
    marginBottom: spacing.sm,
  },
  submitButton: {
    marginTop: spacing.md,
  },
  taskCard: {
    backgroundColor: colors.backgroundLight,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  taskId: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  taskStatus: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.warning,
  },
  statusApproved: {
    color: colors.secondary,
  },
  statusCompleted: {
    color: colors.success,
  },
  taskAddress: {
    fontSize: typography.fontSize.md,
    color: colors.textDark,
    marginBottom: spacing.xs,
  },
  taskDate: {
    fontSize: typography.fontSize.sm,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  taskHours: {
    fontSize: typography.fontSize.sm,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  taskCleaner: {
    fontSize: typography.fontSize.sm,
    color: colors.text,
    marginTop: spacing.xs,
  },
  taskRating: {
    fontSize: typography.fontSize.sm,
    color: colors.text,
    marginTop: spacing.xs,
    fontWeight: typography.fontWeight.semibold,
  },
});

export default ClientDashboard;
