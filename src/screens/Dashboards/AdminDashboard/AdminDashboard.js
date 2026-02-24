import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useAuth } from '../../../contexts/AuthContext';
import { colors, spacing, typography, borderRadius } from '../../../constants/theme';
import DashboardSidebar from '../../../components/Layout/DashboardSidebar';
import Profile from '../../../components/Dashboards/Profile';

const AdminDashboard = () => {
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  const { userData } = useAuth();
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('users');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    {
      label: t('admin.users', 'Users'),
      icon: '👥',
      active: activeTab === 'users',
      onClick: () => setActiveTab('users'),
    },
    {
      label: t('admin.taskManagement', 'Task Management'),
      icon: '📋',
      active: activeTab === 'tasks',
      onClick: () => setActiveTab('tasks'),
    },
    {
      label: t('admin.jobSeekers', 'Job Seekers'),
      icon: '📝',
      active: activeTab === 'jobseekers',
      onClick: () => setActiveTab('jobseekers'),
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

  const dummyClients = [
    { id: 1, name: 'John Smith', email: 'john@example.com', phone: '+45 12 34 56 78', type: 'Private', status: 'Active' },
    { id: 2, name: 'ABC Company', email: 'info@abc.com', phone: '+45 98 76 54 32', type: 'Company', status: 'Active' },
    { id: 3, name: 'Maria Garcia', email: 'maria@example.com', phone: '+45 11 22 33 44', type: 'Private', status: 'Active' },
  ];

  const dummyCleaners = [
    { id: 1, name: 'Cleaner One', email: 'cleaner1@example.com', phone: '+45 55 66 77 88', experience: 5, rating: 4.8 },
    { id: 2, name: 'Cleaner Two', email: 'cleaner2@example.com', phone: '+45 99 88 77 66', experience: 3, rating: 4.5 },
  ];

  const dummyTasks = [
    { id: 1, address: '123 Main St', date: '2026-01-30', client: 'John Smith', status: 'pending', hours: 3 },
    { id: 2, address: '456 Oak Ave', date: '2026-02-01', client: 'ABC Company', status: 'assigned', cleaner: 'Cleaner One', hours: 4 },
    { id: 3, address: '789 Pine Rd', date: '2026-01-28', client: 'Maria Garcia', status: 'completed', cleaner: 'Cleaner Two', hours: 2 },
  ];

  const dummyJobSeekers = [
    { id: 1, name: 'Applicant One', email: 'applicant1@example.com', phone: '+45 11 11 11 11', experience: 2, status: 'pending' },
    { id: 2, name: 'Applicant Two', email: 'applicant2@example.com', phone: '+45 22 22 22 22', experience: 4, status: 'reviewed' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'users':
        return (
          <View style={styles.contentSection}>
            <Text style={styles.sectionTitle}>{t('admin.users', 'Users')}</Text>
            <View style={styles.tabContainer}>
              <Text style={styles.tabLabel}>Clients ({dummyClients.length})</Text>
              {dummyClients.map((user) => (
                <View key={user.id} style={styles.userCard}>
                  <Text style={styles.userName}>{user.name}</Text>
                  <Text style={styles.userEmail}>📧 {user.email}</Text>
                  <Text style={styles.userPhone}>📞 {user.phone}</Text>
                  <Text style={styles.userType}>Type: {user.type}</Text>
                </View>
              ))}
              <Text style={styles.tabLabel}>Cleaners ({dummyCleaners.length})</Text>
              {dummyCleaners.map((user) => (
                <View key={user.id} style={styles.userCard}>
                  <Text style={styles.userName}>{user.name}</Text>
                  <Text style={styles.userEmail}>📧 {user.email}</Text>
                  <Text style={styles.userPhone}>📞 {user.phone}</Text>
                  <Text style={styles.userType}>Experience: {user.experience} years | ⭐ {user.rating}</Text>
                </View>
              ))}
            </View>
          </View>
        );
      case 'tasks':
        return (
          <View style={styles.contentSection}>
            <Text style={styles.sectionTitle}>
              {t('admin.taskManagement', 'Task Management')}
            </Text>
            {dummyTasks.map((task) => (
              <View key={task.id} style={styles.taskCard}>
                <View style={styles.taskHeader}>
                  <Text style={styles.taskId}>Task #{task.id}</Text>
                  <Text style={[styles.taskStatus, task.status === 'completed' && styles.statusCompleted, task.status === 'assigned' && styles.statusApproved]}>
                    {task.status === 'pending' ? '⏳ Pending' : task.status === 'assigned' ? '✅ Assigned' : '✅ Completed'}
                  </Text>
                </View>
                <Text style={styles.taskAddress}>📍 {task.address}</Text>
                <Text style={styles.taskDate}>📅 {task.date}</Text>
                <Text style={styles.taskClient}>👤 Client: {task.client}</Text>
                {task.cleaner && <Text style={styles.taskCleaner}>🧹 Cleaner: {task.cleaner}</Text>}
                <Text style={styles.taskHours}>⏱️ {task.hours} hours</Text>
              </View>
            ))}
          </View>
        );
      case 'jobseekers':
        return (
          <View style={styles.contentSection}>
            <Text style={styles.sectionTitle}>{t('admin.jobSeekers', 'Job Seekers')}</Text>
            {dummyJobSeekers.map((seeker) => (
              <View key={seeker.id} style={styles.userCard}>
                <Text style={styles.userName}>{seeker.name}</Text>
                <Text style={styles.userEmail}>📧 {seeker.email}</Text>
                <Text style={styles.userPhone}>📞 {seeker.phone}</Text>
                <Text style={styles.userType}>Experience: {seeker.experience} years</Text>
                <Text style={styles.seekerStatus}>Status: {seeker.status}</Text>
              </View>
            ))}
          </View>
        );
      case 'archives':
        return (
          <View style={styles.contentSection}>
            <Text style={styles.sectionTitle}>{t('dashboard.archives', 'Archives')}</Text>
            {dummyTasks.filter(t => t.status === 'completed').map((task) => (
              <View key={task.id} style={styles.taskCard}>
                <View style={styles.taskHeader}>
                  <Text style={styles.taskId}>Task #{task.id}</Text>
                  <Text style={[styles.taskStatus, styles.statusCompleted]}>✅ Completed</Text>
                </View>
                <Text style={styles.taskAddress}>📍 {task.address}</Text>
                <Text style={styles.taskDate}>📅 {task.date}</Text>
                <Text style={styles.taskClient}>👤 Client: {task.client}</Text>
                <Text style={styles.taskCleaner}>🧹 Cleaner: {task.cleaner}</Text>
              </View>
            ))}
          </View>
        );
      case 'profile':
        return <Profile userRole="admin" />;
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
            {t('dashboard.adminDashboard', 'Admin Dashboard')}
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
                {t('dashboard.adminDashboard', 'Admin Dashboard')}
              </Text>
            </View>

            {/* Dashboard Content: full height for all tabs (same as Profile) */}
            {activeTab === 'profile' ? (
              <View style={styles.contentWrapper}>
                <Profile userRole="admin" />
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
  tabContainer: {
    marginTop: spacing.md,
  },
  tabLabel: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.textDark,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  userCard: {
    backgroundColor: colors.backgroundLight,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  userName: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.textDark,
    marginBottom: spacing.xs,
  },
  userEmail: {
    fontSize: typography.fontSize.sm,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  userPhone: {
    fontSize: typography.fontSize.sm,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  userType: {
    fontSize: typography.fontSize.sm,
    color: colors.textLight,
    marginTop: spacing.xs,
  },
  seekerStatus: {
    fontSize: typography.fontSize.sm,
    color: colors.warning,
    marginTop: spacing.xs,
    fontWeight: typography.fontWeight.semibold,
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
  taskClient: {
    fontSize: typography.fontSize.sm,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  taskCleaner: {
    fontSize: typography.fontSize.sm,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  taskHours: {
    fontSize: typography.fontSize.sm,
    color: colors.text,
    marginTop: spacing.xs,
  },
});

export default AdminDashboard;
