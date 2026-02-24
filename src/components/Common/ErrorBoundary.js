import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../constants/theme';
import Button from './Button';
import { logError } from './ErrorDisplay';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    logError(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const error = this.state.error;
      const errorMessage = error?.message || String(error) || 'An unexpected error occurred';
      const errorStack = error?.stack || '';
      
      return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
          <Text style={styles.title}>⚠️ App Error</Text>
          <Text style={styles.errorLabel}>Error Message:</Text>
          <ScrollView style={styles.errorBox} nestedScrollEnabled>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </ScrollView>
          
          {errorStack && (
            <>
              <Text style={styles.errorLabel}>Stack Trace:</Text>
              <ScrollView style={styles.errorBox} nestedScrollEnabled>
                <Text style={styles.stackText}>{errorStack}</Text>
              </ScrollView>
            </>
          )}
          
          <Text style={styles.instructions}>
            📋 Please copy the error message above and share it.{'\n\n'}
            Or shake device → "Debug Remote JS" → Open chrome://inspect
          </Text>
          
          <Button
            title="Try Again"
            onPress={() => {
              this.setState({ hasError: false, error: null });
              if (this.props.navigation) {
                this.props.navigation.navigate('Home');
              }
            }}
            variant="primary"
            style={styles.button}
          />
        </ScrollView>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  title: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textDark,
    marginBottom: spacing.md,
  },
  errorLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.textDark,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  errorBox: {
    backgroundColor: colors.gray[100],
    borderRadius: borderRadius.md,
    padding: spacing.md,
    maxHeight: 200,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.error,
  },
  errorText: {
    fontSize: typography.fontSize.sm,
    color: colors.error,
    fontFamily: 'monospace',
  },
  stackText: {
    fontSize: typography.fontSize.xs,
    color: colors.textLight,
    fontFamily: 'monospace',
  },
  instructions: {
    fontSize: typography.fontSize.sm,
    color: colors.textLight,
    textAlign: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.backgroundLight,
    borderRadius: borderRadius.md,
  },
  button: {
    marginTop: spacing.md,
  },
});

export default ErrorBoundary;
