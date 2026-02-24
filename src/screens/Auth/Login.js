import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { colors, spacing, typography, borderRadius } from '../../constants/theme';
import Button from '../../components/Common/Button';
import Logo from '../../components/Common/Logo';
// NOTE: Demo-only hardcoded credentials for showcasing dashboards
const DEMO_USERS = [
  {
    id: 'demo-admin',
    role: 'admin',
    email: 'admin@rentplus.com',
    password: 'Admin123!',
    name: 'Demo Admin',
  },
  {
    id: 'demo-client',
    role: 'client',
    email: 'client@rentplus.com',
    password: 'Client123!',
    name: 'Demo Client',
  },
  {
    id: 'demo-cleaner',
    role: 'cleaner',
    email: 'cleaner@rentplus.com',
    password: 'Cleaner123!',
    name: 'Demo Cleaner',
  },
];

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

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async () => {
    if (!formData.email || !formData.password) {
      Alert.alert('Error', t('auth.emailRequired', 'Please enter email and password.'));
      return;
    }

    setLoading(true);
    try {
      // Local demo-only auth: match against hardcoded users (works in dev and APK)
      const email = (formData.email || '').trim().toLowerCase();
      const password = (formData.password || '').trim();
      const user = DEMO_USERS.find(
        (u) => u.email.toLowerCase() === email && u.password === password
      );

      if (!user) {
        Alert.alert(
          'Error',
          t(
            'auth.loginError',
            'Invalid email or password. Use one of the provided demo accounts.'
          )
        );
        return;
      }

      // Fake token for demo
      const token = 'demo-token';
      await login(user, token);

      showToast(t('auth.loginSuccess', 'Login successful!'), 'success');

      // Navigate to appropriate dashboard after auth state is committed
      // (avoids race where ProtectedRoute mounts before context updates, especially in release/APK)
      const dashboardRoute =
        user.role === 'admin'
          ? 'AdminDashboard'
          : user.role === 'cleaner'
          ? 'CleanerDashboard'
          : 'ClientDashboard';
      setTimeout(() => {
        navigation.replace(dashboardRoute);
      }, 150);
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert(
        'Error',
        t('auth.loginError', 'Login failed. Please try again.')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
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

        <View style={styles.demoHint}>
          <Text style={styles.demoHintTitle}>Demo logins (for testing)</Text>
          <Text style={styles.demoHintText}>Admin: admin@rentplus.com / Admin123!</Text>
          <Text style={styles.demoHintText}>Client: client@rentplus.com / Client123!</Text>
          <Text style={styles.demoHintText}>Cleaner: cleaner@rentplus.com / Cleaner123!</Text>
        </View>
      </View>
    </ScrollView>
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
  demoHint: {
    marginTop: spacing.xl,
    padding: spacing.md,
    backgroundColor: colors.backgroundLight,
    borderRadius: borderRadius.md,
  },
  demoHintTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.textDark,
    marginBottom: spacing.xs,
  },
  demoHintText: {
    fontSize: typography.fontSize.xs,
    color: colors.text,
    marginBottom: 2,
  },
});

export default Login;
