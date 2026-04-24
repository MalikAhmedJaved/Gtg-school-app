import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Image,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Keyboard,
  StatusBar,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../contexts/LanguageContext';
import { spacing, typography, borderRadius } from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';
import Button from '../../components/Common/Button';

const logoImage = require('../../../assets/gtg_logo.png');

const ForgotPassword = ({ navigation }) => {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');
    if (!email.trim()) {
      setError('Please enter your email.');
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError('Please enter a valid email.');
      return;
    }

    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      Alert.alert(
        t('app.auth.resetSent', 'Reset link sent'),
        t(
          'app.auth.resetSentMessage',
          'If that email is registered, you will receive a password reset link shortly.'
        ),
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );
    } catch (err) {
      setError(err.message || 'Request failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.wrapper}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <TouchableOpacity
              style={styles.backRow}
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-back" size={22} color={colors.primary} />
              <Text style={styles.backText}>{t('app.auth.backToLogin', 'Back to Sign in')}</Text>
            </TouchableOpacity>

            <View style={styles.logoWrap}>
              <Image source={logoImage} style={styles.logo} resizeMode="contain" />
            </View>

            <View style={styles.formContainer}>
              <Text style={styles.heading}>
                {t('app.auth.resetTitle', 'Reset your password')}
              </Text>
              <Text style={styles.subheading}>
                {t(
                  'app.auth.resetSubtitle',
                  'Enter your email and we will send you a reset link'
                )}
              </Text>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t('app.auth.email', 'Email')}</Text>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={(v) => {
                    if (error) setError('');
                    setEmail(v);
                  }}
                  placeholder="you@example.com"
                  placeholderTextColor={colors.gray[400]}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <Button
                title={
                  loading
                    ? t('app.auth.sending', 'Sending...')
                    : t('app.auth.sendResetLink', 'Send reset link')
                }
                onPress={handleSubmit}
                loading={loading}
                variant="primary"
                style={styles.submitButton}
              />

              {error ? <Text style={styles.errorText}>{error}</Text> : null}
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </View>
  );
};

const makeStyles = (colors) =>
  StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: colors.card,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: Platform.OS === 'android' ? spacing.xl + 20 : spacing.xl,
    paddingBottom: spacing.xl,
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  backText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontWeight: typography.fontWeight.semibold,
  },
  logoWrap: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  logo: {
    width: 130,
    height: 130,
  },
  formContainer: {
    gap: spacing.sm,
  },
  heading: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textDark,
    textAlign: 'center',
  },
  subheading: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[600],
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  inputGroup: {},
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textDark,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    fontSize: typography.fontSize.md,
    color: colors.textDark,
    borderWidth: 1,
    borderColor: colors.gray[300],
  },
  submitButton: {
    marginTop: spacing.sm,
    borderRadius: borderRadius.lg,
  },
  errorText: {
    fontSize: typography.fontSize.sm,
    color: colors.error,
    textAlign: 'center',
    fontWeight: typography.fontWeight.semibold,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    marginTop: spacing.sm,
  },
});

export default ForgotPassword;
