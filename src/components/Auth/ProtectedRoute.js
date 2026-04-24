import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { spacing, typography } from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { isAuthenticated, userRole, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Please log in to access this page.</Text>
      </View>
    );
  }

  if (requiredRole && userRole !== requiredRole) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          You don't have permission to access this page.
        </Text>
      </View>
    );
  }

  return children;
};

const makeStyles = (colors) =>
  StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.fontSize.md,
    color: colors.text,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.xl,
  },
  errorText: {
    fontSize: typography.fontSize.lg,
    color: colors.error,
    textAlign: 'center',
  },
});

export default ProtectedRoute;
