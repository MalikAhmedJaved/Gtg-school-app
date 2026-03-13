import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Alert, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useLanguage } from '../../contexts/LanguageContext';
import { colors, spacing, typography, borderRadius } from '../../constants/theme';
import Button from '../../components/Common/Button';
import Logo from '../../components/Common/Logo';
import api from '../../utils/api';
import { getApiErrorMessage } from '../../utils/errorMessage';

const ForgotPassword = () => {
  const { t } = useLanguage();
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim()) {
      Alert.alert('Error', t('auth.emailRequired', 'Please enter your email address.'));
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/forgot-password', {
        email: email.trim().toLowerCase(),
      });

      if (response.data?.success) {
        Alert.alert(
          t('auth.checkEmail', 'Check your email'),
          t('auth.resetLinkSent', 'If that email exists, a password reset link has been sent.'),
          [
            {
              text: t('common.ok', 'OK'),
              onPress: () => navigation.navigate('ResetPassword'),
            },
          ]
        );
      } else {
        Alert.alert('Error', response.data?.message || t('auth.genericError', 'Something went wrong. Please try again.'));
      }
    } catch (error) {
      Alert.alert('Error', getApiErrorMessage(error, t('auth.genericError', 'Something went wrong. Please try again.')));
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
        <Text style={styles.title}>{t('auth.forgotPassword', 'Forgot Password')}</Text>
        <Text style={styles.subtitle}>
          {t('auth.forgotPasswordHint', "Enter your email and we'll send you a password reset link.")}
        </Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t('auth.email', 'Email')}</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder={t('auth.email', 'Email')}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <Button
          title={loading ? t('common.loading', 'Sending...') : t('auth.sendResetLink', 'Send Reset Link')}
          onPress={handleSubmit}
          loading={loading}
          variant="primary"
          style={styles.submitButton}
        />

        <Text style={styles.linkText} onPress={() => navigation.navigate('ResetPassword')}>
          {t('auth.haveResetToken', 'Already have a reset token? Reset password')}
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

export default ForgotPassword;
