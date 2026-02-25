import React, { useEffect, useRef, createContext, useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { useWindowDimensions } from 'react-native';

import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
// Initialize Reanimated - must be imported before any other code
import 'react-native-reanimated';
import { LanguageProvider } from './src/contexts/LanguageContext';
import { ToastProvider } from './src/contexts/ToastContext';
import { AuthProvider } from './src/contexts/AuthContext';
import { initMockData } from './src/utils/mockData';
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
import HomePage from './src/screens/HomePage/HomePage';
import Services from './src/screens/Services/Services';
import PrivateCleaning from './src/screens/Services/PrivateCleaning';
import CommercialCleaning from './src/screens/Services/CommercialCleaning';
import MoveInMoveOut from './src/screens/Services/MoveInMoveOut';
import About from './src/screens/About/About';
import Contact from './src/screens/Contact/Contact';
import Careers from './src/screens/Careers/Careers';

// Auth Screens
import Login from './src/screens/Auth/Login';
import Register from './src/screens/Auth/Register';

// Dashboard Screens
import ClientDashboard from './src/screens/Dashboards/ClientDashboard/ClientDashboard';
import AdminDashboard from './src/screens/Dashboards/AdminDashboard/AdminDashboard';
import CleanerDashboard from './src/screens/Dashboards/CleanerDashboard/CleanerDashboard';
import MenuScreen from './src/screens/Menu/Menu';
import ChatScreen from './src/screens/Chat/ChatScreen';

// Order Screens
import NewOrder from './src/screens/Orders/NewOrder';
import OrderConfirmation from './src/screens/Orders/OrderConfirmation';
import ConfirmedOrders from './src/screens/Orders/ConfirmedOrders';
import OrderDetail from './src/screens/Orders/OrderDetail';
import PendingOrders from './src/screens/Orders/PendingOrders';
import ArchiveOrders from './src/screens/Orders/ArchiveOrders';

// Profile Screen
import ProfileScreen from './src/screens/Profile/ProfileScreen';

// Protected Route Component
import ProtectedRoute from './src/components/Auth/ProtectedRoute';
import { navigationRef } from './src/utils/rootNavigation';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const RootNavigationContext = createContext(navigationRef);

export function useRootNavigation() {
  return useContext(RootNavigationContext) || navigationRef;
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
      <Stack.Screen name="About" component={About} options={{ title: 'About Us' }} />
      <Stack.Screen name="Contact" component={Contact} options={{ title: 'Contact Us' }} />
      <Stack.Screen name="Careers" component={Careers} options={{ title: 'Careers' }} />
      <Stack.Screen name="Services" component={Services} options={{ title: 'Services' }} />
      <Stack.Screen name="PrivateCleaning" component={PrivateCleaning} options={{ title: 'Private Cleaning' }} />
      <Stack.Screen name="CommercialCleaning" component={CommercialCleaning} options={{ title: 'Commercial Cleaning' }} />
      <Stack.Screen name="MoveInMoveOut" component={MoveInMoveOut} options={{ title: 'Move-in/Move-out' }} />
      <Stack.Screen name="PendingOrders" component={PendingOrders} options={{ title: 'Pending' }} />
      <Stack.Screen name="ArchiveOrders" component={ArchiveOrders} options={{ title: 'Archive' }} />
      <Stack.Screen name="OrderDetail" component={OrderDetail} options={{ title: 'Order Details' }} />
      <Stack.Screen name="HomePage" component={HomePage} options={{ title: 'Home' }} />
      <Stack.Screen name="Login" component={Login} options={{ title: 'Login' }} />
      <Stack.Screen name="Register" component={Register} options={{ title: 'Register' }} />
      <Stack.Screen name="ClientDashboard" options={{ headerShown: false }}>
        {(props) => <ProtectedRoute requiredRole="client"><ClientDashboard {...props} /></ProtectedRoute>}
      </Stack.Screen>
      <Stack.Screen name="AdminDashboard" options={{ headerShown: false }}>
        {(props) => <ProtectedRoute requiredRole="admin"><AdminDashboard {...props} /></ProtectedRoute>}
      </Stack.Screen>
      <Stack.Screen name="CleanerDashboard" options={{ headerShown: false }}>
        {(props) => <ProtectedRoute requiredRole="cleaner"><CleanerDashboard {...props} /></ProtectedRoute>}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

function MainTabs() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const compactTabBar = width < 390;
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
      <Tab.Screen
        name="NewOrderTab"
        component={NewOrderStack}
        options={{
          title: 'New',
          tabBarIcon: ({ focused, color, size }) => <Ionicons name={focused ? 'add-circle' : 'add-circle-outline'} size={compactTabBar ? 20 : size} color={color} />,
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
      <Tab.Screen
        name="MenuTab"
        component={MenuStack}
        options={{
          title: 'Menu',
          tabBarIcon: ({ focused, color, size }) => <Ionicons name={focused ? 'menu' : 'menu-outline'} size={compactTabBar ? 20 : size} color={color} />,
        }}
      />
      <Tab.Screen
        name="MessagesTab"
        component={ChatScreen}
        options={{
          title: 'Chat',
          tabBarIcon: ({ focused, color, size }) => <Ionicons name={focused ? 'chatbubbles' : 'chatbubbles-outline'} size={compactTabBar ? 20 : size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
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
      initMockData();
      return () => global.removeEventListener('unhandledrejection', onUnhandledRejection);
    }

    initMockData();
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
                    <MainTabs />
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
