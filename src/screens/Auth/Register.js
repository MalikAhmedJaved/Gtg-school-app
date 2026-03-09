import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Alert, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useLanguage } from '../../contexts/LanguageContext';
import { colors, spacing, typography, borderRadius } from '../../constants/theme';
import Button from '../../components/Common/Button';
import Logo from '../../components/Common/Logo';
import { Picker } from '@react-native-picker/picker';
import api from '../../utils/api';

const Register = () => {
  const { t } = useLanguage();
  const navigation = useNavigation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    city: '',
    zipCode: '',
    role: 'client',
    clientType: 'private',
    companyName: '',
    vatNumber: '',
  });
  const [loading, setLoading] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.email || !formData.password || !formData.phone || !formData.address) {
      Alert.alert('Error', t('admin.fillAllFields', 'Please fill in all required fields.'));
      return;
    }

    if (formData.role === 'client' && formData.clientType === 'company') {
      if (!formData.companyName || !formData.vatNumber) {
        Alert.alert('Error', t('auth.companyRequired', 'Company name and VAT number are required for company clients.'));
        return;
      }
    }

    setLoading(true);
    try {
      const registrationData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        address: formData.address,
        city: formData.city || undefined,
        zipCode: formData.zipCode || undefined,
        role: formData.role,
        ...(formData.role === 'client' && {
          clientType: formData.clientType,
          ...(formData.clientType === 'company' && {
            companyName: formData.companyName,
            vatNumber: formData.vatNumber,
          }),
        }),
      };

      const response = await api.post('/auth/register', registrationData);

      if (response.data.success) {
        setRegistrationSuccess(true);
      } else {
        Alert.alert('Error', response.data.message || t('auth.registerError', 'Registration failed.'));
      }
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          t('auth.registerError', 'Registration failed. Please try again.');
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (registrationSuccess) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
        >
          <View style={styles.logoContainer}>
            <Logo width={100} height={100} />
          </View>
          <View style={styles.successContainer}>
            <Text style={styles.successIcon}>✉️</Text>
            <Text style={styles.successTitle}>
              {t('auth.registrationSuccessTitle', 'Registration Successful!')}
            </Text>
            <Text style={styles.successMessage}>
              {t(
                'auth.verifyEmailSent',
                'We have sent a verification email to your inbox. Please check your email and click the verification link before logging in.'
              )}
            </Text>
            <Text style={styles.successEmail}>{formData.email}</Text>
            <Button
              title={t('auth.goToLogin', 'Go to Login')}
              onPress={() => navigation.navigate('Login')}
              variant="primary"
              style={styles.goToLoginButton}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator
          scrollEnabled
          nestedScrollEnabled
        >
          <View style={styles.logoContainer}>
            <Logo width={100} height={100} />
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.title}>{t('auth.register', 'Register')}</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t('auth.fullName', 'Full Name')} *</Text>
          <TextInput
            style={styles.input}
            value={formData.name}
            onChangeText={(value) => handleChange('name', value)}
            placeholder={t('auth.fullName', 'Full Name')}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t('auth.email', 'Email')} *</Text>
          <TextInput
            style={styles.input}
            value={formData.email}
            onChangeText={(value) => handleChange('email', value)}
            placeholder={t('auth.email', 'Email')}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t('auth.password', 'Password')} *</Text>
          <TextInput
            style={styles.input}
            value={formData.password}
            onChangeText={(value) => handleChange('password', value)}
            placeholder={t('auth.password', 'Password')}
            secureTextEntry
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t('auth.phone', 'Phone')} *</Text>
          <TextInput
            style={styles.input}
            value={formData.phone}
            onChangeText={(value) => handleChange('phone', value)}
            placeholder={t('auth.phone', 'Phone')}
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t('auth.address', 'Address')} *</Text>
          <TextInput
            style={styles.input}
            value={formData.address}
            onChangeText={(value) => handleChange('address', value)}
            placeholder={t('auth.address', 'Address')}
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.label}>{t('auth.city', 'City')}</Text>
            <TextInput
              style={styles.input}
              value={formData.city}
              onChangeText={(value) => handleChange('city', value)}
              placeholder={t('auth.city', 'City')}
            />
          </View>
          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.label}>{t('auth.zipCode', 'Zip Code')}</Text>
            <TextInput
              style={styles.input}
              value={formData.zipCode}
              onChangeText={(value) => handleChange('zipCode', value)}
              placeholder={t('auth.zipCode', 'Zip Code')}
            />
          </View>
        </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('auth.registerAs', 'Register as')} *</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.role}
                  onValueChange={(value) => handleChange('role', value)}
                  style={styles.picker}
                  mode="dropdown"
                >
                  <Picker.Item label={t('auth.client', 'Client')} value="client" />
                  <Picker.Item label={t('auth.cleaner', 'Cleaner')} value="cleaner" />
                </Picker>
              </View>
            </View>

            {formData.role === 'client' && (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>{t('auth.clientType', 'Client Type')} *</Text>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={formData.clientType}
                      onValueChange={(value) => handleChange('clientType', value)}
                      style={styles.picker}
                      mode="dropdown"
                    >
                      <Picker.Item label={t('auth.private', 'Private')} value="private" />
                      <Picker.Item label={t('auth.company', 'Company')} value="company" />
                    </Picker>
                  </View>
                </View>

                {formData.clientType === 'company' && (
                  <>
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>{t('auth.companyName', 'Company Name')} *</Text>
                      <TextInput
                        style={styles.input}
                        value={formData.companyName}
                        onChangeText={(value) => handleChange('companyName', value)}
                        placeholder={t('auth.companyName', 'Company Name')}
                      />
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>{t('auth.vatNumber', 'VAT Number')} *</Text>
                      <TextInput
                        style={styles.input}
                        value={formData.vatNumber}
                        onChangeText={(value) => handleChange('vatNumber', value)}
                        placeholder={t('auth.vatNumber', 'VAT Number')}
                      />
                    </View>
                  </>
                )}
              </>
            )}

            <Button
              title={loading ? t('common.loading', 'Loading...') : t('auth.register', 'Register')}
              onPress={handleSubmit}
              loading={loading}
              variant="primary"
              style={styles.submitButton}
            />

            <View style={styles.loginLink}>
              <Text style={styles.loginText}>
                {t('auth.alreadyHaveAccount', 'Already have an account?')}{' '}
              </Text>
              <Text
                style={styles.loginLinkText}
                onPress={() => navigation.navigate('Login')}
              >
                {t('auth.login', 'Login')}
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
  keyboardContainer: {
    flex: 1,
    minHeight: 0,
  },
  scrollView: {
    flex: 1,
    minHeight: 0,
  },
  contentContainer: {
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  formContainer: {
    backgroundColor: colors.white,
    padding: spacing.xl,
    borderRadius: borderRadius.lg,
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  halfWidth: {
    flex: 1,
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
  pickerContainer: {
    borderWidth: 2,
    borderColor: colors.gray[200],
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  submitButton: {
    marginTop: spacing.md,
  },
  loginLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.lg,
  },
  loginText: {
    fontSize: typography.fontSize.sm,
    color: colors.text,
  },
  loginLinkText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontWeight: typography.fontWeight.semibold,
  },
  successContainer: {
    backgroundColor: colors.white,
    padding: spacing.xl,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  successIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  successTitle: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.success || '#16a34a',
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  successMessage: {
    fontSize: typography.fontSize.md,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  successEmail: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.textDark,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  goToLoginButton: {
    width: '100%',
  },
});

export default Register;
