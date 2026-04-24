import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TextInput, Image, KeyboardAvoidingView, Platform, TouchableOpacity, StatusBar, useWindowDimensions } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { spacing, typography, borderRadius } from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';
import Button from '../../components/Common/Button';

const bgImage = require('../../../assets/background.png');

// Background image natural aspect ratio (1080x1920 = 9:16)
const IMG_ASPECT = 1080 / 1920;

// The login screen sits on a fixed light-blue background image regardless of
// theme, so text colors here must stay dark — they don't follow dark mode.
const LIGHT_BG_TEXT = '#1A252F';
const LIGHT_BG_TEXT_MUTED = '#7F8C8D';

const Login = ({ navigation }) => {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { login } = useAuth();
  const { t } = useLanguage();
  const { width: screenW, height: screenH } = useWindowDimensions();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  const handleChange = (field, value) => {
    if (loginError) setLoginError('');
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async () => {
    setLoginError('');
    if (!formData.email || !formData.password) {
      setLoginError('Please enter email and password.');
      return;
    }

    setLoading(true);
    try {
      await login(formData.email.trim().toLowerCase(), formData.password.trim());
    } catch (error) {
      setLoginError(error.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Scale image to cover the full screen, anchored top-left
  const coverW = Math.max(screenW, screenH * IMG_ASPECT);
  const coverH = Math.max(screenH, screenW / IMG_ASPECT);
  // Shift 15% toward center so bottom text stays centered while logo isn't cut
  const offsetX = -(coverW - screenW) * 0.15;

  return (
    <View style={styles.wrapper}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
      <Image
        source={bgImage}
        style={{ position: 'absolute', top: 0, left: offsetX, width: coverW, height: coverH }}
        resizeMode="stretch"
      />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.container}>
          <View style={styles.spacer} />
          <View style={styles.formContainer}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t('app.auth.email', 'Email')}</Text>
                <TextInput
                  style={styles.input}
                  value={formData.email}
                  onChangeText={(value) => handleChange('email', value)}
                  placeholder={t('app.auth.email', 'Email')}
                  placeholderTextColor={LIGHT_BG_TEXT_MUTED}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t('app.auth.password', 'Password')}</Text>
                <TextInput
                  style={styles.input}
                  value={formData.password}
                  onChangeText={(value) => handleChange('password', value)}
                  placeholder={t('app.auth.password', 'Password')}
                  placeholderTextColor={LIGHT_BG_TEXT_MUTED}
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>

              <Button
                title={
                  loading
                    ? t('app.auth.signingIn', 'Signing in...')
                    : t('app.auth.signIn', 'Sign In')
                }
                onPress={handleSubmit}
                loading={loading}
                variant="primary"
                style={styles.submitButton}
              />

              {loginError ? <Text style={styles.errorText}>{loginError}</Text> : null}

              <TouchableOpacity
                style={styles.forgotRow}
                onPress={() => navigation.navigate('ForgotPassword')}
                activeOpacity={0.7}
              >
                <Text style={styles.forgotLink}>
                  {t('app.auth.forgotPassword', 'Forgot password?')}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.bottomSpacer}>
              <TouchableOpacity
                style={styles.signUpRow}
                onPress={() => navigation.navigate('Register')}
                activeOpacity={0.7}
              >
                <Text style={styles.signUpMuted}>
                  {t('app.auth.dontHaveAccount', "Don't have an account?")}{' '}
                </Text>
                <Text style={styles.signUpLink}>{t('app.auth.signUp', 'Sign up')}</Text>
              </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const makeStyles = (colors) =>
  StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#d4eaf7',
    overflow: 'hidden',
  },
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: spacing.xl,
  },
  spacer: {
    flex: 6,
  },
  formContainer: {
    flex: 4,
    justifyContent: 'center',
    gap: spacing.md,
  },
  bottomSpacer: {
    flex: 2,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: spacing.lg,
  },
  inputGroup: {
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: LIGHT_BG_TEXT,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    fontSize: typography.fontSize.md,
    color: LIGHT_BG_TEXT,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
  submitButton: {
    marginTop: spacing.xs,
    borderRadius: borderRadius.lg,
  },
  errorText: {
    fontSize: typography.fontSize.sm,
    color: colors.error,
    textAlign: 'center',
    fontWeight: typography.fontWeight.semibold,
    backgroundColor: 'rgba(255,255,255,0.8)',
    padding: spacing.sm,
    borderRadius: borderRadius.md,
  },
  forgotRow: {
    alignItems: 'center',
    marginTop: -spacing.sm,
    paddingVertical: spacing.xs,
  },
  forgotLink: {
    color: colors.primary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
  },
  signUpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  signUpMuted: {
    color: LIGHT_BG_TEXT,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  signUpLink: {
    color: colors.primary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
  },
});

export default Login;
