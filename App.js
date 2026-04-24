import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { LanguageProvider, useLanguage } from './src/contexts/LanguageContext';
import { ToastProvider } from './src/contexts/ToastContext';
import { AuthProvider } from './src/contexts/AuthContext';
import { ThemeProvider, useTheme } from './src/contexts/ThemeContext';
import ErrorBoundary from './src/components/Common/ErrorBoundary';

// Screens
import Login from './src/screens/Auth/Login';
import Register from './src/screens/Auth/Register';
import ForgotPassword from './src/screens/Auth/ForgotPassword';
import HomeScreen from './src/screens/Home/HomeScreen';
import CategoriesScreen from './src/screens/Categories/CategoriesScreen';
import CategoryDetailScreen from './src/screens/Categories/CategoryDetailScreen';
import ChatScreen from './src/screens/Chat/ChatScreen';
import NotificationsScreen from './src/screens/Notifications/NotificationsScreen';
import ProfileScreen from './src/screens/Profile/ProfileScreen';
import SettingsScreen from './src/screens/Settings/SettingsScreen';
import GalleryScreen from './src/screens/Gallery/GalleryScreen';
import AnnouncementsScreen from './src/screens/Announcements/AnnouncementsScreen';
import ComplianceScreen from './src/screens/Compliance/ComplianceScreen';
import DocumentDetailScreen from './src/screens/Compliance/DocumentDetailScreen';

import { navigationRef } from './src/utils/rootNavigation';
import { useAuth } from './src/contexts/AuthContext';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="Gallery" component={GalleryScreen} />
      <Stack.Screen name="Announcements" component={AnnouncementsScreen} />
    </Stack.Navigator>
  );
}

function CategoriesStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CategoriesList" component={CategoriesScreen} />
      <Stack.Screen name="CategoryDetail" component={CategoryDetailScreen} />
    </Stack.Navigator>
  );
}

function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
}

function ComplianceStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ComplianceList" component={ComplianceScreen} />
      <Stack.Screen name="ComplianceDetail" component={DocumentDetailScreen} />
    </Stack.Navigator>
  );
}

function MainTabs() {
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  const { userRole } = useAuth();
  const { colors } = useTheme();
  const isEmployee = userRole === 'employee';
  const bottomPadding = Math.max(insets.bottom, Platform.OS === 'android' ? 12 : 8);
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textLight,
        tabBarLabelPosition: 'below-icon',
        tabBarAllowFontScaling: false,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingBottom: bottomPadding,
          paddingTop: 8,
          height: 64 + bottomPadding,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
          flexDirection: 'column',
        },
        tabBarIconStyle: {
          marginBottom: 2,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
          textAlign: 'center',
          includeFontPadding: false,
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStack}
        options={{
          title: t('app.tabs.home', 'Home'),
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={size} color={color} />
          ),
        }}
        listeners={({ navigation }) => ({
          tabPress: () => {
            navigation.navigate('HomeTab', { screen: 'HomeMain' });
          },
        })}
      />
      {!isEmployee ? (
        <Tab.Screen
          name="CategoriesTab"
          component={CategoriesStack}
          options={{
            title: t('app.tabs.therapies', 'Therapies'),
            tabBarIcon: ({ focused, color, size }) => (
              <Ionicons name={focused ? 'grid' : 'grid-outline'} size={size} color={color} />
            ),
          }}
          listeners={({ navigation }) => ({
            tabPress: () => {
              navigation.navigate('CategoriesTab', { screen: 'CategoriesList' });
            },
          })}
        />
      ) : null}
      {isEmployee ? (
        <Tab.Screen
          name="ComplianceTab"
          component={ComplianceStack}
          options={{
            title: t('app.tabs.compliance', 'Compliance'),
            tabBarIcon: ({ focused, color, size }) => (
              <Ionicons
                name={focused ? 'shield-checkmark' : 'shield-checkmark-outline'}
                size={size}
                color={color}
              />
            ),
          }}
          listeners={({ navigation }) => ({
            tabPress: () => {
              navigation.navigate('ComplianceTab', { screen: 'ComplianceList' });
            },
          })}
        />
      ) : null}
      <Tab.Screen
        name="ChatTab"
        component={ChatScreen}
        options={{
          title: t('app.tabs.chat', 'Chat'),
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? 'chatbubbles' : 'chatbubbles-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="NotificationsTab"
        component={NotificationsScreen}
        options={{
          title: t('app.tabs.notifications', 'Notifications'),
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? 'notifications' : 'notifications-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStack}
        options={{
          title: t('app.tabs.profile', 'Profile'),
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={size} color={color} />
          ),
        }}
        listeners={({ navigation }) => ({
          tabPress: () => {
            navigation.navigate('ProfileTab', { screen: 'ProfileMain' });
          },
        })}
      />
    </Tab.Navigator>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Register" component={Register} />
      <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
    </Stack.Navigator>
  );
}

function AppNavigator() {
  const { isAuthenticated, loading } = useAuth();
  const { colors, isDark } = useTheme();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'light'} />
      {isAuthenticated ? <MainTabs /> : <AuthStack />}
    </>
  );
}

export default function App() {
  return (
    <>
      <ErrorBoundary>
        <ThemeProvider>
          <LanguageProvider>
            <ToastProvider>
              <AuthProvider>
                <SafeAreaProvider>
                  <NavigationContainer ref={navigationRef}>
                    <AppNavigator />
                  </NavigationContainer>
                </SafeAreaProvider>
              </AuthProvider>
            </ToastProvider>
          </LanguageProvider>
        </ThemeProvider>
      </ErrorBoundary>
    </>
  );
}
