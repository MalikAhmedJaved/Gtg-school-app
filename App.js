import React, { useEffect, useRef, createContext, useContext, useState, useCallback } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { useWindowDimensions, View, ActivityIndicator } from 'react-native';

import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
// Initialize Reanimated - must be imported before any other code
import 'react-native-reanimated';
import { LanguageProvider } from './src/contexts/LanguageContext';
import { ToastProvider } from './src/contexts/ToastContext';
import { AuthProvider } from './src/contexts/AuthContext';
import ErrorBoundary from './src/components/Common/ErrorBoundary';
import ErrorDisplay, { logError, logConsole } from './src/components/Common/ErrorDisplay';

// Install logging ASAP (before first render/useEffect)
try {
  if (!global.__ORIGINAL_CONSOLE_ERROR__) {
    global.__ORIGINAL_CONSOLE_ERROR__ = console.error.bind(console);
  }
  if (!global.__ORIGINAL_CONSOLE_WARN__) {
    global.__ORIGINAL_CONSOLE_WARN__ = console.warn.bind(console);
  }
  if (!global.__ORIGINAL_CONSOLE_LOG__) {
    global.__ORIGINAL_CONSOLE_LOG__ = console.log.bind(console);
  }

  console.error = (...args) => {
    try {
      logConsole('error', args);
    } catch (_) {}
    global.__ORIGINAL_CONSOLE_ERROR__(...args);
  };
  console.warn = (...args) => {
    try {
      logConsole('warn', args);
    } catch (_) {}
    global.__ORIGINAL_CONSOLE_WARN__(...args);
  };

  // Capture unhandled promise rejections early
  try {
    // eslint-disable-next-line global-require
    const rejectionTracking = require('promise/setimmediate/rejection-tracking');
    if (rejectionTracking && rejectionTracking.enable) {
      rejectionTracking.enable({
        allRejections: true,
        onUnhandled: (id, error) => {
          logError(error, { type: 'unhandledRejection', id });
        },
        onHandled: () => {},
      });
    }
  } catch (rejectionErr) {
    // ignore if unavailable - not critical
  }
} catch (initErr) {
  // If logging setup fails, at least log to console
  console.error('Failed to setup error logging:', initErr);
}

// Main Screens
import About from './src/screens/About/About';
import Contact from './src/screens/Contact/Contact';

// Auth Screens
import Login from './src/screens/Auth/Login';
import Register from './src/screens/Auth/Register';
import ForgotPassword from './src/screens/Auth/ForgotPassword';
import ResetPassword from './src/screens/Auth/ResetPassword';

import MenuScreen from './src/screens/Menu/Menu';
import ChatScreen from './src/screens/Chat/ChatScreen';
import AdminDashboard from './src/screens/Dashboards/AdminDashboard/AdminDashboard';

// Order Screens
import NewOrder from './src/screens/Orders/NewOrder';
import OrderConfirmation from './src/screens/Orders/OrderConfirmation';
import ConfirmedOrders from './src/screens/Orders/ConfirmedOrders';
import OrderDetail from './src/screens/Orders/OrderDetail.js';
import PendingOrders from './src/screens/Orders/PendingOrders';
import ArchiveOrders from './src/screens/Orders/ArchiveOrders';

// Profile Screen
import ProfileScreen from './src/screens/Profile/ProfileScreen';

import { navigationRef } from './src/utils/rootNavigation';
import { useAuth } from './src/contexts/AuthContext';
import api from './src/utils/api';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const RootNavigationContext = createContext(navigationRef);

export function useRootNavigation() {
  return useContext(RootNavigationContext) || navigationRef;
}

// Hook to poll unread chat count
function useUnreadCount() {
  const { isAuthenticated } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnread = useCallback(async () => {
    try {
      const response = await api.get('/chat/unread-count');
      if (response.data?.success) {
        setUnreadCount(response.data.data.count || 0);
      }
    } catch {
      // silent - don't disrupt the app if chat endpoint isn't ready
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) { setUnreadCount(0); return; }
    fetchUnread();
    const interval = setInterval(fetchUnread, 15000); // poll every 15s
    return () => clearInterval(interval);
  }, [isAuthenticated, fetchUnread]);

  return unreadCount;
}

function OrdersStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#00AEEF' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen name="ConfirmedOrders" component={ConfirmedOrders} options={{ headerShown: false }} />
      <Stack.Screen name="OrderDetail" component={OrderDetail} options={{ title: 'Order Details' }} />
    </Stack.Navigator>
  );
}

function NewOrderStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#00AEEF' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen name="NewOrder" component={NewOrder} options={{ headerShown: false }} />
      <Stack.Screen name="OrderConfirmation" component={OrderConfirmation} options={{ title: 'Confirmation', headerLeft: () => null }} />
    </Stack.Navigator>
  );
}

function PendingStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#00AEEF' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen name="PendingOrders" component={PendingOrders} options={{ headerShown: false }} />
      <Stack.Screen name="OrderDetail" component={OrderDetail} options={{ title: 'Order Details' }} />
    </Stack.Navigator>
  );
}

function MenuStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#00AEEF' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen name="MenuScreen" component={MenuScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AdminDashboard" component={AdminDashboard} options={{ title: 'Admin', headerStyle: { backgroundColor: '#00AEEF' }, headerTintColor: '#fff' }} />
      <Stack.Screen name="About" component={About} options={{ title: 'About Us' }} />
      <Stack.Screen name="Contact" component={Contact} options={{ title: 'Contact Us' }} />
      <Stack.Screen name="PendingOrders" component={PendingOrders} options={{ title: 'Pending' }} />
      <Stack.Screen name="ArchiveOrders" component={ArchiveOrders} options={{ title: 'Archive' }} />
      <Stack.Screen name="OrderDetail" component={OrderDetail} options={{ title: 'Order Details' }} />
      <Stack.Screen name="Login" component={Login} options={{ title: 'Login' }} />
      <Stack.Screen name="Register" component={Register} options={{ title: 'Register' }} />
      <Stack.Screen name="ForgotPassword" component={ForgotPassword} options={{ title: 'Forgot Password' }} />
      <Stack.Screen name="ResetPassword" component={ResetPassword} options={{ title: 'Reset Password' }} />
    </Stack.Navigator>
  );
}

function MainTabs() {
  const { userRole } = useAuth();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const compactTabBar = width < 390;
  const unreadCount = useUnreadCount();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#00AEEF',
        tabBarInactiveTintColor: '#718096',
        tabBarShowLabel: !compactTabBar,
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: '#e2e8f0',
          paddingBottom: Math.max(insets.bottom, compactTabBar ? 6 : 8),
          paddingTop: compactTabBar ? 6 : 4,
          height: (compactTabBar ? 52 : 58) + Math.max(insets.bottom, compactTabBar ? 6 : 8),
        },
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
        tabBarItemStyle: { paddingHorizontal: compactTabBar ? 0 : 2 },
      }}
    >
      <Tab.Screen
        name="OrdersTab"
        component={OrdersStack}
        options={{
          title: 'Orders',
          tabBarIcon: ({ focused, color, size }) => <Ionicons name={focused ? 'checkmark-circle' : 'checkmark-circle-outline'} size={compactTabBar ? 20 : size} color={color} />,
        }}
      />
      {userRole === 'cleaner' ? (
        <Tab.Screen
          name="PendingTab"
          component={PendingStack}
          options={{
            title: 'Pending',
            tabBarIcon: ({ focused, color, size }) => <Ionicons name={focused ? 'time' : 'time-outline'} size={compactTabBar ? 20 : size} color={color} />,
          }}
        />
      ) : (
        <Tab.Screen
          name="NewOrderTab"
          component={NewOrderStack}
          options={{
            title: 'New',
            unmountOnBlur: true,
            tabBarIcon: ({ focused, color, size }) => <Ionicons name={focused ? 'add-circle' : 'add-circle-outline'} size={compactTabBar ? 20 : size} color={color} />,
          }}
        />
      )}
      <Tab.Screen
        name="MessagesTab"
        component={ChatScreen}
        options={{
          title: 'Chat',
          tabBarIcon: ({ focused, color, size }) => <Ionicons name={focused ? 'chatbubbles' : 'chatbubbles-outline'} size={compactTabBar ? 20 : size} color={color} />,
          tabBarBadge: unreadCount > 0 ? (unreadCount > 99 ? '99+' : unreadCount) : undefined,
          tabBarBadgeStyle: { backgroundColor: '#00AEEF', fontSize: 10, minWidth: 18, height: 18, lineHeight: 18 },
        }}
      />
      <Tab.Screen
        name="MenuTab"
        component={MenuStack}
        options={{
          title: 'Menu',
          tabBarIcon: ({ focused, color, size }) => <Ionicons name={focused ? 'menu' : 'menu-outline'} size={compactTabBar ? 20 : size} color={color} />,
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused, color, size }) => <Ionicons name={focused ? 'person' : 'person-outline'} size={compactTabBar ? 20 : size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerStyle: { backgroundColor: '#00AEEF' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen name="Login" component={Login} options={{ title: 'Login' }} />
      <Stack.Screen name="Register" component={Register} options={{ title: 'Register' }} />
      <Stack.Screen name="ForgotPassword" component={ForgotPassword} options={{ title: 'Forgot Password' }} />
      <Stack.Screen name="ResetPassword" component={ResetPassword} options={{ title: 'Reset Password' }} />
    </Stack.Navigator>
  );
}

function AppNavigator() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#00AEEF" />
      </View>
    );
  }

  return isAuthenticated ? <MainTabs /> : <AuthStack />;
}

export default function App() {
  useEffect(() => {
    // Set up global error handlers so the app doesn't close/reload on errors
    if (typeof ErrorUtils !== 'undefined') {
      ErrorUtils.setGlobalHandler((error, isFatal) => {
        logError(error, { isFatal, type: 'globalHandler' });
        // Don't call the default handler so the app doesn't close/reopen on errors. All errors
        // are logged above and visible in the ErrorDisplay (bug icon). Tap the bug to see details.
      });
    }

    // Catch unhandled promise rejections (e.g. on web or when available) so they don't crash the app
    const onUnhandledRejection = (event) => {
      const reason = event?.reason ?? event;
      logError(reason instanceof Error ? reason : new Error(String(reason)), { type: 'unhandledRejection' });
      if (event?.preventDefault) event.preventDefault();
    };
    if (typeof global !== 'undefined' && typeof global.addEventListener === 'function') {
      global.addEventListener('unhandledrejection', onUnhandledRejection);
      return () => global.removeEventListener('unhandledrejection', onUnhandledRejection);
    }
  }, []);

  return (
    <>
      {/* Always render error UI, even if ErrorBoundary shows fallback */}
      <ErrorDisplay />
      <ErrorBoundary>
        <LanguageProvider>
          <ToastProvider>
            <AuthProvider>
              <SafeAreaProvider>
                <NavigationContainer ref={navigationRef}>
                  <RootNavigationContext.Provider value={navigationRef}>
                    <StatusBar style="auto" />
                    <AppNavigator />
                  </RootNavigationContext.Provider>
                </NavigationContainer>
              </SafeAreaProvider>
            </AuthProvider>
          </ToastProvider>
        </LanguageProvider>
      </ErrorBoundary>
    </>
  );
}
