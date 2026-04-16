import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ImageBackground, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, StatusBar, Dimensions } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { colors, spacing, typography, borderRadius } from '../../constants/theme';
import Button from '../../components/Common/Button';

const bgImage = require('../../../assets/background.jpeg');

const Login = () => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: 'parent@glorytogod.com',
    password: 'parent123',
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

  return (
    <ImageBackground source={bgImage} style={styles.wrapper} imageStyle={styles.bgImage} resizeMode="cover">
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.container}>
            <View style={styles.spacer} />
            <View style={styles.formContainer}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  value={formData.email}
                  onChangeText={(value) => handleChange('email', value)}
                  placeholder="Email"
                  placeholderTextColor={colors.gray[400]}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password</Text>
                <TextInput
                  style={styles.input}
                  value={formData.password}
                  onChangeText={(value) => handleChange('password', value)}
                  placeholder="Password"
                  placeholderTextColor={colors.gray[400]}
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>

              <Button
                title={loading ? 'Signing in...' : 'Sign In'}
                onPress={handleSubmit}
                loading={loading}
                variant="primary"
                style={styles.submitButton}
              />

              {loginError ? <Text style={styles.errorText}>{loginError}</Text> : null}
            </View>
            <View style={styles.bottomSpacer} />
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  bgImage: {
    width: '100%',
    height: '100%',
    ...Platform.select({
      web: { objectPosition: 'left top', objectFit: 'cover' },
      default: {},
    }),
  },
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: spacing.xl,
  },
  spacer: {
    flex: 5,
  },
  formContainer: {
    flex: 4,
    justifyContent: 'center',
    gap: spacing.md,
  },
  bottomSpacer: {
    flex: 2,
  },
  inputGroup: {
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textDark,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    fontSize: typography.fontSize.md,
    color: colors.textDark,
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
});

export default Login;
