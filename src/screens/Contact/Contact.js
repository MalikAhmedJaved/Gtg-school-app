import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Alert, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { useLanguage } from '../../contexts/LanguageContext';
import { colors, spacing, typography, borderRadius } from '../../constants/theme';
import Button from '../../components/Common/Button';
import { Picker } from '@react-native-picker/picker';
import api from '../../utils/api';

const Contact = () => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.email || !formData.message) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/contact', formData);
      Alert.alert('Success', t('contact.messageSent', 'Thank you! Your message has been sent successfully.'));
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (error) {
      Alert.alert('Error', t('contact.messageError', 'Error sending message. Please try again.'));
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
        <Text style={styles.title}>{t('contact.title', 'Contact Us')}</Text>
        <Text style={styles.subtitle}>{t('contact.subtitle', 'Get in touch with us today')}</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.contactInfo}>
          <View style={styles.contactItem}>
            <Text style={styles.contactIcon}>📞</Text>
            <View>
              <Text style={styles.contactLabel}>{t('contact.phone', 'Phone')}</Text>
              <Text style={styles.contactValue}>+45 29 82 54 21</Text>
            </View>
          </View>

          <View style={styles.contactItem}>
            <Text style={styles.contactIcon}>✉️</Text>
            <View>
              <Text style={styles.contactLabel}>{t('contact.email', 'Email')}</Text>
              <Text style={styles.contactValue}>info@rentplus.dk</Text>
            </View>
          </View>

          <View style={styles.contactItem}>
            <Text style={styles.contactIcon}>📍</Text>
            <View>
              <Text style={styles.contactLabel}>{t('contact.address', 'Address')}</Text>
              <Text style={styles.contactValue}>Vester Fælledvej 19</Text>
              <Text style={styles.contactValue}>9000 Aalborg, Denmark</Text>
            </View>
          </View>
        </View>

        <View style={styles.form}>
          <Text style={styles.formTitle}>{t('contact.sendMessage', 'Send us a Message')}</Text>

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
            <Text style={styles.label}>{t('auth.phone', 'Phone')}</Text>
            <TextInput
              style={styles.input}
              value={formData.phone}
              onChangeText={(value) => handleChange('phone', value)}
              placeholder={t('auth.phone', 'Phone')}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('contact.subject', 'Subject')}</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.subject}
                onValueChange={(value) => handleChange('subject', value)}
                style={styles.picker}
                mode="dropdown"
              >
                <Picker.Item label={t('contact.selectSubject', 'Select a subject...')} value="" />
                <Picker.Item label={t('contact.requestQuote', 'Request a Quote')} value="quote" />
                <Picker.Item label={t('contact.serviceInquiry', 'Service Inquiry')} value="inquiry" />
                <Picker.Item label={t('contact.complaint', 'Complaint')} value="complaint" />
                <Picker.Item label={t('contact.other', 'Other')} value="other" />
              </Picker>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('contact.message', 'Message')} *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.message}
              onChangeText={(value) => handleChange('message', value)}
              placeholder={t('contact.message', 'Message')}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
          </View>

          <Button
            title={t('contact.sendMessageButton', 'Send Message')}
            onPress={handleSubmit}
            loading={loading}
            variant="primary"
          />
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
  contactInfo: {
    marginBottom: spacing.xl,
  },
  contactItem: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  contactIcon: {
    fontSize: 32,
    marginRight: spacing.md,
  },
  contactLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textLight,
    marginBottom: spacing.xs,
  },
  contactValue: {
    fontSize: typography.fontSize.md,
    color: colors.textDark,
  },
  form: {
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
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
    height: 120,
    textAlignVertical: 'top',
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
});

export default Contact;
