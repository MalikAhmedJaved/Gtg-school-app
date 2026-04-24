import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { spacing, typography, borderRadius } from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';

// Global error storage
let errorLogs = [];
let errorListeners = [];

const safeConsoleError = (...args) => {
  // Avoid recursion if we override console.error elsewhere
  const original = global?.__ORIGINAL_CONSOLE_ERROR__ || console.error;
  try {
    original(...args);
  } catch (_) {
    // ignore
  }
};

const toMessage = (value) => {
  if (value instanceof Error) return value.message;
  if (typeof value === 'string') return value;
  try {
    return JSON.stringify(value);
  } catch (_) {
    return String(value);
  }
};

export const logError = async (error, errorInfo = null) => {
  const errorEntry = {
    id: Date.now() + Math.random(),
    message: error?.message || String(error),
    stack: error?.stack,
    errorInfo: errorInfo ? JSON.stringify(errorInfo, null, 2) : null,
    timestamp: new Date().toISOString(),
    level: 'error',
  };
  errorLogs.unshift(errorEntry); // Add to beginning
  safeConsoleError('App Error:', errorEntry);
  
  // Save to AsyncStorage for persistence
  try {
    const existingErrors = await AsyncStorage.getItem('appErrors');
    const errors = existingErrors ? JSON.parse(existingErrors) : [];
    errors.unshift(errorEntry);
    // Keep only last 20 in storage
    const trimmed = errors.slice(0, 20);
    await AsyncStorage.setItem('appErrors', JSON.stringify(trimmed));
  } catch (storageErr) {
    // ignore storage errors
  }
  
  // Notify listeners after current execution (avoids setState-during-render when Image/etc triggers console.error)
  const listeners = errorListeners.slice();
  const notify = () => listeners.forEach((l) => l(errorEntry));
  if (typeof queueMicrotask === 'function') {
    queueMicrotask(notify);
  } else {
    setTimeout(notify, 0);
  }

  // Keep only last 50 errors
  if (errorLogs.length > 50) {
    errorLogs = errorLogs.slice(0, 50);
  }
};

export const logConsole = (level, args) => {
  const message = Array.isArray(args) ? args.map(toMessage).join(' ') : toMessage(args);
  const err = args?.find?.((a) => a instanceof Error);
  const entry = {
    id: Date.now() + Math.random(),
    message: level === 'error' ? (err?.message || message) : message,
    stack: err?.stack,
    errorInfo: null,
    timestamp: new Date().toISOString(),
    level,
  };
  errorLogs.unshift(entry);
  const listeners = errorListeners.slice();
  const notify = () => listeners.forEach((l) => l(entry));
  if (typeof queueMicrotask === 'function') {
    queueMicrotask(notify);
  } else {
    setTimeout(notify, 0);
  }
  if (errorLogs.length > 50) {
    errorLogs = errorLogs.slice(0, 50);
  }
};

export const getErrorLogs = () => [...errorLogs];
export const clearErrorLogs = () => {
  errorLogs = [];
  errorListeners.forEach(listener => listener(null));
};

export const subscribeToErrors = (listener) => {
  errorListeners.push(listener);
  return () => {
    errorListeners = errorListeners.filter(l => l !== listener);
  };
};

export const copyErrorsToClipboard = () => {
  const errorsText = errorLogs.map(err => 
    `[${new Date(err.timestamp).toLocaleString()}]\n${err.message}\n${err.stack || ''}\n${err.errorInfo || ''}\n\n`
  ).join('---\n\n');
  return errorsText;
};

const ErrorDisplay = () => {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [errors, setErrors] = useState([]);
  const [visible, setVisible] = useState(false);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [detailsText, setDetailsText] = useState('');

  useEffect(() => {
    // Load errors from AsyncStorage on mount
    const loadStoredErrors = async () => {
      try {
        const stored = await AsyncStorage.getItem('appErrors');
        if (stored) {
          const parsed = JSON.parse(stored);
          errorLogs = [...parsed, ...errorLogs];
          setErrors(getErrorLogs());
        }
      } catch (err) {
        // ignore
      }
    };
    loadStoredErrors();

    const unsubscribe = subscribeToErrors((error) => {
      // Defer state update so we don't update ErrorDisplay while another component (e.g. Image) is rendering
      const runUpdate = () => {
        if (error) {
          setErrors(getErrorLogs());
        } else {
          setErrors([]);
        }
      };
      if (typeof queueMicrotask === 'function') {
        queueMicrotask(runUpdate);
      } else {
        setTimeout(runUpdate, 0);
      }
    });

    // Load existing errors (runs in effect, so safe)
    setErrors(getErrorLogs());

    return unsubscribe;
  }, []);

  const handleShowDetails = () => {
    const errorsText = copyErrorsToClipboard();
    setDetailsText(errorsText || 'No errors logged yet.');
    setDetailsVisible(true);
  };

  return (
    <>
      {/* Error Badge - Floating button */}
      <TouchableOpacity
        style={styles.errorBadge}
        onPress={() => setVisible(true)}
        activeOpacity={0.8}
      >
        <Text style={styles.errorBadgeText}>
          🐞 {errors.length}
        </Text>
      </TouchableOpacity>

      {/* Error Modal */}
      <Modal
        visible={visible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Error Logs ({errors.length})</Text>
              <View style={styles.modalActions}>
                <TouchableOpacity
                  onPress={handleShowDetails}
                  style={styles.actionButton}
                >
                  <Text style={styles.actionButtonText}>📋 Details</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={clearErrorLogs}
                  style={styles.actionButton}
                >
                  <Text style={styles.actionButtonText}>🗑️ Clear</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setVisible(false)}
                  style={styles.closeButton}
                >
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>
            </View>
            <ScrollView style={styles.errorList} contentContainerStyle={styles.errorListContent}>
              {errors.length === 0 ? (
                <Text style={styles.noErrors}>
                  No errors logged yet.
                  {'\n\n'}
                  If you still see a red error screen, enable "Debug Remote JS" and paste the console errors here.
                </Text>
              ) : (
                errors.map((error) => (
                  <View key={error.id} style={styles.errorItem}>
                    <Text style={styles.errorTime}>
                      {new Date(error.timestamp).toLocaleString()}
                    </Text>
                    <Text style={styles.errorMessage}>
                      {error.level ? `[${error.level}] ` : ''}
                      {error.message}
                    </Text>
                    {error.stack && (
                      <ScrollView horizontal style={styles.errorStackContainer}>
                        <Text style={styles.errorStackText} numberOfLines={3}>
                          {error.stack.substring(0, 200)}...
                        </Text>
                      </ScrollView>
                    )}
                    {error.errorInfo && (
                      <Text style={styles.errorInfo} numberOfLines={2}>
                        {error.errorInfo.substring(0, 150)}...
                      </Text>
                    )}
                  </View>
                ))
              )}
            </ScrollView>
            <View style={styles.modalFooter}>
              <Text style={styles.footerText}>
                💡 Tip: Shake device → "Debug Remote JS" for full console logs
              </Text>
            </View>
          </View>
        </View>
      </Modal>

      {/* Full details modal with selectable text for easy copy */}
      <Modal
        visible={detailsVisible}
        animationType="slide"
        onRequestClose={() => setDetailsVisible(false)}
      >
        <View style={styles.detailsContainer}>
          <Text style={styles.detailsTitle}>All Error Details</Text>
          <ScrollView style={styles.detailsScroll}>
            <Text selectable style={styles.detailsText}>
              {detailsText}
            </Text>
          </ScrollView>
          <TouchableOpacity
            onPress={() => setDetailsVisible(false)}
            style={styles.detailsCloseButton}
          >
            <Text style={styles.detailsCloseButtonText}>Close</Text>
          </TouchableOpacity>
          <Text style={styles.detailsHint}>
            Long-press the text above to copy it, then paste it into any app (for example WhatsApp, Notes, or your browser) and then send it here.
          </Text>
        </View>
      </Modal>
    </>
  );
};

const makeStyles = (colors) =>
  StyleSheet.create({
  errorBadge: {
    position: 'absolute',
    top: 60,
    right: 15,
    backgroundColor: colors.error,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    zIndex: 9999,
    // iOS stacking
    shadowColor: '#000',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  errorBadgeText: {
    color: colors.white,
    fontWeight: typography.fontWeight.bold,
    fontSize: typography.fontSize.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
    paddingBottom: spacing.md,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  modalTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textDark,
    flex: 1,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
  },
  actionButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.gray[200],
    borderRadius: borderRadius.sm,
  },
  actionButtonText: {
    color: colors.textDark,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
  },
  closeButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  closeButtonText: {
    fontSize: typography.fontSize.xl,
    color: colors.textDark,
    fontWeight: typography.fontWeight.bold,
  },
  errorList: {
    flex: 1,
  },
  errorListContent: {
    padding: spacing.md,
  },
  noErrors: {
    textAlign: 'center',
    color: colors.textLight,
    padding: spacing.xl,
    fontSize: typography.fontSize.md,
  },
  errorItem: {
    backgroundColor: colors.backgroundLight,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.error,
  },
  errorTime: {
    fontSize: typography.fontSize.xs,
    color: colors.textLight,
    marginBottom: spacing.xs,
    fontWeight: typography.fontWeight.medium,
  },
  errorMessage: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.error,
    marginBottom: spacing.xs,
  },
  errorStackContainer: {
    marginTop: spacing.xs,
    maxHeight: 60,
  },
  errorStackText: {
    fontSize: typography.fontSize.xs,
    color: colors.textLight,
    fontFamily: 'monospace',
  },
  errorInfo: {
    fontSize: typography.fontSize.xs,
    color: colors.textLight,
    marginTop: spacing.xs,
    fontFamily: 'monospace',
  },
  modalFooter: {
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
    backgroundColor: colors.backgroundLight,
  },
  footerText: {
    fontSize: typography.fontSize.xs,
    color: colors.textLight,
    textAlign: 'center',
  },
  detailsContainer: {
    flex: 1,
    backgroundColor: colors.card,
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  detailsTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textDark,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  detailsScroll: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: borderRadius.md,
    padding: spacing.md,
    backgroundColor: colors.backgroundLight,
    marginBottom: spacing.md,
  },
  detailsText: {
    fontSize: typography.fontSize.sm,
    color: colors.textDark,
    fontFamily: 'monospace',
  },
  detailsCloseButton: {
    alignSelf: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  detailsCloseButtonText: {
    color: colors.white,
    fontWeight: typography.fontWeight.bold,
    fontSize: typography.fontSize.md,
  },
  detailsHint: {
    fontSize: typography.fontSize.xs,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
});

export default ErrorDisplay;
