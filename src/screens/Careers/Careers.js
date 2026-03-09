import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Alert, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { useLanguage } from '../../contexts/LanguageContext';
import { colors, spacing, typography, borderRadius } from '../../constants/theme';
import Button from '../../components/Common/Button';
import api from '../../utils/api';
// Document picker removed - can be added later if needed

const Careers = () => {
  const { t } = useLanguage();
  const [showApplication, setShowApplication] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zipCode: '',
    experience: '',
    description: '',
    cv: null,
  });
  const [loading, setLoading] = useState(false);

  const requirements = [
    t('careers.reliablePunctual', 'Reliable and punctual'),
    t('careers.attentionToDetail', 'Attention to detail'),
    t('careers.goodPhysicalCondition', 'Good physical condition'),
    t('careers.professionalAttitude', 'Professional attitude'),
    t('careers.workIndependently', 'Ability to work independently'),
    t('careers.validWorkPermit', 'Valid work permit (if applicable)'),
  ];

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handlePickDocument = async () => {
    // Document picker functionality - can be implemented later
    // For now, just show a message
    Alert.alert('Info', 'Document picker will be available in a future update. You can mention your CV in the description field for now.');
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.email || !formData.phone || !formData.address || formData.experience === '') {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/jobseekers', {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        zipCode: formData.zipCode.trim(),
        experience: parseInt(formData.experience, 10) || 0,
        description: formData.description.trim(),
      });

      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Failed to submit application');
      }

      Alert.alert('Success', 'Application submitted successfully!');
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        zipCode: '',
        experience: '',
        description: '',
        cv: null,
      });
      setShowApplication(false);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || error.message || 'Failed to submit application');
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
        <ScrollView style={{ flex: 1 }} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <Text style={styles.title}>{t('careers.joinOurTeam', 'Join Our Team')}</Text>
        <Text style={styles.subtitle}>{t('careers.buildYourCareer', 'Build your career with us')}</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t('careers.whatWeLookingFor', 'What We\'re Looking For')}
          </Text>
          {requirements.map((req, index) => (
            <View key={index} style={styles.requirementItem}>
              <Text style={styles.checkIcon}>✓</Text>
              <Text style={styles.requirementText}>{req}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t('careers.readyToApply', 'Ready to Apply?')}
          </Text>
          <Text style={styles.sectionText}>
            {t('careers.fillApplicationForm', 'Fill out the application form below and we\'ll get back to you soon.')}
          </Text>
          <Button
            title={showApplication ? t('careers.hideApplicationForm', 'Hide Application Form') : t('careers.showApplicationForm', 'Show Application Form')}
            onPress={() => setShowApplication(!showApplication)}
            variant="primary"
            style={styles.toggleButton}
          />
        </View>

        {showApplication && (
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>{t('careers.titlejob', 'Apply for a job')}</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('careers.fullName', 'Name')} *</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(value) => handleChange('name', value)}
                placeholder={t('careers.fullName', 'Name')}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('careers.email', 'E-mail')} *</Text>
              <TextInput
                style={styles.input}
                value={formData.email}
                onChangeText={(value) => handleChange('email', value)}
                placeholder={t('careers.email', 'E-mail')}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('careers.phone', 'Phone nr')} *</Text>
              <TextInput
                style={styles.input}
                value={formData.phone}
                onChangeText={(value) => handleChange('phone', value)}
                placeholder={t('careers.phone', 'Phone nr')}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('careers.address', 'Address')} *</Text>
              <TextInput
                style={styles.input}
                value={formData.address}
                onChangeText={(value) => handleChange('address', value)}
                placeholder={t('careers.address', 'Address')}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('auth.city', 'City')}</Text>
              <TextInput
                style={styles.input}
                value={formData.city}
                onChangeText={(value) => handleChange('city', value)}
                placeholder={t('auth.city', 'City')}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('auth.zipCode', 'Zip Code')}</Text>
              <TextInput
                style={styles.input}
                value={formData.zipCode}
                onChangeText={(value) => handleChange('zipCode', value)}
                placeholder={t('auth.zipCode', 'Zip Code')}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('careers.experience', 'Experience')} *</Text>
              <TextInput
                style={styles.input}
                value={formData.experience}
                onChangeText={(value) => handleChange('experience', value)}
                placeholder={t('careers.experience', 'Experience')}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('careers.description', 'Description')}</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.description}
                onChangeText={(value) => handleChange('description', value)}
                placeholder={t('careers.description', 'Description')}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.inputGroup}>
              <Button
                title={formData.cv ? t('careers.cv', 'Upload cv') + ': ' + formData.cv.name : t('careers.cv', 'Upload cv')}
                onPress={handlePickDocument}
                variant="outline"
              />
            </View>

            <View style={styles.buttonContainer}>
              <Button
                title={t('careers.submit', 'Submit')}
                onPress={handleSubmit}
                loading={loading}
                variant="primary"
                style={styles.submitButton}
              />
              <Button
                title={t('careers.cancel', 'Cancel')}
                onPress={() => setShowApplication(false)}
                variant="secondary"
              />
            </View>
          </View>
        )}
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
  header: {
    backgroundColor: colors.primary,
    padding: spacing.xl,
  },
  title: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.fontSize.lg,
    color: colors.white,
    opacity: 0.9,
  },
  content: {
    padding: spacing.xl,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textDark,
    marginBottom: spacing.md,
  },
  sectionText: {
    fontSize: typography.fontSize.md,
    color: colors.text,
    marginBottom: spacing.md,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  checkIcon: {
    fontSize: 20,
    color: colors.secondary,
    marginRight: spacing.md,
    fontWeight: typography.fontWeight.bold,
  },
  requirementText: {
    flex: 1,
    fontSize: typography.fontSize.md,
    color: colors.text,
  },
  toggleButton: {
    marginTop: spacing.md,
  },
  formContainer: {
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    marginTop: spacing.md,
  },
  formTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textDark,
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
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  submitButton: {
    flex: 1,
  },
});

export default Careers;
