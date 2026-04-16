import React, { useState, useRef } from 'react';
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
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius, shadows } from '../../constants/theme';
import { MOCK_CHAT_CONVERSATIONS, MOCK_MESSAGES, THERAPISTS } from '../../utils/mockData';

// ─── CONVERSATION LIST ──────────────────────────────────────
function ConversationList({ onSelect }) {
  const insets = useSafeAreaInsets();

  const renderItem = ({ item }) => {
    const { therapist } = item;
    return (
      <TouchableOpacity
        style={styles.conversationItem}
        onPress={() => onSelect(item)}
        activeOpacity={0.7}
      >
        <View style={[styles.avatar, { backgroundColor: therapist.color }]}>
          <Text style={styles.avatarText}>{therapist.name.charAt(0)}</Text>
        </View>
        <View style={styles.conversationBody}>
          <View style={styles.conversationRow}>
            <Text style={styles.conversationName}>{therapist.fullName}</Text>
            <Text style={styles.conversationTime}>{item.lastMessageTime}</Text>
          </View>
          <View style={styles.conversationRow}>
            <Text
              style={[styles.conversationPreview, item.unreadCount > 0 && styles.unreadText]}
              numberOfLines={1}
            >
              {item.lastMessage}
            </Text>
            {item.unreadCount > 0 && (
              <View style={[styles.badge, { backgroundColor: therapist.color }]}>
                <Text style={styles.badgeText}>{item.unreadCount}</Text>
              </View>
            )}
          </View>
          <Text style={[styles.roleTag, { color: therapist.color }]}>{therapist.role}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, spacing.md) + spacing.sm }]}>
        <Text style={styles.headerTitle}>Messages</Text>
        <Text style={styles.headerSubtitle}>Chat with your child's therapists</Text>
      </View>

      <FlatList
        data={MOCK_CHAT_CONVERSATIONS}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Ionicons name="chatbubbles-outline" size={64} color={colors.gray[300]} />
            <Text style={styles.emptyTitle}>No conversations yet</Text>
            <Text style={styles.emptyText}>Messages from therapists will appear here</Text>
          </View>
        }
      />
    </View>
  );
}

// ─── CHAT THREAD ────────────────────────────────────────────
function ChatThread({ conversation, onBack }) {
  const insets = useSafeAreaInsets();
  const { therapist } = conversation;
  const [messages, setMessages] = useState(MOCK_MESSAGES[therapist.id] || []);
  const [input, setInput] = useState('');
  const flatListRef = useRef(null);

  const sendMessage = () => {
    const text = input.trim();
    if (!text) return;

    const newMsg = {
      id: Date.now(),
      senderId: 'parent',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true,
    };

    setMessages(prev => [...prev, newMsg]);
    setInput('');

    // Simulate therapist reply after 2 seconds
    setTimeout(() => {
      const replies = [
        `Thank you for your message! I'll get back to you shortly.`,
        `That's a great question! Let me look into that for you.`,
        `I appreciate you reaching out. We'll discuss this further in our next session.`,
        `Absolutely! ${conversation.therapist.name === 'Lisa' ? 'I\'ll check on that for you.' : 'We can work on that during our next therapy session.'}`,
      ];
      const replyMsg = {
        id: Date.now() + 1,
        senderId: therapist.id,
        text: replies[Math.floor(Math.random() * replies.length)],
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isMe: false,
      };
      setMessages(prev => [...prev, replyMsg]);
    }, 2000);
  };

  const renderMessage = ({ item }) => {
    return (
      <View style={[styles.messageBubble, item.isMe ? styles.messageMe : styles.messageOther]}>
        {!item.isMe && (
          <View style={[styles.msgAvatar, { backgroundColor: therapist.color }]}>
            <Text style={styles.msgAvatarText}>{therapist.name.charAt(0)}</Text>
          </View>
        )}
        <View style={[styles.msgContent, item.isMe ? styles.msgContentMe : styles.msgContentOther]}>
          <Text style={[styles.messageText, item.isMe && styles.messageTextMe]}>{item.text}</Text>
          <Text style={[styles.messageTime, item.isMe && styles.messageTimeMe]}>{item.time}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.threadContainer}>
      <View style={[styles.threadHeader, { paddingTop: Math.max(insets.top, spacing.md) + spacing.sm }]}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <View style={[styles.threadAvatar, { backgroundColor: therapist.color }]}>
          <Text style={styles.threadAvatarText}>{therapist.name.charAt(0)}</Text>
        </View>
        <View style={styles.threadHeaderInfo}>
          <Text style={styles.threadTitle}>{therapist.fullName}</Text>
          <Text style={styles.threadRole}>{therapist.role}</Text>
        </View>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderMessage}
        contentContainerStyle={[styles.messagesList, messages.length === 0 && { flex: 1, justifyContent: 'center' }]}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Ionicons name="chatbubble-outline" size={48} color={colors.gray[300]} />
            <Text style={styles.emptyText}>Start a conversation!</Text>
          </View>
        }
        onContentSizeChange={() => {
          if (flatListRef.current && messages.length > 0) {
            flatListRef.current.scrollToEnd({ animated: false });
          }
        }}
      />

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
          />
          <TouchableOpacity
            style={[styles.sendButton, !input.trim() && styles.sendButtonDisabled]}
            onPress={sendMessage}
            disabled={!input.trim()}
          >
            <Ionicons name="send" size={20} color={colors.white} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

// ─── MAIN CHAT SCREEN ───────────────────────────────────────
export default function ChatScreen() {
  const [selectedConversation, setSelectedConversation] = useState(null);

  if (selectedConversation) {
    return (
      <ChatThread
        conversation={selectedConversation}
        onBack={() => setSelectedConversation(null)}
      />
    );
  }

  return <ConversationList onSelect={setSelectedConversation} />;
}

// ─── STYLES ─────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  headerTitle: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  headerSubtitle: {
    fontSize: typography.fontSize.sm,
    color: 'rgba(255,255,255,0.7)',
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
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
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
  },
  conversationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  conversationName: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
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
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    marginTop: 2,
  },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  // ── Thread ──
  threadContainer: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
  },
  threadHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    backgroundColor: colors.primary,
  },
  backButton: {
    padding: spacing.sm,
    marginRight: spacing.xs,
  },
  threadAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
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
    color: colors.white,
  },
  threadRole: {
    fontSize: typography.fontSize.xs,
    color: 'rgba(255,255,255,0.7)',
  },
  messagesList: {
    padding: spacing.md,
    flexGrow: 1,
  },
  messageBubble: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    maxWidth: '85%',
  },
  messageMe: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
  },
  messageOther: {
    alignSelf: 'flex-start',
  },
  msgAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
    marginTop: 4,
  },
  msgAvatarText: {
    fontSize: 12,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  msgContent: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    flexShrink: 1,
  },
  msgContentMe: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  msgContentOther: {
    backgroundColor: colors.white,
    borderBottomLeftRadius: 4,
    ...shadows.sm,
  },
  messageText: {
    fontSize: typography.fontSize.md,
    color: colors.textDark,
    lineHeight: 22,
  },
  messageTextMe: {
    color: colors.white,
  },
  messageTime: {
    fontSize: 10,
    color: colors.textLight,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  messageTimeMe: {
    color: 'rgba(255,255,255,0.7)',
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
  // ── Common ──
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.gray[500],
    marginTop: spacing.md,
  },
  emptyText: {
    fontSize: typography.fontSize.md,
    color: colors.textLight,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});
