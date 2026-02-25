import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Animated,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { colors, spacing, typography, borderRadius } from '../../constants/theme';
import Logo from '../Common/Logo';

const DashboardSidebar = ({ menuItems, isOpen, onClose }) => {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { userData, logout } = useAuth();
  const { t } = useLanguage();
  const navigation = useNavigation();
  const [userPhoto, setUserPhoto] = useState(null);
  const sidebarWidth = Math.min(320, Math.max(240, Math.round(width * 0.78)));
  const slideAnim = useRef(new Animated.Value(-sidebarWidth)).current;

  useEffect(() => {
    if (userData?.photo) {
      setUserPhoto(userData.photo);
    }
  }, [userData]);

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: isOpen ? 0 : -sidebarWidth,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isOpen, slideAnim, sidebarWidth]);

  useEffect(() => {
    if (!isOpen) {
      slideAnim.setValue(-sidebarWidth);
    }
  }, [isOpen, slideAnim, sidebarWidth]);

  const handleLogout = async () => {
    onClose();
    // Navigate to Login first so we don't show ProtectedRoute "Please log in" error
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    await logout();
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <TouchableOpacity
          style={[styles.overlay, { top: Math.max(insets.top + 52, 60) }]}
          activeOpacity={1}
          onPress={onClose}
        />
      )}

      {/* Sidebar */}
      <Animated.View
        style={[
          styles.sidebar,
          { width: sidebarWidth },
          {
            transform: [{ translateX: slideAnim }],
          },
        ]}
      >
        {/* Close Button - below status bar */}
        <TouchableOpacity
          style={[styles.closeButton, { top: Math.max(insets.top, spacing.md) }]}
          onPress={onClose}
          activeOpacity={0.7}
        >
          <Text style={styles.closeIcon}>✕</Text>
        </TouchableOpacity>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Logo Section - below status bar */}
          <View style={[styles.logoSection, { paddingTop: Math.max(insets.top, spacing.lg) }]}>
            <Logo width={60} height={60} />
            <View style={styles.userPhotoContainer}>
              {userPhoto ? (
                <Image source={{ uri: userPhoto }} style={styles.userPhoto} />
              ) : (
                <View style={styles.userPhotoPlaceholder}>
                  <Text style={styles.photoIcon}>📷</Text>
                </View>
              )}
              {userData?.name && (
                <Text style={styles.userName} numberOfLines={1}>
                  {userData.name}
                </Text>
              )}
            </View>
            <View style={styles.logoDivider} />
          </View>

          {/* Navigation */}
          <View style={styles.navSection}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.navItem, item.active && styles.navItemActive]}
                onPress={() => {
                  if (item.onClick) {
                    item.onClick();
                  }
                  onClose();
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.navIcon}>{item.icon}</Text>
                <Text style={styles.navText}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Footer with Logout */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <Text style={styles.navIcon}>🚪</Text>
            <Text style={styles.navText}>{t('nav.logout', 'Logout')}</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    // Leave space for the dashboard header so the menu button
    // can still be tapped to close the sidebar.
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 999,
  },
  sidebar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#1a4a4d', // Matches hero section gradient (blend of rgba(0, 64, 102) blue and rgba(51, 122, 28) green)
    zIndex: 1000,
  },
  closeButton: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1001,
  },
  closeIcon: {
    fontSize: 18,
    color: colors.white,
    fontWeight: typography.fontWeight.bold,
  },
  scrollView: {
    flex: 1,
  },
  logoSection: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  userPhotoContainer: {
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  userPhoto: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  userPhotoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  photoIcon: {
    fontSize: 36,
    opacity: 0.7,
  },
  userName: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.white,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  logoDivider: {
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginTop: spacing.md,
  },
  navSection: {
    paddingVertical: spacing.md,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderLeftWidth: 3,
    borderLeftColor: 'transparent',
  },
  navItemActive: {
    backgroundColor: 'rgba(0, 174, 239, 0.25)',
    borderLeftColor: colors.secondary,
  },
  navIcon: {
    fontSize: 20,
    marginRight: spacing.md,
    width: 24,
    textAlign: 'center',
  },
  navText: {
    flex: 1,
    fontSize: typography.fontSize.md,
    color: colors.white,
    fontWeight: typography.fontWeight.medium,
  },
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderLeftWidth: 3,
    borderLeftColor: 'transparent',
  },
});

export default DashboardSidebar;
