import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Alert, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { colors, spacing, typography, borderRadius } from '../../constants/theme';
import Button from '../../components/Common/Button';
import Logo from '../../components/Common/Logo';
import api from '../../utils/api';
import { navigate as rootNavigate } from '../../utils/rootNavigation';
import { getApiErrorMessage } from '../../utils/errorMessage';

const Login = () => {
  const { t } = useLanguage();
  const navigation = useNavigation();
  const { login } = useAuth();
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [showResendVerification, setShowResendVerification] = useState(false);
  const [resendEmail, setResendEmail] = useState('');
  const [resending, setResending] = useState(false);
  const [loginError, setLoginError] = useState('');

  const handleChange = (field, value) => {
    if (loginError) setLoginError('');
    setFormData({ ...formData, [field]: value });
  };

  const handleResendVerification = async () => {
    if (!resendEmail) return;
    setResending(true);
    try {
      const response = await api.post('/auth/resend-verification', { email: resendEmail });
      if (response.data.success) {
        Alert.alert(
          t('auth.verificationSent', 'Verification Sent'),
          t('auth.verificationSentMsg', 'A new verification email has been sent. Please check your inbox.')
        );
        setShowResendVerification(false);
      }
    } catch (error) {
      const message = getApiErrorMessage(error, t('auth.resendFailed', 'Failed to resend verification email.'));
      Alert.alert('Error', message);
    } finally {
      setResending(false);
    }
  };

  const handleSubmit = async () => {
    setLoginError('');
    if (!formData.email || !formData.password) {
      Alert.alert('Error', t('auth.emailRequired', 'Please enter email and password.'));
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/login', {
        email: formData.email.trim().toLowerCase(),
        password: formData.password.trim(),
      });

      if (response.data.success) {
        const { user, token } = response.data.data;
        await login(user, token);

        showToast(t('auth.loginSuccess', 'Login successful!'), 'success');

        // Open Menu screen after login so users see menu items first.
        setTimeout(() => {
          rootNavigate('MenuTab', { screen: 'MenuScreen' });
        }, 150);
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorCode = error.response?.data?.code;
      const errorMessage = getApiErrorMessage(error, '');
      const statusCode = error.response?.status;

      if (errorCode === 'EMAIL_NOT_VERIFIED' || statusCode === 403 || /verify|verification/i.test(errorMessage || '')) {
        // Show resend verification option
        setResendEmail(formData.email.trim().toLowerCase());
        setShowResendVerification(true);
        setLoginError(
          t('auth.emailNotVerifiedMsg', 'Please verify your email address before logging in. Check your inbox or use the resend option below.')
        );
      } else {
        const isInvalidCredentials =
          statusCode === 401 ||
          errorCode === 'INVALID_CREDENTIALS' ||
          /invalid|incorrect|password|credentials|unauthorized/i.test(errorMessage || '');

        const inlineMessage = isInvalidCredentials
          ? t('auth.invalidCredentials', 'Password is not correct. Please try again.')
          : (errorMessage || t('auth.loginError', 'Login failed. Please check your credentials and try again.'));

        setLoginError(inlineMessage);
      }
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
        <Logo width={120} height={120} />
      </View>

      <View style={styles.formContainer}>
        <Text style={styles.title}>{t('auth.login', 'Login')}</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t('auth.email', 'Email')}</Text>
          <TextInput
            style={styles.input}
            value={formData.email}
            onChangeText={(value) => handleChange('email', value)}
            placeholder={t('auth.email', 'Email')}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t('auth.password', 'Password')}</Text>
          <TextInput
            style={styles.input}
            value={formData.password}
            onChangeText={(value) => handleChange('password', value)}
            placeholder={t('auth.password', 'Password')}
            secureTextEntry
            autoCapitalize="none"
          />
        </View>

        <Button
          title={loading ? t('common.loading', 'Loading...') : t('auth.login', 'Login')}
          onPress={handleSubmit}
          loading={loading}
          variant="primary"
          style={styles.submitButton}
        />

        {loginError ? <Text style={styles.errorText}>{loginError}</Text> : null}

        <Text
          style={styles.forgotLinkText}
          onPress={() => navigation.navigate('ForgotPassword')}
        >
          {t('auth.forgotPassword', 'Forgot Password?')}
        </Text>

        {showResendVerification && (
          <View style={styles.resendContainer}>
            <Text style={styles.resendText}>
              {t('auth.emailNotVerifiedHint', 'Your email is not verified yet.')}
            </Text>
            <Button
              title={resending ? t('common.loading', 'Sending...') : t('auth.resendVerification', 'Resend Verification Email')}
              onPress={handleResendVerification}
              loading={resending}
              variant="secondary"
              style={styles.resendButton}
            />
          </View>
        )}

        <View style={styles.registerLink}>
          <Text style={styles.registerText}>
            {t('auth.dontHaveAccount', 'Don\'t have an account?')}{' '}
          </Text>
          <Text
            style={styles.registerLinkText}
            onPress={() => navigation.navigate('Register')}
          >
            {t('auth.register', 'Register here')}
          </Text>
        </View>
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
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textDark,
    textAlign: 'center',
    marginBottom: spacing.xl,
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
    marginTop: spacing.md,
  },
  errorText: {
    marginTop: spacing.sm,
    fontSize: typography.fontSize.sm,
    color: colors.error,
    textAlign: 'center',
    fontWeight: typography.fontWeight.semibold,
  },
  forgotLinkText: {
    marginTop: spacing.md,
    textAlign: 'center',
    color: colors.primary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  registerLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.lg,
  },
  registerText: {
    fontSize: typography.fontSize.sm,
    color: colors.text,
  },
  registerLinkText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontWeight: typography.fontWeight.semibold,
  },
  resendContainer: {
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: '#FFF3CD',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: '#FFEAA7',
  },
  resendText: {
    fontSize: typography.fontSize.sm,
    color: '#856404',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  resendButton: {
    marginTop: spacing.xs,
  },
});

export default Login;
