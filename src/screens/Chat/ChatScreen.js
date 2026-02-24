import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { colors, spacing, typography, borderRadius } from '../../constants/theme';

// Dummy conversations: client sees cleaners, cleaner sees clients, admin sees both
const DUMMY_CLEANERS = [
  { id: 'c1', name: 'John Cleaner', role: 'cleaner', lastMessage: 'I can do the cleaning tomorrow at 9am.', time: '10:30', unread: 2 },
  { id: 'c2', name: 'Maria Smith', role: 'cleaner', lastMessage: 'Task completed. Please confirm.', time: 'Yesterday', unread: 0 },
];
const DUMMY_CLIENTS = [
  { id: 'cl1', name: 'Demo Client', role: 'client', lastMessage: 'When can you start?', time: '11:00', unread: 0 },
  { id: 'cl2', name: 'ABC Company', role: 'client', lastMessage: 'Thanks for the update.', time: 'Yesterday', unread: 1 },
];

// Dummy messages for a thread
const DUMMY_MESSAGES = [
  { id: 'm1', text: 'Hi, I have a cleaning request for next week.', sender: 'other', time: '10:00' },
  { id: 'm2', text: 'Sure! I can do Tuesday or Wednesday. Which works?', sender: 'me', time: '10:05' },
  { id: 'm3', text: 'Wednesday at 9am would be perfect.', sender: 'other', time: '10:08' },
  { id: 'm4', text: 'Booked. I will be there Wednesday 9am.', sender: 'me', time: '10:10' },
];

function ConversationList({ conversations, onSelect }) {
  return (
    <FlatList
      data={conversations}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContent}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.conversationItem}
          onPress={() => onSelect(item)}
          activeOpacity={0.7}
        >
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
          </View>
          <View style={styles.conversationBody}>
            <View style={styles.conversationRow}>
              <Text style={styles.conversationName} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.conversationTime}>{item.time}</Text>
            </View>
            <Text style={[styles.conversationPreview, item.unread > 0 && styles.unread]} numberOfLines={1}>
              {item.lastMessage}
            </Text>
            {item.unread > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.unread}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      )}
    />
  );
}

function ChatThread({ participant, onBack }) {
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState(DUMMY_MESSAGES);
  const [input, setInput] = useState('');

  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages((prev) => [
      ...prev,
      { id: 'm' + Date.now(), text: input.trim(), sender: 'me', time: 'Now' },
    ]);
    setInput('');
  };

  return (
    <View style={styles.threadContainer}>
      <View style={[styles.threadHeader, { paddingTop: Math.max(insets.top, spacing.md), paddingBottom: spacing.md }]}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.threadTitle}>{participant.name}</Text>
        <Text style={styles.threadRole}>{participant.role}</Text>
      </View>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        renderItem={({ item }) => {
          const isMe = item.sender === 'me';
          return (
            <View style={[styles.messageBubble, isMe ? styles.messageMe : styles.messageOther]}>
              <Text style={[styles.messageText, isMe && styles.messageTextMe]}>{item.text}</Text>
              <Text style={[styles.messageTime, isMe && styles.messageTimeMe]}>{item.time}</Text>
            </View>
          );
        }}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        style={styles.inputRow}
      >
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Type a message..."
          placeholderTextColor={colors.textLight}
          multiline
          maxLength={500}
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </View>
  );
}

export default function ChatScreen() {
  const { isAuthenticated, userRole } = useAuth();
  const [selected, setSelected] = useState(null);

  const conversations =
    userRole === 'client'
      ? DUMMY_CLEANERS
      : userRole === 'cleaner'
      ? DUMMY_CLIENTS
      : userRole === 'admin'
      ? [...DUMMY_CLIENTS, ...DUMMY_CLEANERS]
      : [];

  const insets = useSafeAreaInsets();
  const headerPadding = { paddingTop: Math.max(insets.top, spacing.md), paddingBottom: spacing.lg };

  if (!isAuthenticated) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.centered}>
          <Text style={styles.placeholderIcon}>💬</Text>
          <Text style={styles.placeholderTitle}>Messages</Text>
          <Text style={styles.placeholderText}>Log in to chat with clients and cleaners.</Text>
        </View>
      </View>
    );
  }

  if (selected) {
    return (
      <View style={styles.container}>
        <ChatThread participant={selected} onBack={() => setSelected(null)} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, headerPadding]}>
        <Text style={styles.headerTitle}>Messages</Text>
        <Text style={styles.headerSubtitle}>
          {userRole === 'admin' ? 'Chat with clients & cleaners' : userRole === 'client' ? 'Chat with your cleaners' : 'Chat with clients'}
        </Text>
      </View>
      {conversations.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.placeholderIcon}>💬</Text>
          <Text style={styles.placeholderText}>No conversations yet.</Text>
        </View>
      ) : (
        <ConversationList conversations={conversations} onSelect={setSelected} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
  },
  header: {
    padding: spacing.lg,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
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
  avatarText: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  conversationBody: {
    flex: 1,
    position: 'relative',
  },
  conversationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  conversationName: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textDark,
    flex: 1,
  },
  conversationTime: {
    fontSize: typography.fontSize.xs,
    color: colors.textLight,
  },
  conversationPreview: {
    fontSize: typography.fontSize.sm,
    color: colors.text,
  },
  unread: {
    fontWeight: typography.fontWeight.semibold,
    color: colors.textDark,
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
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
  threadContainer: {
    flex: 1,
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
    marginRight: spacing.md,
  },
  backText: {
    fontSize: typography.fontSize.md,
    color: colors.primary,
    fontWeight: typography.fontWeight.semibold,
  },
  threadTitle: {
    flex: 1,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.textDark,
  },
  threadRole: {
    fontSize: typography.fontSize.sm,
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
  },
  messageOther: {
    alignSelf: 'flex-start',
    backgroundColor: colors.gray[200],
  },
  messageText: {
    fontSize: typography.fontSize.md,
    color: colors.textDark,
  },
  messageTextMe: {
    color: colors.white,
  },
  messageTime: {
    fontSize: typography.fontSize.xs,
    color: colors.textLight,
    marginTop: spacing.xs,
  },
  messageTimeMe: {
    color: 'rgba(255,255,255,0.8)',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: spacing.md,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.fontSize.md,
    color: colors.textDark,
    backgroundColor: colors.backgroundLight,
    marginRight: spacing.sm,
  },
  sendButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
  },
  sendButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.white,
  },
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
