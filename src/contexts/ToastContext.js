import React, { createContext, useContext, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { spacing, typography, borderRadius } from '../constants/theme';
import { useTheme } from './ThemeContext';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

const Toast = ({ message, type = 'info', onClose }) => {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [fadeAnim] = useState(new Animated.Value(0));

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        onClose();
      });
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return colors.success;
      case 'error':
        return colors.error;
      case 'warning':
        return colors.warning;
      default:
        return colors.info;
    }
  };

  return (
    <Animated.View
      style={[
        styles.toast,
        {
          backgroundColor: getBackgroundColor(),
          opacity: fadeAnim,
        },
      ]}
    >
      <Text style={styles.toastText}>{message}</Text>
      <TouchableOpacity onPress={onClose} style={styles.closeButton}>
        <Text style={styles.closeButtonText}>×</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <View style={containerStyles.toastContainer}>
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </View>
    </ToastContext.Provider>
  );
};

const containerStyles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    zIndex: 9999,
    alignItems: 'center',
    pointerEvents: 'box-none',
  },
});

const makeStyles = (colors) =>
  StyleSheet.create({
    toast: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.md,
      marginHorizontal: spacing.md,
      marginBottom: spacing.sm,
      minWidth: 200,
      maxWidth: '90%',
    },
    toastText: {
      color: colors.white,
      fontSize: typography.fontSize.md,
      fontWeight: typography.fontWeight.medium,
      flex: 1,
    },
    closeButton: {
      marginLeft: spacing.sm,
      padding: spacing.xs,
    },
    closeButtonText: {
      color: colors.white,
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.bold,
    },
  });
