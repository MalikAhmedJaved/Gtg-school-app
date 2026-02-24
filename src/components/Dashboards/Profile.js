import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
} from 'react-native';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { colors, spacing, typography, borderRadius } from '../../constants/theme';
import Button from '../Common/Button';
import * as ImagePicker from 'expo-image-picker';

const Profile = ({ userRole }) => {
  const { t } = useLanguage();
  const { userData } = useAuth();
  const [formData, setFormData] = useState({
    name: userData?.name || '',
    email: userData?.email || '',
    phone: userData?.phone || '',
    address: userData?.address || '',
    password: '',
    confirmPassword: '',
    clientType: userData?.clientType || 'private',
    companyName: userData?.companyName || '',
    vatNumber: userData?.vatNumber || '',
    experience: userData?.experience || 0,
    hourlyPrice: userData?.hourlyPrice || '',
    currency: userData?.currency || 'USD',
  });
  const [userPhoto, setUserPhoto] = useState(userData?.photo || null);
  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handlePhotoPick = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission', 'Permission to access camera roll is required!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setUserPhoto(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleRemovePhoto = () => {
    setUserPhoto(null);
  };

  const handleSubmit = async () => {
    if (formData.password && formData.password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      // In a real app, this would call the API
      Alert.alert('Success', 'Profile updated successfully!');
      setFormData({ ...formData, password: '', confirmPassword: '' });
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Fixed top: visible without scroll — header + photo + name + email + phone */}
      <View style={styles.header}>
        <Text style={styles.title}>{t('profile.myProfile', 'My Profile')}</Text>
        <Text style={styles.subtitle}>
          {t('profile.manageAccount', 'Manage your account information')}
        </Text>
      </View>

      <View style={styles.summaryCard}>
        <View style={styles.photoSection}>
          <TouchableOpacity onPress={handlePhotoPick} style={styles.photoPreview}>
            {userPhoto ? (
              <Image source={{ uri: userPhoto }} style={styles.photo} />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Text style={styles.photoIcon}>📷</Text>
                <Text style={styles.photoText}>{t('profile.noPhoto', 'No Photo')}</Text>
              </View>
            )}
          </TouchableOpacity>
          <View style={styles.photoActions}>
            <Button
              title={userPhoto ? t('profile.changePhoto', 'Change Photo') : t('profile.uploadPhoto', 'Upload Photo')}
              onPress={handlePhotoPick}
              variant="secondary"
              style={styles.photoButton}
            />
            {userPhoto && (
              <Button
                title={t('profile.removePhoto', 'Remove Photo')}
                onPress={handleRemovePhoto}
                variant="danger"
                style={styles.photoButton}
              />
            )}
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>{t('auth.fullName', 'Full Name')} *</Text>
          <TextInput
            style={styles.input}
            value={formData.name}
            onChangeText={(value) => handleChange('name', value)}
            placeholder="Enter your full name"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>{t('auth.email', 'Email')} *</Text>
          <TextInput
            style={styles.input}
            value={formData.email}
            onChangeText={(value) => handleChange('email', value)}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>{t('auth.phone', 'Phone')} *</Text>
          <TextInput
            style={styles.input}
            value={formData.phone}
            onChangeText={(value) => handleChange('phone', value)}
            placeholder="Enter your phone number"
            keyboardType="phone-pad"
          />
        </View>

        <Text style={styles.scrollHint}>{t('profile.moreBelow', 'More options below ↓')}</Text>
      </View>

      {/* Scrollable: address, role-specific, password, save */}
      <ScrollView
        style={styles.scrollForm}
        contentContainerStyle={styles.scrollFormContent}
        showsVerticalScrollIndicator={true}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t('profile.personalInformation', 'Personal Information')}
          </Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>{t('auth.address', 'Address')} *</Text>
            <TextInput
              style={styles.input}
              value={formData.address}
              onChangeText={(value) => handleChange('address', value)}
              placeholder="Enter your address"
              multiline
            />
          </View>
        </View>

        {/* Client-specific fields */}
        {userRole === 'client' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {t('profile.clientInformation', 'Client Information')}
            </Text>

            <View style={styles.formGroup}>
              <Text style={styles.label}>{t('auth.clientType', 'Client Type')} *</Text>
              <View style={styles.radioGroup}>
                <TouchableOpacity
                  style={[styles.radioOption, formData.clientType === 'private' && styles.radioOptionActive]}
                  onPress={() => handleChange('clientType', 'private')}
                >
                  <Text style={[styles.radioText, formData.clientType === 'private' && styles.radioTextActive]}>
                    {t('auth.private', 'Private')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.radioOption, formData.clientType === 'company' && styles.radioOptionActive]}
                  onPress={() => handleChange('clientType', 'company')}
                >
                  <Text style={[styles.radioText, formData.clientType === 'company' && styles.radioTextActive]}>
                    {t('auth.company', 'Company')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {formData.clientType === 'company' && (
              <>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>{t('auth.companyName', 'Company Name')} *</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.companyName}
                    onChangeText={(value) => handleChange('companyName', value)}
                    placeholder="Enter company name"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>{t('auth.vatNumber', 'VAT Number')} *</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.vatNumber}
                    onChangeText={(value) => handleChange('vatNumber', value)}
                    placeholder="Enter VAT number"
                  />
                </View>
              </>
            )}

            <View style={styles.formGroup}>
              <Text style={styles.label}>{t('profile.hourlyPrice', 'Hourly Price')}</Text>
              <View style={styles.priceRow}>
                <View style={styles.currencySelector}>
                  <Text style={styles.currencyText}>
                    {formData.currency === 'USD' ? '$' : formData.currency === 'EUR' ? '€' : 'kr'}
                  </Text>
                </View>
                <TextInput
                  style={[styles.input, styles.priceInput]}
                  value={formData.hourlyPrice}
                  onChangeText={(value) => handleChange('hourlyPrice', value)}
                  placeholder="Enter hourly rate"
                  keyboardType="decimal-pad"
                />
              </View>
            </View>
          </View>
        )}

        {/* Cleaner-specific fields */}
        {userRole === 'cleaner' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {t('profile.professionalInformation', 'Professional Information')}
            </Text>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Experience (years)</Text>
              <TextInput
                style={styles.input}
                value={formData.experience.toString()}
                onChangeText={(value) => handleChange('experience', parseInt(value) || 0)}
                placeholder="Years of experience"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>{t('profile.hourlyPrice', 'Hourly Price')}</Text>
              <View style={styles.priceRow}>
                <View style={styles.currencySelector}>
                  <Text style={styles.currencyText}>
                    {formData.currency === 'USD' ? '$' : formData.currency === 'EUR' ? '€' : 'kr'}
                  </Text>
                </View>
                <TextInput
                  style={[styles.input, styles.priceInput]}
                  value={formData.hourlyPrice}
                  onChangeText={(value) => handleChange('hourlyPrice', value)}
                  placeholder="Enter hourly rate"
                  keyboardType="decimal-pad"
                />
              </View>
            </View>
          </View>
        )}

        {/* Password Change */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Change Password</Text>
          <Text style={styles.hint}>
            Leave blank if you don't want to change your password
          </Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>{t('profile.newPassword', 'New Password')}</Text>
            <TextInput
              style={styles.input}
              value={formData.password}
              onChangeText={(value) => handleChange('password', value)}
              placeholder="Enter new password (min 6 characters)"
              secureTextEntry
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>
              {t('profile.confirmNewPassword', 'Confirm New Password')}
            </Text>
            <TextInput
              style={styles.input}
              value={formData.confirmPassword}
              onChangeText={(value) => handleChange('confirmPassword', value)}
              placeholder="Confirm new password"
              secureTextEntry
            />
          </View>
        </View>

        <View style={styles.actions}>
          <Button
            title="Save Changes"
            onPress={handleSubmit}
            variant="primary"
            loading={loading}
            style={styles.saveButton}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
  },
  header: {
    padding: spacing.lg,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  title: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textDark,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textLight,
  },
  summaryCard: {
    backgroundColor: colors.white,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  scrollHint: {
    fontSize: typography.fontSize.sm,
    color: colors.textLight,
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  scrollForm: {
    flex: 1,
  },
  scrollFormContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  section: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textDark,
    marginBottom: spacing.md,
  },
  photoSection: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  photoPreview: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.backgroundLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    borderWidth: 2,
    borderColor: colors.gray[300],
    overflow: 'hidden',
  },
  photo: {
    width: 88,
    height: 88,
    borderRadius: 44,
  },
  photoPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoIcon: {
    fontSize: 48,
    opacity: 0.5,
  },
  photoText: {
    fontSize: typography.fontSize.xs,
    color: colors.textLight,
    marginTop: spacing.xs,
  },
  photoActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  photoButton: {
    minWidth: 100,
  },
  formGroup: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textDark,
    marginBottom: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: typography.fontSize.md,
    color: colors.textDark,
    backgroundColor: colors.white,
  },
  radioGroup: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  radioOption: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.gray[300],
    alignItems: 'center',
  },
  radioOptionActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight + '20',
  },
  radioText: {
    fontSize: typography.fontSize.md,
    color: colors.textDark,
  },
  radioTextActive: {
    color: colors.primary,
    fontWeight: typography.fontWeight.bold,
  },
  priceRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  currencySelector: {
    width: 60,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.backgroundLight,
  },
  currencyText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.textDark,
  },
  priceInput: {
    flex: 1,
  },
  hint: {
    fontSize: typography.fontSize.sm,
    color: colors.textLight,
    marginBottom: spacing.md,
    fontStyle: 'italic',
  },
  actions: {
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
  saveButton: {
    marginBottom: spacing.md,
  },
});

export default Profile;
