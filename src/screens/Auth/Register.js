import React, { useState } from 'react';
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
import { colors, spacing, typography, borderRadius } from '../../constants/theme';
import Button from '../../components/Common/Button';

const logoImage = require('../../../assets/gtg_logo.png');

const ROLES = [
  { key: 'parent', label: 'Parent', icon: 'people-outline' },
  { key: 'employee', label: 'Employee', icon: 'briefcase-outline' },
];

const Register = ({ navigation }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'parent',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (field, value) => {
    if (error) setError('');
    setFormData({ ...formData, [field]: value });
  };

  const validate = () => {
    const { name, email, password, confirmPassword } = formData;
    if (!name.trim()) return 'Please enter your full name.';
    if (!email.trim()) return 'Please enter your email.';
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return 'Please enter a valid email.';
    if (!password || password.length < 6) return 'Password must be at least 6 characters.';
    if (password !== confirmPassword) return 'Passwords do not match.';
    return '';
  };

  const handleSubmit = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      Alert.alert(
        'Account created',
        `Your ${formData.role === 'parent' ? 'parent' : 'employee'} account has been registered. Please sign in to continue.`,
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Login'),
          },
        ]
      );
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
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
            <View style={styles.logoWrap}>
              <Image source={logoImage} style={styles.logo} resizeMode="contain" />
            </View>

            <View style={styles.formContainer}>
              <Text style={styles.heading}>Create account</Text>
              <Text style={styles.subheading}>Register to get started</Text>

              <View style={styles.roleRow}>
                {ROLES.map((role) => {
                  const active = formData.role === role.key;
                  return (
                    <TouchableOpacity
                      key={role.key}
                      style={[styles.roleChip, active && styles.roleChipActive]}
                      onPress={() => handleChange('role', role.key)}
                      activeOpacity={0.85}
                    >
                      <Ionicons
                        name={role.icon}
                        size={18}
                        color={active ? colors.white : colors.primary}
                      />
                      <Text style={[styles.roleChipText, active && styles.roleChipTextActive]}>
                        {role.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Full Name</Text>
                <TextInput
                  style={styles.input}
                  value={formData.name}
                  onChangeText={(v) => handleChange('name', v)}
                  placeholder="Enter your full name"
                  placeholderTextColor={colors.gray[400]}
                  autoCapitalize="words"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  value={formData.email}
                  onChangeText={(v) => handleChange('email', v)}
                  placeholder="you@example.com"
                  placeholderTextColor={colors.gray[400]}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Phone (optional)</Text>
                <TextInput
                  style={styles.input}
                  value={formData.phone}
                  onChangeText={(v) => handleChange('phone', v)}
                  placeholder="+1 555 000 0000"
                  placeholderTextColor={colors.gray[400]}
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password</Text>
                <TextInput
                  style={styles.input}
                  value={formData.password}
                  onChangeText={(v) => handleChange('password', v)}
                  placeholder="At least 6 characters"
                  placeholderTextColor={colors.gray[400]}
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Confirm Password</Text>
                <TextInput
                  style={styles.input}
                  value={formData.confirmPassword}
                  onChangeText={(v) => handleChange('confirmPassword', v)}
                  placeholder="Re-enter your password"
                  placeholderTextColor={colors.gray[400]}
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>

              <Button
                title={loading ? 'Creating account...' : 'Register'}
                onPress={handleSubmit}
                loading={loading}
                variant="primary"
                style={styles.submitButton}
              />

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <TouchableOpacity
                style={styles.signInRow}
                onPress={() => navigation.navigate('Login')}
                activeOpacity={0.7}
              >
                <Text style={styles.signInMuted}>Already have an account? </Text>
                <Text style={styles.signInLink}>Sign in</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.bottomSpacer} />
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: colors.white,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: Platform.OS === 'android' ? spacing.sm + 20 : spacing.xs,
    paddingBottom: spacing.md,
  },
  logoWrap: {
    alignItems: 'center',
    marginTop: 0,
    marginBottom: spacing.xs,
  },
  logo: {
    width: 150,
    height: 150,
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
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  roleRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  roleChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  roleChipActive: {
    backgroundColor: colors.primary,
  },
  roleChipText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
  },
  roleChipTextActive: {
    color: colors.white,
  },
  inputGroup: {},
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textDark,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.white,
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
  signInRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  signInMuted: {
    color: colors.gray[600],
    fontSize: typography.fontSize.sm,
  },
  signInLink: {
    color: colors.primary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
  },
  bottomSpacer: {
    height: spacing.md,
  },
});

export default Register;
