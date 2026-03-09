import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Alert, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useLanguage } from '../../contexts/LanguageContext';
import { colors, spacing, typography, borderRadius } from '../../constants/theme';
import Button from '../../components/Common/Button';
import Logo from '../../components/Common/Logo';
import api from '../../utils/api';

const ResetPassword = () => {
  const { t } = useLanguage();
  const navigation = useNavigation();
  const route = useRoute();

  const [token, setToken] = useState(route.params?.token || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!token.trim()) {
      Alert.alert('Error', t('auth.resetTokenRequired', 'Please enter reset token.'));
      return;
    }

    if (!password || password.length < 6) {
      Alert.alert('Error', t('auth.passwordMin', 'Password must be at least 6 characters long.'));
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', t('auth.passwordsDontMatch', 'Passwords do not match.'));
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/reset-password', {
        token: token.trim(),
        password,
      });

      if (response.data?.success) {
        Alert.alert(
          t('auth.passwordReset', 'Password Reset'),
          t('auth.passwordResetSuccess', 'Password reset successfully. You can now login.'),
          [{ text: t('common.ok', 'OK'), onPress: () => navigation.navigate('Login') }]
        );
      } else {
        Alert.alert('Error', response.data?.message || t('auth.genericError', 'Something went wrong. Please try again.'));
      }
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || t('auth.genericError', 'Something went wrong. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled"
        >
      <View style={styles.logoContainer}>
        <Logo width={110} height={110} />
      </View>

      <View style={styles.formContainer}>
        <Text style={styles.title}>{t('auth.resetPassword', 'Reset Password')}</Text>
        <Text style={styles.subtitle}>
          {t('auth.resetPasswordHint', 'Enter reset token and your new password.')}
        </Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t('auth.resetToken', 'Reset Token')}</Text>
          <TextInput
            style={styles.input}
            value={token}
            onChangeText={setToken}
            placeholder={t('auth.resetTokenPlaceholder', 'Paste reset token from email link')}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t('auth.newPassword', 'New Password')}</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder={t('auth.newPassword', 'New Password')}
            secureTextEntry
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t('auth.confirmNewPassword', 'Confirm New Password')}</Text>
          <TextInput
            style={styles.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder={t('auth.confirmNewPassword', 'Confirm New Password')}
            secureTextEntry
            autoCapitalize="none"
          />
        </View>

        <Button
          title={loading ? t('common.loading', 'Resetting...') : t('auth.resetPassword', 'Reset Password')}
          onPress={handleSubmit}
          loading={loading}
          variant="primary"
          style={styles.submitButton}
        />

        <Text style={styles.linkText} onPress={() => navigation.navigate('ForgotPassword')}>
          {t('auth.needResetLink', 'Need a reset link? Forgot Password')}
        </Text>

        <Text style={styles.linkText} onPress={() => navigation.navigate('Login')}>
          {t('auth.backToLogin', 'Back to Login')}
        </Text>
      </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.xl,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  formContainer: {
    backgroundColor: colors.white,
    padding: spacing.xl,
    borderRadius: borderRadius.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  title: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textDark,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textDark,
    marginBottom: spacing.xs,
  },
  input: {
    borderWidth: 2,
    borderColor: colors.gray[200],
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: typography.fontSize.md,
    color: colors.textDark,
    backgroundColor: colors.white,
  },
  submitButton: {
    marginTop: spacing.sm,
  },
  linkText: {
    marginTop: spacing.md,
    textAlign: 'center',
    color: colors.primary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
});

export default ResetPassword;
