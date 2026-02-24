import React, { useState } from 'react';
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
import { useNavigation } from '@react-navigation/native';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useAuth } from '../../../contexts/AuthContext';
import { colors, spacing, typography, borderRadius } from '../../../constants/theme';
import DashboardSidebar from '../../../components/Layout/DashboardSidebar';
import Profile from '../../../components/Dashboards/Profile';
import Button from '../../../components/Common/Button';

const CleanerDashboard = () => {
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  const { userData } = useAuth();
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('tasks');
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  const dummyAvailableTasks = [
    { id: 1, address: '123 Main St, Copenhagen', date: '2026-01-30', time: '10:00', hours: 3, client: 'John Smith' },
    { id: 2, address: '456 Oak Ave, Aarhus', date: '2026-02-01', time: '14:00', hours: 4, client: 'ABC Company' },
  ];

  const dummyArchivedTasks = [
    { id: 3, address: '789 Pine Rd, Odense', date: '2026-01-15', hours: 3, client: 'Maria Garcia', rating: 5, payment: '€90' },
    { id: 4, address: '321 Elm St, Aalborg', date: '2026-01-20', hours: 4, client: 'John Smith', rating: 4, payment: '€120' },
  ];

  const handleAcceptTask = (taskId) => {
    Alert.alert('Success', `Task #${taskId} accepted!`);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'tasks':
        return (
          <View style={styles.contentSection}>
            <Text style={styles.sectionTitle}>
              {t('cleaner.availableTasks', 'Available Tasks')}
            </Text>
            {dummyAvailableTasks.map((task) => (
              <View key={task.id} style={styles.taskCard}>
                <View style={styles.taskHeader}>
                  <Text style={styles.taskId}>Task #{task.id}</Text>
                  <Text style={styles.taskStatus}>📋 Available</Text>
                </View>
                <Text style={styles.taskAddress}>📍 {task.address}</Text>
                <Text style={styles.taskDate}>📅 {task.date} at {task.time}</Text>
                <Text style={styles.taskHours}>⏱️ {task.hours} hours</Text>
                <Text style={styles.taskClient}>👤 Client: {task.client}</Text>
                <Button
                  title="Accept Task"
                  onPress={() => handleAcceptTask(task.id)}
                  variant="primary"
                  style={styles.acceptButton}
                />
              </View>
            ))}
          </View>
        );
      case 'archives':
        return (
          <View style={styles.contentSection}>
            <Text style={styles.sectionTitle}>
              {t('cleaner.myArchives', 'My Archives')}
            </Text>
            {dummyArchivedTasks.map((task) => (
              <View key={task.id} style={styles.taskCard}>
                <View style={styles.taskHeader}>
                  <Text style={styles.taskId}>Task #{task.id}</Text>
                  <Text style={[styles.taskStatus, styles.statusCompleted]}>✅ Completed</Text>
                </View>
                <Text style={styles.taskAddress}>📍 {task.address}</Text>
                <Text style={styles.taskDate}>📅 {task.date}</Text>
                <Text style={styles.taskHours}>⏱️ {task.hours} hours</Text>
                <Text style={styles.taskClient}>👤 Client: {task.client}</Text>
                <Text style={styles.taskRating}>⭐ Rating: {task.rating}/5</Text>
                <Text style={styles.taskPayment}>💰 Payment: {task.payment}</Text>
              </View>
            ))}
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
            {t('dashboard.cleanerDashboard', 'Cleaner Dashboard')}
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
                {t('dashboard.cleanerDashboard', 'Cleaner Dashboard')}
              </Text>
            </View>

            {/* Dashboard Content: full height for all tabs (same as Profile) */}
            {activeTab === 'profile' ? (
              <View style={styles.contentWrapper}>
                <Profile userRole="cleaner" />
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
  taskClient: {
    fontSize: typography.fontSize.sm,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  taskRating: {
    fontSize: typography.fontSize.sm,
    color: colors.text,
    marginTop: spacing.xs,
    fontWeight: typography.fontWeight.semibold,
  },
  taskPayment: {
    fontSize: typography.fontSize.sm,
    color: colors.success,
    marginTop: spacing.xs,
    fontWeight: typography.fontWeight.bold,
  },
  acceptButton: {
    marginTop: spacing.md,
  },
});

export default CleanerDashboard;
