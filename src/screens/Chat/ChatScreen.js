import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Modal,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { colors, spacing, typography, borderRadius } from '../../constants/theme';
import api from '../../utils/api';

// ─── CONVERSATION LIST SCREEN ─────────────────────────────────
function ConversationList({ conversations, onSelect, onNewChat, refreshing, onRefresh, userRole }) {
  const insets = useSafeAreaInsets();

  const renderItem = ({ item }) => {
    const { partner, lastMessage, unreadCount } = item;
    const initial = partner.name ? partner.name.charAt(0).toUpperCase() : '?';
    const timeStr = lastMessage?.createdAt ? formatTime(lastMessage.createdAt) : '';
    const preview = lastMessage ? (String(lastMessage.senderId) === String(partner.id) ? lastMessage.text : `You: ${lastMessage.text}`) : 'No messages yet';

    return (
      <TouchableOpacity style={styles.conversationItem} onPress={() => onSelect(item)} activeOpacity={0.7}>
        <View style={[styles.avatar, partner.role === 'admin' && styles.avatarAdmin, partner.role === 'cleaner' && styles.avatarCleaner]}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
        <View style={styles.conversationBody}>
          <View style={styles.conversationRow}>
            <Text style={styles.conversationName} numberOfLines={1}>{partner.name}</Text>
            <Text style={styles.conversationTime}>{timeStr}</Text>
          </View>
          <View style={styles.conversationRow}>
            <Text style={[styles.conversationPreview, unreadCount > 0 && styles.unreadText]} numberOfLines={1}>
              {preview.length > 45 ? preview.substring(0, 45) + '...' : preview}
            </Text>
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
              </View>
            )}
          </View>
          <Text style={styles.roleTag}>{partner.role}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, spacing.md) }]}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerTitle}>Messages</Text>
            <Text style={styles.headerSubtitle}>
              {userRole === 'admin' ? 'Chat with clients & cleaners' : 'Chat with support'}
            </Text>
          </View>
          <TouchableOpacity style={styles.newChatBtn} onPress={onNewChat} activeOpacity={0.7}>
            <Ionicons name="add" size={22} color={colors.white} />
          </TouchableOpacity>
        </View>
      </View>

      {conversations.length === 0 && !refreshing ? (
        <View style={styles.centered}>
          <Text style={styles.placeholderIcon}>💬</Text>
          <Text style={styles.placeholderTitle}>No conversations yet</Text>
          <Text style={styles.placeholderText}>Tap the + button to start a new chat</Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => String(item.partner.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        />
      )}
    </View>
  );
}

// ─── CHAT THREAD SCREEN ──────────────────────────────────────
function ChatThread({ partner, currentUserId, onBack, onMessageSent }) {
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const flatListRef = useRef(null);
  const pollRef = useRef(null);

  const loadMessages = useCallback(async () => {
    try {
      const response = await api.get(`/chat/messages/${partner.id}`);
      if (response.data?.success) {
        setMessages(response.data.data);
      }
    } catch (error) {
      console.error('Load messages error:', error);
    } finally {
      setLoading(false);
    }
  }, [partner.id]);

  const markAsRead = useCallback(async () => {
    try {
      await api.put(`/chat/read/${partner.id}`);
    } catch {
      // silent
    }
  }, [partner.id]);

  useEffect(() => {
    loadMessages();
    markAsRead();

    // Poll for new messages every 5 seconds
    pollRef.current = setInterval(() => {
      loadMessages();
      markAsRead();
    }, 5000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [loadMessages, markAsRead]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || sending) return;

    setSending(true);
    setInput('');

    // Optimistic update
    const tempMsg = {
      id: `temp-${Date.now()}`,
      text,
      senderId: parseInt(currentUserId),
      receiverId: partner.id,
      createdAt: new Date().toISOString(),
      sender: { id: currentUserId },
      _sending: true,
    };
    setMessages(prev => [...prev, tempMsg]);

    try {
      const response = await api.post('/chat/send', { receiverId: partner.id, text });
      if (response.data?.success) {
        setMessages(prev => prev.map(m => m.id === tempMsg.id ? response.data.data : m));
        if (onMessageSent) onMessageSent();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to send message');
      setMessages(prev => prev.filter(m => m.id !== tempMsg.id));
      setInput(text);
    } finally {
      setSending(false);
    }
  };

  const renderMessage = ({ item }) => {
    const isMe = String(item.senderId) === String(currentUserId);
    return (
      <View style={[styles.messageBubble, isMe ? styles.messageMe : styles.messageOther]}>
        <Text style={[styles.messageText, isMe && styles.messageTextMe]}>{item.text}</Text>
        <View style={styles.messageFooter}>
          <Text style={[styles.messageTime, isMe && styles.messageTimeMe]}>
            {item.createdAt ? formatTime(item.createdAt) : ''}
          </Text>
          {isMe && item.isRead && <Text style={styles.readIndicator}>✓✓</Text>}
          {item._sending && <Text style={styles.sendingIndicator}>Sending...</Text>}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.threadContainer}>
      <View style={[styles.threadHeader, { paddingTop: Math.max(insets.top, spacing.md) }]}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <View style={[styles.threadAvatar, partner.role === 'admin' && styles.avatarAdmin, partner.role === 'cleaner' && styles.avatarCleaner]}>
          <Text style={styles.threadAvatarText}>{partner.name?.charAt(0)?.toUpperCase() || '?'}</Text>
        </View>
        <View style={styles.threadHeaderInfo}>
          <Text style={styles.threadTitle} numberOfLines={1}>{partner.name}</Text>
          <Text style={styles.threadRole}>{partner.role}</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderMessage}
          contentContainerStyle={[styles.messagesList, messages.length === 0 && { flex: 1, justifyContent: 'center' }]}
          ListEmptyComponent={
            <View style={styles.centered}>
              <Text style={styles.placeholderIcon}>👋</Text>
              <Text style={styles.placeholderText}>Say hello!</Text>
            </View>
          }
          onContentSizeChange={() => {
            if (flatListRef.current && messages.length > 0) {
              flatListRef.current.scrollToEnd({ animated: false });
            }
          }}
          onLayout={() => {
            if (flatListRef.current && messages.length > 0) {
              flatListRef.current.scrollToEnd({ animated: false });
            }
          }}
        />
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={[styles.inputRow, { paddingBottom: Math.max(insets.bottom, spacing.sm) }]}>
          <TextInput
            style={styles.chatInput}
            value={input}
            onChangeText={setInput}
            placeholder="Type a message..."
            placeholderTextColor={colors.textLight}
            multiline
            maxLength={1000}
            returnKeyType="default"
          />
          <TouchableOpacity
            style={[styles.sendButton, (!input.trim() || sending) && styles.sendButtonDisabled]}
            onPress={sendMessage}
            disabled={!input.trim() || sending}
          >
            <Ionicons name="send" size={20} color={colors.white} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

// ─── USER PICKER MODAL ───────────────────────────────────────
function UserPickerModal({ visible, onClose, onSelect }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (visible) {
      loadUsers();
    }
  }, [visible]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/chat/users');
      if (response.data?.success) {
        setUsers(response.data.data);
      }
    } catch (error) {
      console.error('Load chat users error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = users.filter(u => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (u.name || '').toLowerCase().includes(q) ||
           (u.email || '').toLowerCase().includes(q) ||
           (u.role || '').toLowerCase().includes(q);
  });

  const admins = filtered.filter(u => u.role === 'admin');
  const clientsList = filtered.filter(u => u.role === 'client');
  const cleanersList = filtered.filter(u => u.role === 'cleaner');

  const renderGroup = (title, list) => {
    if (list.length === 0) return null;
    return (
      <View key={title}>
        <Text style={styles.groupTitle}>{title} ({list.length})</Text>
        {list.map(user => (
          <TouchableOpacity key={user.id} style={styles.userPickItem} onPress={() => { onSelect(user); onClose(); setSearch(''); }}>
            <View style={[styles.avatar, user.role === 'admin' && styles.avatarAdmin, user.role === 'cleaner' && styles.avatarCleaner]}>
              <Text style={styles.avatarText}>{user.name?.charAt(0)?.toUpperCase() || '?'}</Text>
            </View>
            <View style={styles.userPickInfo}>
              <Text style={styles.userPickName}>{user.name}</Text>
              <Text style={styles.userPickEmail}>{user.email}</Text>
            </View>
            <Text style={styles.userPickRole}>{user.role}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>New Chat</Text>
            <TouchableOpacity onPress={() => { onClose(); setSearch(''); }}>
              <Ionicons name="close" size={24} color={colors.textLight} />
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Search by name or email..."
            placeholderTextColor={colors.textLight}
          />

          {loading ? (
            <View style={[styles.centered, { paddingVertical: spacing.xl }]}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : filtered.length === 0 ? (
            <View style={[styles.centered, { paddingVertical: spacing.xl }]}>
              <Text style={styles.placeholderText}>No users found</Text>
            </View>
          ) : (
            <FlatList
              data={[1]}
              renderItem={() => (
                <View style={styles.userPickList}>
                  {renderGroup('Admins', admins)}
                  {renderGroup('Clients', clientsList)}
                  {renderGroup('Cleaners', cleanersList)}
                </View>
              )}
              keyExtractor={() => 'groups'}
              contentContainerStyle={{ paddingBottom: spacing.lg }}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

// ─── MAIN CHAT SCREEN ────────────────────────────────────────
export default function ChatScreen() {
  const { isAuthenticated, userRole, userId } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showUserPicker, setShowUserPicker] = useState(false);
  const pollRef = useRef(null);
  const insets = useSafeAreaInsets();

  const loadConversations = useCallback(async () => {
    try {
      const response = await api.get('/chat/conversations');
      if (response.data?.success) {
        setConversations(response.data.data);
      }
    } catch (error) {
      console.error('Load conversations error:', error);
    }
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadConversations();
    setRefreshing(false);
  }, [loadConversations]);

  useEffect(() => {
    if (isAuthenticated) {
      loadConversations();
      pollRef.current = setInterval(loadConversations, 10000);
      return () => {
        if (pollRef.current) clearInterval(pollRef.current);
      };
    }
  }, [isAuthenticated, loadConversations]);

  const handleSelectConversation = (conv) => {
    setSelectedConversation(conv.partner);
  };

  const handleStartNewChat = (user) => {
    setSelectedConversation(user);
  };

  const handleBack = () => {
    setSelectedConversation(null);
    loadConversations();
  };

  if (!isAuthenticated) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.centered}>
          <Text style={styles.placeholderIcon}>💬</Text>
          <Text style={styles.placeholderTitle}>Messages</Text>
          <Text style={styles.placeholderText}>Log in to chat.</Text>
        </View>
      </View>
    );
  }

  if (selectedConversation) {
    return (
      <ChatThread
        partner={selectedConversation}
        currentUserId={userId}
        onBack={handleBack}
        onMessageSent={loadConversations}
      />
    );
  }

  return (
    <View style={styles.container}>
      <ConversationList
        conversations={conversations}
        onSelect={handleSelectConversation}
        onNewChat={() => setShowUserPicker(true)}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        userRole={userRole}
      />
      <UserPickerModal
        visible={showUserPicker}
        onClose={() => setShowUserPicker(false)}
        onSelect={handleStartNewChat}
      />
    </View>
  );
}

// ─── HELPERS ─────────────────────────────────────────────────
function formatTime(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return date.toLocaleDateString([], { weekday: 'short' });
  } else {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }
}

// ─── STYLES ──────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
  },
  // ── Header ──
  header: {
    padding: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textDark,
  },
  headerSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textLight,
    marginTop: spacing.xs,
  },
  newChatBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  // ── Conversation List ──
  listContent: {
    padding: spacing.md,
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  avatarAdmin: {
    backgroundColor: colors.warning,
  },
  avatarCleaner: {
    backgroundColor: colors.secondary,
  },
  avatarText: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  conversationBody: {
    flex: 1,
  },
  conversationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  conversationName: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textDark,
    flex: 1,
    marginRight: spacing.sm,
  },
  conversationTime: {
    fontSize: typography.fontSize.xs,
    color: colors.textLight,
  },
  conversationPreview: {
    fontSize: typography.fontSize.sm,
    color: colors.text,
    flex: 1,
    marginRight: spacing.sm,
  },
  unreadText: {
    fontWeight: typography.fontWeight.semibold,
    color: colors.textDark,
  },
  roleTag: {
    fontSize: 10,
    color: colors.textLight,
    textTransform: 'capitalize',
    marginTop: 2,
  },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  // ── Chat Thread ──
  threadContainer: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
  },
  threadHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  backButton: {
    marginRight: spacing.sm,
    padding: spacing.xs,
  },
  threadAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  threadAvatarText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  threadHeaderInfo: {
    flex: 1,
  },
  threadTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.textDark,
  },
  threadRole: {
    fontSize: typography.fontSize.xs,
    color: colors.textLight,
    textTransform: 'capitalize',
  },
  messagesList: {
    padding: spacing.md,
    flexGrow: 1,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
  },
  messageMe: {
    alignSelf: 'flex-end',
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  messageOther: {
    alignSelf: 'flex-start',
    backgroundColor: colors.white,
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  messageText: {
    fontSize: typography.fontSize.md,
    color: colors.textDark,
    lineHeight: 22,
  },
  messageTextMe: {
    color: colors.white,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  messageTime: {
    fontSize: 10,
    color: colors.textLight,
  },
  messageTimeMe: {
    color: 'rgba(255,255,255,0.7)',
  },
  readIndicator: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
  },
  sendingIndicator: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.5)',
    fontStyle: 'italic',
  },
  // ── Input ──
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  chatInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 20,
    paddingHorizontal: spacing.md,
    paddingVertical: Platform.OS === 'ios' ? spacing.sm : spacing.xs,
    fontSize: typography.fontSize.md,
    color: colors.textDark,
    backgroundColor: colors.backgroundLight,
    marginRight: spacing.sm,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: colors.gray[300],
  },
  // ── User Picker Modal ──
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
    maxHeight: '80%',
    minHeight: '50%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  modalTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.textDark,
  },
  searchInput: {
    margin: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.fontSize.md,
    color: colors.textDark,
    backgroundColor: colors.backgroundLight,
  },
  userPickList: {
    paddingHorizontal: spacing.md,
  },
  groupTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
  },
  userPickItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  userPickInfo: {
    flex: 1,
  },
  userPickName: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textDark,
  },
  userPickEmail: {
    fontSize: typography.fontSize.sm,
    color: colors.textLight,
    marginTop: 2,
  },
  userPickRole: {
    fontSize: typography.fontSize.xs,
    color: colors.textLight,
    textTransform: 'capitalize',
    backgroundColor: colors.gray[100],
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
  },
  // ── Common ──
  messageTextMe: {
    color: colors.white,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  messageTime: {
    fontSize: 10,
    color: colors.textLight,
  },
  messageTimeMe: {
    color: 'rgba(255,255,255,0.7)',
  },
  readIndicator: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
  },
  sendingIndicator: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.5)',
    fontStyle: 'italic',
  },
  // ── Input ──
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  chatInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 20,
    paddingHorizontal: spacing.md,
    paddingVertical: Platform.OS === 'ios' ? spacing.sm : spacing.xs,
    fontSize: typography.fontSize.md,
    color: colors.textDark,
    backgroundColor: colors.backgroundLight,
    marginRight: spacing.sm,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: colors.gray[300],
  },
  // ── User Picker Modal ──
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
    maxHeight: '80%',
    minHeight: '50%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  modalTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.textDark,
  },
  searchInput: {
    margin: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.fontSize.md,
    color: colors.textDark,
    backgroundColor: colors.backgroundLight,
  },
  userPickList: {
    paddingHorizontal: spacing.md,
  },
  groupTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
  },
  userPickItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  userPickInfo: {
    flex: 1,
  },
  userPickName: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textDark,
  },
  userPickEmail: {
    fontSize: typography.fontSize.sm,
    color: colors.textLight,
    marginTop: 2,
  },
  userPickRole: {
    fontSize: typography.fontSize.xs,
    color: colors.textLight,
    textTransform: 'capitalize',
    backgroundColor: colors.gray[100],
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
  },
  // ── Common ──
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  placeholderIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  placeholderTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textDark,
    marginBottom: spacing.sm,
  },
  placeholderText: {
    fontSize: typography.fontSize.md,
    color: colors.textLight,
    textAlign: 'center',
  },
});
