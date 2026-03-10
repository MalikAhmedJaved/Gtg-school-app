import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Alert,
  Modal,
  FlatList,
  Dimensions,
  Linking,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLanguage } from '../../../contexts/LanguageContext';
import { colors, spacing, typography, borderRadius } from '../../../constants/theme';
import DashboardSidebar from '../../../components/Layout/DashboardSidebar';
import Profile from '../../../components/Dashboards/Profile';
import api from '../../../utils/api';
import { formatDate, formatTimeRange } from '../../../utils/formatters';

const AdminDashboard = ({ route }) => {
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  const initialTab = route?.params?.initialTab || 'users';

  const [activeTab, setActiveTab] = useState(initialTab);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Sync activeTab when navigating with a different initialTab param
  useEffect(() => {
    if (route?.params?.initialTab) {
      setActiveTab(route.params.initialTab);
    }
  }, [route?.params?.initialTab]);

  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersSearch, setUsersSearch] = useState('');
  const [usersRoleFilter, setUsersRoleFilter] = useState('all');
  const [editingUserId, setEditingUserId] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [savingUserId, setSavingUserId] = useState(null);

  const [pendingTasks, setPendingTasks] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [cleaners, setCleaners] = useState([]);
  const [cleanersLoading, setCleanersLoading] = useState(false);
  const [selectedCleanerByTask, setSelectedCleanerByTask] = useState({});
  const [assigningTaskId, setAssigningTaskId] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showCleanerDropdown, setShowCleanerDropdown] = useState(false);
  const [modalSelectedCleaner, setModalSelectedCleaner] = useState(null);

  const [jobSeekers, setJobSeekers] = useState([]);
  const [jobSeekersLoading, setJobSeekersLoading] = useState(false);
  const [selectedJobSeeker, setSelectedJobSeeker] = useState(null);
  const [showJobSeekerModal, setShowJobSeekerModal] = useState(false);
  const [jobSeekerDetailLoading, setJobSeekerDetailLoading] = useState(false);
  const [downloadingFile, setDownloadingFile] = useState(null);

  const [errorMessage, setErrorMessage] = useState('');

  const menuItems = [
    { label: t('admin.users', 'Users'), icon: '👥', active: activeTab === 'users', onClick: () => setActiveTab('users') },
    { label: t('admin.taskManagement', 'Task Management'), icon: '📋', active: activeTab === 'tasks', onClick: () => setActiveTab('tasks') },
    { label: t('admin.jobSeekers', 'Job Seekers'), icon: '📝', active: activeTab === 'jobseekers', onClick: () => setActiveTab('jobseekers') },
    { label: t('dashboard.archives', 'Archives'), icon: '📁', active: activeTab === 'archives', onClick: () => setActiveTab('archives') },
    { label: t('dashboard.profile', 'Profile'), icon: '👤', active: activeTab === 'profile', onClick: () => setActiveTab('profile') },
  ];

  const cleanerUsers = useMemo(() => cleaners.filter((u) => u.role === 'cleaner'), [cleaners]);

  const fetchUsers = useCallback(async () => {
    setUsersLoading(true);
    setErrorMessage('');
    try {
      const params = {};
      if (usersSearch.trim()) params.search = usersSearch.trim();
      if (usersRoleFilter !== 'all') params.role = usersRoleFilter;
      const response = await api.get('/users', { params });
      setUsers(response.data?.success ? (response.data.data || []) : []);
    } catch (error) {
      setUsers([]);
      setErrorMessage(error.response?.data?.message || 'Failed to load users');
    } finally {
      setUsersLoading(false);
    }
  }, [usersSearch, usersRoleFilter]);

  const fetchCleaners = useCallback(async () => {
    setCleanersLoading(true);
    try {
      const response = await api.get('/users', { params: { role: 'cleaner' } });
      setCleaners(response.data?.success ? (response.data.data || []) : []);
    } catch {
      setCleaners([]);
    } finally {
      setCleanersLoading(false);
    }
  }, []);

  const fetchTaskTabData = useCallback(async () => {
    setTasksLoading(true);
    setErrorMessage('');
    try {
      const [allRes, pendingRes] = await Promise.all([
        api.get('/tasks'),
        api.get('/tasks/pending'),
      ]);
      setAllTasks(allRes.data?.success ? (allRes.data.data || []) : []);
      setPendingTasks(pendingRes.data?.success ? (pendingRes.data.data || []) : []);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Failed to load tasks');
      setAllTasks([]);
      setPendingTasks([]);
    } finally {
      setTasksLoading(false);
    }
  }, []);

  const fetchCompletedTasks = useCallback(async () => {
    setTasksLoading(true);
    setErrorMessage('');
    try {
      const response = await api.get('/tasks/completed');
      setCompletedTasks(response.data?.success ? (response.data.data || []) : []);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Failed to load archives');
      setCompletedTasks([]);
    } finally {
      setTasksLoading(false);
    }
  }, []);

  const fetchJobSeekers = useCallback(async () => {
    setJobSeekersLoading(true);
    setErrorMessage('');
    try {
      const response = await api.get('/jobseekers');
      setJobSeekers(response.data?.success ? (response.data.data || []) : []);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Failed to load job seekers');
      setJobSeekers([]);
    } finally {
      setJobSeekersLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'tasks') {
      fetchTaskTabData();
      fetchCleaners();
    }
    if (activeTab === 'jobseekers') fetchJobSeekers();
    if (activeTab === 'archives') fetchCompletedTasks();
  }, [activeTab, fetchUsers, fetchTaskTabData, fetchJobSeekers, fetchCompletedTasks, fetchCleaners]);

  const openTaskDetail = (task) => {
    setSelectedTask(task);
    setModalSelectedCleaner(task.cleanerId ? cleanerUsers.find(c => String(c.id) === String(task.cleanerId)) || null : null);
    setShowCleanerDropdown(false);
    setShowTaskModal(true);
  };

  const closeTaskDetail = () => {
    setShowTaskModal(false);
    setSelectedTask(null);
    setModalSelectedCleaner(null);
    setShowCleanerDropdown(false);
  };

  const assignTask = async (taskId, cleanerId) => {
    if (!cleanerId) {
      Alert.alert('Error', 'Please select a cleaner first');
      return;
    }

    try {
      setAssigningTaskId(taskId);
      await api.post(`/tasks/${taskId}/assign`, { cleanerId });
      Alert.alert('Success', 'Task assigned successfully');
      closeTaskDetail();
      fetchTaskTabData();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to assign cleaner');
    } finally {
      setAssigningTaskId(null);
    }
  };

  const approveJobSeeker = async (id) => {
    try {
      await api.post(`/jobseekers/${id}/approve`);
      fetchJobSeekers();
      fetchUsers();
      fetchCleaners();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to approve application');
    }
  };

  const rejectJobSeeker = async (id) => {
    try {
      await api.post(`/jobseekers/${id}/reject`);
      fetchJobSeekers();
      if (selectedJobSeeker && selectedJobSeeker.id === id) {
        setSelectedJobSeeker({ ...selectedJobSeeker, status: 'rejected' });
      }
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to reject application');
    }
  };

  const viewJobSeekerDetails = async (seeker) => {
    setShowJobSeekerModal(true);
    setJobSeekerDetailLoading(true);
    try {
      const response = await api.get(`/jobseekers/${seeker.id}`);
      const data = response.data?.success ? response.data.data : response.data;
      setSelectedJobSeeker(data || seeker);
    } catch {
      setSelectedJobSeeker(seeker);
    } finally {
      setJobSeekerDetailLoading(false);
    }
  };

  const closeJobSeekerModal = () => {
    setShowJobSeekerModal(false);
    setSelectedJobSeeker(null);
    setDownloadingFile(null);
  };

  const downloadCV = async (seekerId) => {
    setDownloadingFile('cv');
    try {
      const response = await api.get(`/jobseekers/${seekerId}/download/cv`, {
        maxRedirects: 0,
        validateStatus: (status) => status < 400,
      });
      // If we get a redirect URL in response
      const url = response.request?.responseURL || response.headers?.location;
      if (url) {
        await Linking.openURL(url);
      } else {
        // Construct download URL manually
        const baseURL = api.defaults.baseURL;
        const token = response.config?.headers?.Authorization;
        const downloadUrl = `${baseURL}/jobseekers/${seekerId}/download/cv`;
        await Linking.openURL(downloadUrl);
      }
    } catch (error) {
      // Try opening URL directly as fallback
      try {
        const baseURL = api.defaults.baseURL;
        await Linking.openURL(`${baseURL}/jobseekers/${seekerId}/download/cv`);
      } catch {
        Alert.alert('Error', 'Failed to download CV. The file may not be available.');
      }
    } finally {
      setDownloadingFile(null);
    }
  };

  const downloadDocument = async (seekerId, docIndex) => {
    setDownloadingFile(`doc-${docIndex}`);
    try {
      const response = await api.get(`/jobseekers/${seekerId}/download/document/${docIndex}`, {
        maxRedirects: 0,
        validateStatus: (status) => status < 400,
      });
      const url = response.request?.responseURL || response.headers?.location;
      if (url) {
        await Linking.openURL(url);
      } else {
        const baseURL = api.defaults.baseURL;
        await Linking.openURL(`${baseURL}/jobseekers/${seekerId}/download/document/${docIndex}`);
      }
    } catch (error) {
      try {
        const baseURL = api.defaults.baseURL;
        await Linking.openURL(`${baseURL}/jobseekers/${seekerId}/download/document/${docIndex}`);
      } catch {
        Alert.alert('Error', 'Failed to download document.');
      }
    } finally {
      setDownloadingFile(null);
    }
  };

  const startEditUser = (user) => {
    setEditingUserId(user.id);
    setEditForm({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      address: user.address || '',
      clientType: user.clientType || '',
      companyName: user.companyName || '',
      vatNumber: user.vatNumber || '',
      experience: user.experience?.toString?.() || '0',
      hourlyPrice: user.hourlyPrice?.toString?.() || '',
      currency: user.currency || 'KR',
      adminNotes: user.adminNotes || '',
      isActive: user.isActive !== false,
    });
  };

  const cancelEditUser = () => {
    setEditingUserId(null);
    setEditForm(null);
  };

  const updateEditForm = (field, value) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const saveUser = async (user) => {
    if (!editForm) return;

    const payload = {
      name: editForm.name.trim(),
      email: editForm.email.trim(),
      phone: editForm.phone.trim(),
      address: editForm.address.trim(),
      adminNotes: editForm.adminNotes,
      isActive: !!editForm.isActive,
    };

    if (user.role === 'client') {
      payload.clientType = editForm.clientType || 'individual';
      payload.companyName = editForm.companyName;
      payload.vatNumber = editForm.vatNumber;
      payload.hourlyPrice = editForm.hourlyPrice === '' ? null : parseFloat(editForm.hourlyPrice);
      payload.currency = editForm.currency || 'KR';
    }

    if (user.role === 'cleaner') {
      payload.experience = parseInt(editForm.experience, 10) || 0;
      payload.hourlyPrice = editForm.hourlyPrice === '' ? null : parseFloat(editForm.hourlyPrice);
      payload.currency = editForm.currency || 'KR';
    }

    try {
      setSavingUserId(user.id);
      await api.put(`/users/${user.id}`, payload);
      Alert.alert('Success', 'User updated successfully');
      cancelEditUser();
      fetchUsers();
      fetchCleaners();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to update user');
    } finally {
      setSavingUserId(null);
    }
  };

  const renderUserEditForm = (user) => (
    <>
      <TextInput style={styles.input} value={editForm?.name || ''} onChangeText={(v) => updateEditForm('name', v)} placeholder="Name" />
      <TextInput style={styles.input} value={editForm?.email || ''} onChangeText={(v) => updateEditForm('email', v)} placeholder="Email" autoCapitalize="none" />
      <TextInput style={styles.input} value={editForm?.phone || ''} onChangeText={(v) => updateEditForm('phone', v)} placeholder="Phone" />
      <TextInput style={styles.input} value={editForm?.address || ''} onChangeText={(v) => updateEditForm('address', v)} placeholder="Address" />

      {user.role === 'client' ? (
        <>
          <TextInput style={styles.input} value={editForm?.clientType || ''} onChangeText={(v) => updateEditForm('clientType', v)} placeholder="Client Type (individual/business)" />
          <TextInput style={styles.input} value={editForm?.companyName || ''} onChangeText={(v) => updateEditForm('companyName', v)} placeholder="Company Name" />
          <TextInput style={styles.input} value={editForm?.vatNumber || ''} onChangeText={(v) => updateEditForm('vatNumber', v)} placeholder="VAT Number" />
        </>
      ) : null}

      {user.role === 'cleaner' ? (
        <TextInput style={styles.input} value={editForm?.experience || ''} onChangeText={(v) => updateEditForm('experience', v)} placeholder="Experience (years)" keyboardType="numeric" />
      ) : null}

      {(user.role === 'client' || user.role === 'cleaner') ? (
        <>
          <TextInput style={styles.input} value={editForm?.hourlyPrice || ''} onChangeText={(v) => updateEditForm('hourlyPrice', v)} placeholder="Hourly Price" keyboardType="numeric" />
          <TextInput style={styles.input} value={editForm?.currency || ''} onChangeText={(v) => updateEditForm('currency', v)} placeholder="Currency" autoCapitalize="characters" />
        </>
      ) : null}

      <TextInput style={styles.input} value={editForm?.adminNotes || ''} onChangeText={(v) => updateEditForm('adminNotes', v)} placeholder="Admin Notes" />

      <TouchableOpacity style={styles.toggleBtn} onPress={() => updateEditForm('isActive', !editForm?.isActive)}>
        <Text style={styles.toggleBtnText}>Status: {editForm?.isActive ? 'Active' : 'Inactive'}</Text>
      </TouchableOpacity>

      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.approveBtn} onPress={() => saveUser(user)} disabled={savingUserId === user.id}>
          <Text style={styles.actionText}>{savingUserId === user.id ? 'Saving...' : 'Save'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.rejectBtn} onPress={cancelEditUser}>
          <Text style={styles.actionText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  const renderUsersTab = () => {
    const clients = users.filter((u) => u.role === 'client');
    const cleanersList = users.filter((u) => u.role === 'cleaner');
    const admins = users.filter((u) => u.role === 'admin');

    return (
      <View style={styles.contentSection}>
        <Text style={styles.sectionTitle}>{t('admin.users', 'Users')}</Text>

        <View style={styles.row}>
          <TextInput
            style={[styles.input, styles.searchInput]}
            value={usersSearch}
            onChangeText={setUsersSearch}
            placeholder="Search name/email/phone"
          />
          <TouchableOpacity style={styles.filterChip} onPress={() => setUsersRoleFilter('all')}>
            <Text style={[styles.filterText, usersRoleFilter === 'all' && styles.filterTextActive]}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterChip} onPress={() => setUsersRoleFilter('client')}>
            <Text style={[styles.filterText, usersRoleFilter === 'client' && styles.filterTextActive]}>Clients</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterChip} onPress={() => setUsersRoleFilter('cleaner')}>
            <Text style={[styles.filterText, usersRoleFilter === 'cleaner' && styles.filterTextActive]}>Cleaners</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.refreshBtn} onPress={fetchUsers}>
          <Text style={styles.refreshText}>Refresh Users</Text>
        </TouchableOpacity>

        {usersLoading ? <Text style={styles.emptyText}>Loading users...</Text> : null}
        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

        <Text style={styles.tabLabel}>Clients ({clients.length})</Text>
        {clients.map((u) => {
          const isEditing = editingUserId === u.id;
          return (
            <View key={`c-${u.id}`} style={styles.userCard}>
              {isEditing ? renderUserEditForm(u) : (
                <>
                  <Text style={styles.userName}>{u.name}</Text>
                  <Text style={styles.userEmail}>📧 {u.email}</Text>
                  <Text style={styles.userPhone}>📞 {u.phone || '-'}</Text>
                  <Text style={styles.userType}>Type: {u.clientType || '-'}</Text>
                  <Text style={styles.userType}>Status: {u.isActive === false ? 'Inactive' : 'Active'}</Text>
                  <TouchableOpacity style={styles.editBtn} onPress={() => startEditUser(u)}>
                    <Text style={styles.editBtnText}>Edit Client</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          );
        })}

        <Text style={styles.tabLabel}>Cleaners ({cleanersList.length})</Text>
        {cleanersList.map((u) => {
          const isEditing = editingUserId === u.id;
          return (
            <View key={`cl-${u.id}`} style={styles.userCard}>
              {isEditing ? renderUserEditForm(u) : (
                <>
                  <Text style={styles.userName}>{u.name}</Text>
                  <Text style={styles.userEmail}>📧 {u.email}</Text>
                  <Text style={styles.userPhone}>📞 {u.phone || '-'}</Text>
                  <Text style={styles.userType}>Experience: {u.experience || 0} years</Text>
                  <Text style={styles.userType}>Status: {u.isActive === false ? 'Inactive' : 'Active'}</Text>
                  <TouchableOpacity style={styles.editBtn} onPress={() => startEditUser(u)}>
                    <Text style={styles.editBtnText}>Edit Cleaner</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          );
        })}

        <Text style={styles.tabLabel}>Admins ({admins.length})</Text>
        {admins.map((u) => (
          <View key={`a-${u.id}`} style={styles.userCard}>
            <Text style={styles.userName}>{u.name}</Text>
            <Text style={styles.userEmail}>📧 {u.email}</Text>
            <Text style={styles.userPhone}>📞 {u.phone || '-'}</Text>
          </View>
        ))}
      </View>
    );
  };

  const formatTaskDate = (dateStr) => formatDate(dateStr);

  const cleaningTypeLabels = { residential: 'Residential', commercial: 'Commercial', deep: 'Deep Cleaning', move: 'Move In/Out' };
  const frequencyLabels = { once: 'One-time', weekly: 'Weekly', biweekly: 'Bi-weekly', monthly: 'Monthly' };
  const statusColors = { pending: '#F59E0B', assigned: '#3B82F6', accepted: '#8B5CF6', completed: '#10B981', cancelled: '#EF4444' };

  const renderTaskDetailModal = () => {
    if (!selectedTask) return null;
    const task = selectedTask;
    const isPending = task.status === 'pending';
    const isAssigned = task.status === 'assigned';

    return (
      <Modal visible={showTaskModal} animationType="slide" transparent onRequestClose={closeTaskDetail}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Task #{task.id}</Text>
                <View style={[styles.statusBadge, { backgroundColor: (statusColors[task.status] || colors.gray[400]) + '20' }]}>
                  <View style={[styles.statusDot, { backgroundColor: statusColors[task.status] || colors.gray[400] }]} />
                  <Text style={[styles.statusBadgeText, { color: statusColors[task.status] || colors.gray[400] }]}>
                    {task.status?.charAt(0).toUpperCase() + task.status?.slice(1)}
                  </Text>
                </View>
              </View>
              <TouchableOpacity style={styles.modalCloseBtn} onPress={closeTaskDetail}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {/* Task Details */}
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Task Details</Text>

                {task.title ? (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Title</Text>
                    <Text style={styles.detailValue}>{task.title}</Text>
                  </View>
                ) : null}

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>📍 Address</Text>
                  <Text style={styles.detailValue}>{task.address || '-'}</Text>
                </View>

                <View style={styles.detailRowInline}>
                  <View style={styles.detailHalf}>
                    <Text style={styles.detailLabel}>📅 Date</Text>
                    <Text style={styles.detailValue}>{formatTaskDate(task.date)}</Text>
                  </View>
                  <View style={styles.detailHalf}>
                    <Text style={styles.detailLabel}>🕐 Time</Text>
                    <Text style={styles.detailValue}>{formatTimeRange(task.time, task.endTime)}</Text>
                  </View>
                </View>

                <View style={styles.detailRowInline}>
                  <View style={styles.detailHalf}>
                    <Text style={styles.detailLabel}>⏱ Hours</Text>
                    <Text style={styles.detailValue}>{task.hours || '-'}</Text>
                  </View>
                  <View style={styles.detailHalf}>
                    <Text style={styles.detailLabel}>🧹 Type</Text>
                    <Text style={styles.detailValue}>{cleaningTypeLabels[task.cleaningType] || task.cleaningType || '-'}</Text>
                  </View>
                </View>

                <View style={styles.detailRowInline}>
                  <View style={styles.detailHalf}>
                    <Text style={styles.detailLabel}>🔄 Frequency</Text>
                    <Text style={styles.detailValue}>{frequencyLabels[task.frequency] || task.frequency || '-'}</Text>
                  </View>
                  <View style={styles.detailHalf}>
                    <Text style={styles.detailLabel}>📋 All Day</Text>
                    <Text style={styles.detailValue}>{task.allDay ? 'Yes' : 'No'}</Text>
                  </View>
                </View>

                {task.isRecurring ? (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>🔄 Recurring</Text>
                    <Text style={styles.detailValue}>
                      Every {task.recurrenceEvery ?? 1} week(s){task.recurrenceCount ? ` • ${task.recurrenceCount} tasks total` : ''}
                    </Text>
                    {(() => {
                      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                      const days = Array.isArray(task.recurrenceDays)
                        ? task.recurrenceDays
                        : (typeof task.recurrenceDays === 'string' ? (() => { try { return JSON.parse(task.recurrenceDays); } catch { return []; } })() : []);
                      if (days.length > 0) {
                        return <Text style={styles.detailValue}>Days: {days.map(d => dayNames[d] || d).join(', ')}</Text>;
                      }
                      return null;
                    })()}
                    {task.recurrenceUntil ? (
                      <Text style={styles.detailValue}>Until: {formatTaskDate(task.recurrenceUntil)}</Text>
                    ) : null}
                  </View>
                ) : null}

                {task.comments ? (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>💬 Comments</Text>
                    <Text style={styles.detailValue}>{task.comments}</Text>
                  </View>
                ) : null}
              </View>

              {/* Client Info */}
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Client Information</Text>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>👤 Name</Text>
                  <Text style={styles.detailValue}>{task.client?.name || '-'}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>📧 Email</Text>
                  <Text style={styles.detailValue}>{task.client?.email || '-'}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>📞 Phone</Text>
                  <Text style={styles.detailValue}>{task.client?.phone || '-'}</Text>
                </View>
              </View>

              {/* Checklist */}
              {task.checklist && (() => {
                try {
                  const items = typeof task.checklist === 'string' ? JSON.parse(task.checklist) : task.checklist;
                  if (Array.isArray(items) && items.length > 0) {
                    const completed = task.checklistCompleted ? (typeof task.checklistCompleted === 'string' ? JSON.parse(task.checklistCompleted) : task.checklistCompleted) : [];
                    return (
                      <View style={styles.detailSection}>
                        <Text style={styles.detailSectionTitle}>Checklist</Text>
                        {items.map((item, idx) => (
                          <View key={idx} style={styles.checklistItem}>
                            <Text style={styles.checklistIcon}>{completed[idx] ? '☑' : '☐'}</Text>
                            <Text style={styles.checklistText}>{item}</Text>
                          </View>
                        ))}
                      </View>
                    );
                  }
                } catch { /* ignore parse errors */ }
                return null;
              })()}

              {/* Current Cleaner (if assigned) */}
              {task.cleaner ? (
                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>Assigned Cleaner</Text>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>🧹 Name</Text>
                    <Text style={styles.detailValue}>{task.cleaner.name}</Text>
                  </View>
                  {task.cleaner.email ? (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>📧 Email</Text>
                      <Text style={styles.detailValue}>{task.cleaner.email}</Text>
                    </View>
                  ) : null}
                  {task.cleaner.phone ? (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>📞 Phone</Text>
                      <Text style={styles.detailValue}>{task.cleaner.phone}</Text>
                    </View>
                  ) : null}
                </View>
              ) : null}

              {/* Assign / Reassign Cleaner */}
              {(isPending || isAssigned) ? (
                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>
                    {isPending ? 'Assign Cleaner' : 'Reassign Cleaner'}
                  </Text>

                  {/* Dropdown Trigger */}
                  <TouchableOpacity
                    style={styles.dropdownTrigger}
                    onPress={() => setShowCleanerDropdown(!showCleanerDropdown)}
                  >
                    <Text style={modalSelectedCleaner ? styles.dropdownTriggerText : styles.dropdownPlaceholder}>
                      {modalSelectedCleaner ? modalSelectedCleaner.name : 'Select a cleaner...'}
                    </Text>
                    <Text style={styles.dropdownArrow}>{showCleanerDropdown ? '▲' : '▼'}</Text>
                  </TouchableOpacity>

                  {/* Dropdown List */}
                  {showCleanerDropdown ? (
                    <View style={styles.dropdownList}>
                      {cleanerUsers.length === 0 ? (
                        <Text style={styles.dropdownEmpty}>No cleaners available</Text>
                      ) : (
                        <FlatList
                          data={cleanerUsers}
                          keyExtractor={(item) => String(item.id)}
                          nestedScrollEnabled
                          style={styles.dropdownScroll}
                          showsVerticalScrollIndicator
                          keyboardShouldPersistTaps="handled"
                          renderItem={({ item: cleaner }) => {
                            const isSelected = modalSelectedCleaner && String(modalSelectedCleaner.id) === String(cleaner.id);
                            return (
                              <TouchableOpacity
                                style={[styles.dropdownItem, isSelected && styles.dropdownItemSelected]}
                                onPress={() => {
                                  setModalSelectedCleaner(cleaner);
                                  setShowCleanerDropdown(false);
                                }}
                              >
                                <View style={{ flex: 1 }}>
                                  <Text style={[styles.dropdownItemText, isSelected && styles.dropdownItemTextSelected]}>
                                    {cleaner.name}
                                  </Text>
                                  <Text style={styles.dropdownItemSub}>
                                    {cleaner.email} • {cleaner.experience || 0} yrs exp
                                  </Text>
                                </View>
                                {isSelected ? <Text style={styles.dropdownCheck}>✓</Text> : null}
                              </TouchableOpacity>
                            );
                          }}
                        />
                      )}
                      <Text style={styles.dropdownCount}>{cleanerUsers.length} cleaner{cleanerUsers.length !== 1 ? 's' : ''} available</Text>
                    </View>
                  ) : null}

                  <TouchableOpacity
                    style={[styles.modalAssignBtn, (!modalSelectedCleaner || assigningTaskId === task.id) && styles.modalAssignBtnDisabled]}
                    onPress={() => modalSelectedCleaner && assignTask(task.id, modalSelectedCleaner.id)}
                    disabled={!modalSelectedCleaner || assigningTaskId === task.id}
                  >
                    <Text style={styles.modalAssignBtnText}>
                      {assigningTaskId === task.id ? 'Assigning...' : (isPending ? '✓ Assign Task' : '✓ Reassign Task')}
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : null}

              {/* Rating (for completed) */}
              {task.status === 'completed' && task.rating ? (
                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>Rating</Text>
                  <Text style={styles.detailValue}>{'⭐'.repeat(task.rating)} ({task.rating}/5)</Text>
                  {task.ratingComment ? <Text style={styles.detailValue}>{task.ratingComment}</Text> : null}
                </View>
              ) : null}

              <View style={{ height: spacing.xl }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  const renderTasksTab = () => (
    <View style={styles.contentSection}>
      <Text style={styles.sectionTitle}>{t('admin.taskManagement', 'Task Management')}</Text>

      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.refreshBtn} onPress={fetchTaskTabData}>
          <Text style={styles.refreshText}>Refresh Tasks</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.refreshBtn} onPress={fetchCleaners}>
          <Text style={styles.refreshText}>Refresh Cleaners</Text>
        </TouchableOpacity>
      </View>

      {tasksLoading ? <Text style={styles.emptyText}>Loading tasks...</Text> : null}
      {cleanersLoading ? <Text style={styles.smallText}>Loading cleaners...</Text> : null}
      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

      <Text style={styles.tabLabel}>Pending ({pendingTasks.length})</Text>
      {pendingTasks.length === 0 && !tasksLoading ? (
        <Text style={styles.emptyText}>No pending tasks</Text>
      ) : null}
      {pendingTasks.map((task) => (
        <TouchableOpacity key={`p-${task.id}`} style={styles.taskCard} onPress={() => openTaskDetail(task)} activeOpacity={0.7}>
          <View style={styles.taskHeader}>
            <Text style={styles.taskId}>Task #{task.id}</Text>
            <View style={[styles.taskStatusBadge, { backgroundColor: '#FEF3C7' }]}>
              <Text style={[styles.taskStatusBadgeText, { color: '#D97706' }]}>⏳ Pending</Text>
            </View>
          </View>
          <Text style={styles.taskAddress}>📍 {task.address}</Text>
          {task.isRecurring ? (
            <View style={styles.recurringBadge}>
              <Text style={styles.recurringBadgeText}>
                🔄 Recurring every {task.recurrenceEvery ?? 1} week(s){task.recurrenceCount ? ` (${task.recurrenceCount} tasks)` : ''}
              </Text>
            </View>
          ) : null}
          <View style={styles.taskMetaRow}>
            <Text style={styles.taskDate}>📅 {formatTaskDate(task.date)}</Text>
            <Text style={styles.taskTime}>🕐 {formatTimeRange(task.time, task.endTime)}</Text>
          </View>
          <Text style={styles.taskClient}>👤 {task.client?.name || '-'}</Text>
          <View style={styles.taskCardFooter}>
            <Text style={styles.taskHours}>{task.hours || '-'} hrs • {cleaningTypeLabels[task.cleaningType] || task.cleaningType || '-'}</Text>
            <View style={styles.tapHint}>
              <Text style={styles.tapHintText}>Tap to assign →</Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}

      <Text style={styles.tabLabel}>All Tasks ({allTasks.length})</Text>
      {allTasks.length === 0 && !tasksLoading ? (
        <Text style={styles.emptyText}>No tasks found</Text>
      ) : null}
      {allTasks.map((task) => (
        <TouchableOpacity key={`a-${task.id}`} style={styles.taskCard} onPress={() => openTaskDetail(task)} activeOpacity={0.7}>
          <View style={styles.taskHeader}>
            <Text style={styles.taskId}>Task #{task.id}</Text>
            <View style={[styles.taskStatusBadge, { backgroundColor: (statusColors[task.status] || colors.gray[400]) + '15' }]}>
              <Text style={[styles.taskStatusBadgeText, { color: statusColors[task.status] || colors.gray[400] }]}>
                {task.status?.charAt(0).toUpperCase() + task.status?.slice(1)}
              </Text>
            </View>
          </View>
          <Text style={styles.taskAddress}>📍 {task.address}</Text>
          <Text style={styles.taskClient}>👤 Client: {task.client?.name || '-'}</Text>
          {task.cleaner ? <Text style={styles.taskCleaner}>🧹 Cleaner: {task.cleaner.name}</Text> : null}
        </TouchableOpacity>
      ))}

      {renderTaskDetailModal()}
    </View>
  );

  const seekerStatusColors = { pending: '#F59E0B', approved: '#10B981', rejected: '#EF4444' };

  const renderJobSeekerDetailModal = () => {
    if (!selectedJobSeeker) return null;
    const seeker = selectedJobSeeker;
    const docs = (() => {
      try {
        if (!seeker.documents) return [];
        if (Array.isArray(seeker.documents)) return seeker.documents;
        return JSON.parse(seeker.documents);
      } catch { return []; }
    })();

    return (
      <Modal visible={showJobSeekerModal} animationType="slide" transparent onRequestClose={closeJobSeekerModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>{seeker.name}</Text>
                <View style={[styles.statusBadge, { backgroundColor: (seekerStatusColors[seeker.status] || colors.gray[400]) + '20' }]}>
                  <View style={[styles.statusDot, { backgroundColor: seekerStatusColors[seeker.status] || colors.gray[400] }]} />
                  <Text style={[styles.statusBadgeText, { color: seekerStatusColors[seeker.status] || colors.gray[400] }]}>
                    {seeker.status?.charAt(0).toUpperCase() + seeker.status?.slice(1)}
                  </Text>
                </View>
              </View>
              <TouchableOpacity style={styles.modalCloseBtn} onPress={closeJobSeekerModal}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            {jobSeekerDetailLoading ? (
              <View style={styles.modalLoadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.modalLoadingText}>Loading details...</Text>
              </View>
            ) : (
              <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                {/* Personal Information */}
                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>Personal Information</Text>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>👤 Name</Text>
                    <Text style={styles.detailValue}>{seeker.name}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>📧 Email</Text>
                    <Text style={styles.detailValue}>{seeker.email}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>📞 Phone</Text>
                    <Text style={styles.detailValue}>{seeker.phone}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>📍 Address</Text>
                    <Text style={styles.detailValue}>{seeker.address || '-'}</Text>
                  </View>
                  {(seeker.city || seeker.zipCode) ? (
                    <View style={styles.detailRowInline}>
                      <View style={styles.detailHalf}>
                        <Text style={styles.detailLabel}>🏙 City</Text>
                        <Text style={styles.detailValue}>{seeker.city || '-'}</Text>
                      </View>
                      <View style={styles.detailHalf}>
                        <Text style={styles.detailLabel}>📮 Zip Code</Text>
                        <Text style={styles.detailValue}>{seeker.zipCode || '-'}</Text>
                      </View>
                    </View>
                  ) : null}
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>💼 Experience</Text>
                    <Text style={styles.detailValue}>{seeker.experience || 0} years</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>📅 Applied</Text>
                    <Text style={styles.detailValue}>{formatDate(seeker.createdAt)}</Text>
                  </View>
                </View>

                {/* Description */}
                {seeker.description ? (
                  <View style={styles.detailSection}>
                    <Text style={styles.detailSectionTitle}>Description</Text>
                    <Text style={styles.descriptionText}>{seeker.description}</Text>
                  </View>
                ) : null}

                {/* CV */}
                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>📄 CV / Resume</Text>
                  {seeker.cv ? (
                    <View>
                      <Text style={styles.fileNameText}>{seeker.cv.split('/').pop()}</Text>
                      <TouchableOpacity
                        style={styles.downloadBtn}
                        onPress={() => downloadCV(seeker.id)}
                        disabled={downloadingFile === 'cv'}
                      >
                        {downloadingFile === 'cv' ? (
                          <ActivityIndicator size="small" color={colors.white} />
                        ) : (
                          <Text style={styles.downloadBtnText}>⬇ Download CV</Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <Text style={styles.noFileText}>No CV uploaded</Text>
                  )}
                </View>

                {/* Documents */}
                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>📁 Additional Documents</Text>
                  {docs.length > 0 ? (
                    docs.map((doc, index) => (
                      <View key={index} style={styles.documentRow}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.fileNameText}>{typeof doc === 'string' ? doc.split('/').pop() : `Document ${index + 1}`}</Text>
                        </View>
                        <TouchableOpacity
                          style={styles.downloadSmallBtn}
                          onPress={() => downloadDocument(seeker.id, index)}
                          disabled={downloadingFile === `doc-${index}`}
                        >
                          {downloadingFile === `doc-${index}` ? (
                            <ActivityIndicator size="small" color={colors.primary} />
                          ) : (
                            <Text style={styles.downloadSmallBtnText}>⬇ Download</Text>
                          )}
                        </TouchableOpacity>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.noFileText}>No additional documents uploaded</Text>
                  )}
                </View>

                {/* Action Buttons */}
                {seeker.status === 'pending' ? (
                  <View style={styles.detailSection}>
                    <Text style={styles.detailSectionTitle}>Actions</Text>
                    <View style={styles.modalActionRow}>
                      <TouchableOpacity
                        style={styles.modalApproveBtn}
                        onPress={() => {
                          approveJobSeeker(seeker.id);
                          closeJobSeekerModal();
                        }}
                      >
                        <Text style={styles.modalActionBtnText}>✓ Approve Application</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.modalRejectBtn}
                        onPress={() => {
                          rejectJobSeeker(seeker.id);
                          closeJobSeekerModal();
                        }}
                      >
                        <Text style={styles.modalActionBtnText}>✗ Reject Application</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : null}

                <View style={{ height: spacing.xl }} />
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    );
  };

  const renderJobSeekersTab = () => (
    <View style={styles.contentSection}>
      <Text style={styles.sectionTitle}>{t('admin.jobSeekers', 'Job Seekers')}</Text>
      <TouchableOpacity style={styles.refreshBtn} onPress={fetchJobSeekers}>
        <Text style={styles.refreshText}>Refresh Applications</Text>
      </TouchableOpacity>

      {jobSeekersLoading ? <Text style={styles.emptyText}>Loading applications...</Text> : null}
      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

      {jobSeekers.length === 0 && !jobSeekersLoading ? (
        <Text style={styles.emptyText}>No applications yet</Text>
      ) : null}

      {jobSeekers.map((seeker) => (
        <View key={seeker.id} style={styles.seekerCard}>
          <View style={styles.seekerHeader}>
            <Text style={styles.userName}>{seeker.name}</Text>
            <View style={[styles.seekerStatusBadge, { backgroundColor: (seekerStatusColors[seeker.status] || colors.gray[400]) + '15' }]}>
              <Text style={[styles.seekerStatusText, { color: seekerStatusColors[seeker.status] || colors.gray[400] }]}>
                {seeker.status?.charAt(0).toUpperCase() + seeker.status?.slice(1)}
              </Text>
            </View>
          </View>
          <Text style={styles.userEmail}>📧 {seeker.email}</Text>
          <Text style={styles.userPhone}>📞 {seeker.phone}</Text>
          {seeker.address ? <Text style={styles.userType}>📍 {seeker.address}{seeker.city ? `, ${seeker.city}` : ''}{seeker.zipCode ? ` ${seeker.zipCode}` : ''}</Text> : null}
          <Text style={styles.userType}>💼 Experience: {seeker.experience || 0} years</Text>
          {seeker.createdAt ? <Text style={styles.smallText}>📅 Applied: {formatDate(seeker.createdAt)}</Text> : null}

          {seeker.description ? (
            <Text style={styles.seekerDescription} numberOfLines={2}>{seeker.description}</Text>
          ) : null}

          <View style={styles.seekerActions}>
            <TouchableOpacity style={styles.viewCvBtn} onPress={() => viewJobSeekerDetails(seeker)}>
              <Text style={styles.viewCvBtnText}>📄 View CV & Details</Text>
            </TouchableOpacity>

            {seeker.status === 'pending' ? (
              <View style={styles.actionRow}>
                <TouchableOpacity style={styles.approveBtn} onPress={() => approveJobSeeker(seeker.id)}>
                  <Text style={styles.actionText}>Approve</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.rejectBtn} onPress={() => rejectJobSeeker(seeker.id)}>
                  <Text style={styles.actionText}>Reject</Text>
                </TouchableOpacity>
              </View>
            ) : null}
          </View>
        </View>
      ))}

      {renderJobSeekerDetailModal()}
    </View>
  );

  const renderArchivesTab = () => (
    <View style={styles.contentSection}>
      <Text style={styles.sectionTitle}>{t('dashboard.archives', 'Archives')}</Text>
      <TouchableOpacity style={styles.refreshBtn} onPress={fetchCompletedTasks}>
        <Text style={styles.refreshText}>Refresh Archives</Text>
      </TouchableOpacity>

      {tasksLoading ? <Text style={styles.emptyText}>Loading archives...</Text> : null}
      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

      {completedTasks.map((task) => (
        <View key={`c-${task.id}`} style={styles.taskCard}>
          <View style={styles.taskHeader}>
            <Text style={styles.taskId}>Task #{task.id}</Text>
            <Text style={styles.statusCompleted}>✅ Completed</Text>
          </View>
          <Text style={styles.taskAddress}>📍 {task.address}</Text>
          <Text style={styles.taskDate}>📅 {formatDate(task.date)}</Text>
          <Text style={styles.taskClient}>👤 Client: {task.client?.name || '-'}</Text>
          <Text style={styles.taskCleaner}>🧹 Cleaner: {task.cleaner?.name || '-'}</Text>
        </View>
      ))}
    </View>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'users':
        return renderUsersTab();
      case 'tasks':
        return renderTasksTab();
      case 'jobseekers':
        return renderJobSeekersTab();
      case 'archives':
        return renderArchivesTab();
      case 'profile':
        return <Profile userRole="admin" />;
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
          <Text style={styles.mobileTitle}>{t('dashboard.adminDashboard', 'Admin Dashboard')}</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView style={styles.scrollContent} contentContainerStyle={styles.scrollContentContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.dashboardContainer}>
            <View style={styles.headerWrapper}>
              <Text style={styles.desktopTitle}>{t('dashboard.adminDashboard', 'Admin Dashboard')}</Text>
            </View>

            {activeTab === 'profile' ? (
              <View style={styles.contentWrapper}>
                <Profile userRole="admin" />
              </View>
            ) : (
              <View style={styles.contentWrapper}>
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
    fontSize: typography.fontSize.sm,
    color: colors.error,
    marginBottom: spacing.md,
  },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md, gap: spacing.sm },
  input: {
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    backgroundColor: colors.white,
    color: colors.textDark,
    marginBottom: spacing.xs,
  },
  searchInput: { flex: 1, marginBottom: 0 },
  filterChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.gray[300],
  },
  filterText: { fontSize: typography.fontSize.xs, color: colors.text },
  filterTextActive: { color: colors.primary, fontWeight: typography.fontWeight.bold },
  refreshBtn: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  refreshText: { color: colors.primaryDark, fontWeight: typography.fontWeight.semibold },
  editBtn: {
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  editBtnText: { color: colors.white, fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.semibold },
  toggleBtn: {
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
    backgroundColor: colors.gray[200],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  toggleBtnText: { color: colors.textDark, fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.semibold },
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
  userEmail: { fontSize: typography.fontSize.sm, color: colors.text, marginBottom: spacing.xs },
  userPhone: { fontSize: typography.fontSize.sm, color: colors.text, marginBottom: spacing.xs },
  userType: { fontSize: typography.fontSize.sm, color: colors.textLight, marginTop: spacing.xs },
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
  statusCompleted: { color: colors.success, fontWeight: typography.fontWeight.semibold },
  taskAddress: { fontSize: typography.fontSize.md, color: colors.textDark, marginBottom: spacing.xs },
  taskDate: { fontSize: typography.fontSize.sm, color: colors.text, marginBottom: spacing.xs },
  taskClient: { fontSize: typography.fontSize.sm, color: colors.text, marginBottom: spacing.xs },
  taskCleaner: { fontSize: typography.fontSize.sm, color: colors.text, marginBottom: spacing.xs },
  taskMetaRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.xs },
  taskTime: { fontSize: typography.fontSize.sm, color: colors.text },
  taskCardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.sm, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.gray[200] },
  taskHours: { fontSize: typography.fontSize.xs, color: colors.textLight },
  tapHint: { backgroundColor: colors.primaryLight, paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: borderRadius.sm },
  tapHintText: { fontSize: typography.fontSize.xs, color: colors.primaryDark, fontWeight: typography.fontWeight.semibold },
  taskStatusBadge: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: borderRadius.sm },
  taskStatusBadgeText: { fontSize: typography.fontSize.xs, fontWeight: typography.fontWeight.semibold },
  recurringBadge: { alignSelf: 'flex-start', backgroundColor: '#EBF5FF', borderRadius: borderRadius.sm, paddingHorizontal: spacing.sm, paddingVertical: 3, marginBottom: spacing.xs },
  recurringBadgeText: { fontSize: typography.fontSize.xs, color: colors.primary, fontWeight: typography.fontWeight.semibold },
  // ── Modal ──
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContainer: { backgroundColor: colors.white, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: Dimensions.get('window').height * 0.9, minHeight: 300 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.gray[200] },
  modalTitle: { fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.bold, color: colors.textDark },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: borderRadius.sm, marginTop: spacing.xs, alignSelf: 'flex-start' },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: spacing.xs },
  statusBadgeText: { fontSize: typography.fontSize.xs, fontWeight: typography.fontWeight.semibold },
  modalCloseBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.gray[100], alignItems: 'center', justifyContent: 'center' },
  modalCloseText: { fontSize: 16, color: colors.textDark, fontWeight: typography.fontWeight.bold },
  modalBody: { padding: spacing.lg },
  detailSection: { marginBottom: spacing.lg, backgroundColor: colors.backgroundLight, borderRadius: borderRadius.md, padding: spacing.md },
  detailSectionTitle: { fontSize: typography.fontSize.md, fontWeight: typography.fontWeight.bold, color: colors.primary, marginBottom: spacing.sm },
  detailRow: { marginBottom: spacing.sm },
  detailRowInline: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.sm },
  detailHalf: { flex: 1 },
  detailLabel: { fontSize: typography.fontSize.xs, color: colors.textLight, marginBottom: 2 },
  detailValue: { fontSize: typography.fontSize.sm, color: colors.textDark, fontWeight: typography.fontWeight.medium || '500' },
  checklistItem: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xs },
  checklistIcon: { fontSize: 16, marginRight: spacing.sm, color: colors.primary },
  checklistText: { fontSize: typography.fontSize.sm, color: colors.textDark, flex: 1 },
  // ── Dropdown ──
  dropdownTrigger: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1.5, borderColor: colors.gray[300], borderRadius: borderRadius.md, padding: spacing.md, backgroundColor: colors.white, marginBottom: spacing.sm },
  dropdownTriggerText: { fontSize: typography.fontSize.md, color: colors.textDark, fontWeight: typography.fontWeight.medium || '500' },
  dropdownPlaceholder: { fontSize: typography.fontSize.md, color: colors.textLight },
  dropdownArrow: { fontSize: 12, color: colors.textLight, marginLeft: spacing.sm },
  dropdownList: { borderWidth: 1, borderColor: colors.gray[200], borderRadius: borderRadius.md, backgroundColor: colors.white, marginBottom: spacing.md },
  dropdownScroll: { maxHeight: 300 },
  dropdownCount: { textAlign: 'center', fontSize: typography.fontSize.xs, color: colors.textLight, paddingVertical: spacing.xs, borderTopWidth: 1, borderTopColor: colors.gray[100] },
  dropdownItem: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.gray[100] },
  dropdownItemSelected: { backgroundColor: colors.primaryLight },
  dropdownItemText: { fontSize: typography.fontSize.sm, color: colors.textDark, fontWeight: typography.fontWeight.medium || '500' },
  dropdownItemTextSelected: { color: colors.primaryDark, fontWeight: typography.fontWeight.bold },
  dropdownItemSub: { fontSize: typography.fontSize.xs, color: colors.textLight, marginTop: 1 },
  dropdownCheck: { fontSize: 16, color: colors.primary, fontWeight: typography.fontWeight.bold, marginLeft: spacing.sm },
  dropdownEmpty: { padding: spacing.md, textAlign: 'center', color: colors.textLight, fontSize: typography.fontSize.sm },
  modalAssignBtn: { backgroundColor: colors.primary, paddingVertical: spacing.md, borderRadius: borderRadius.md, alignItems: 'center', marginTop: spacing.sm },
  modalAssignBtnDisabled: { backgroundColor: colors.gray[300] },
  modalAssignBtnText: { color: colors.white, fontSize: typography.fontSize.md, fontWeight: typography.fontWeight.bold },
  actionRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm, marginBottom: spacing.sm, flexWrap: 'wrap' },
  approveBtn: {
    backgroundColor: colors.success,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  rejectBtn: {
    backgroundColor: colors.error,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  actionText: { color: colors.white, fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.semibold },
  smallText: { fontSize: typography.fontSize.xs, color: colors.textLight },
  // ── Job Seeker Card & Detail Modal ──
  seekerCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  seekerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  seekerStatusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.full || 999,
  },
  seekerStatusText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
  },
  seekerDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.textLight,
    marginTop: spacing.xs,
    fontStyle: 'italic',
  },
  seekerActions: {
    marginTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
    paddingTop: spacing.md,
  },
  viewCvBtn: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  viewCvBtnText: {
    color: colors.white,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
  },
  modalLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxl || 40,
  },
  modalLoadingText: {
    marginTop: spacing.md,
    fontSize: typography.fontSize.sm,
    color: colors.textLight,
  },
  descriptionText: {
    fontSize: typography.fontSize.sm,
    color: colors.textDark,
    lineHeight: 22,
    backgroundColor: colors.gray[50] || '#F9FAFB',
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  fileNameText: {
    fontSize: typography.fontSize.sm,
    color: colors.textDark,
    marginBottom: spacing.xs,
  },
  noFileText: {
    fontSize: typography.fontSize.sm,
    color: colors.textLight,
    fontStyle: 'italic',
    paddingVertical: spacing.sm,
  },
  downloadBtn: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  downloadBtnText: {
    color: colors.white,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
  },
  documentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  downloadSmallBtn: {
    backgroundColor: colors.primaryLight || '#EBF5FF',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  downloadSmallBtnText: {
    color: colors.primary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  modalActionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  modalApproveBtn: {
    flex: 1,
    backgroundColor: '#10B981',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    minWidth: 130,
  },
  modalRejectBtn: {
    flex: 1,
    backgroundColor: '#EF4444',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    minWidth: 130,
  },
  modalActionBtnText: {
    color: colors.white,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
  },
});

export default AdminDashboard;