/**
 * StockSprout Mobile App
 * 
 * Entry point for iOS and Android applications
 * Uses React Navigation for routing and the shared component library
 */

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';

import { queryClient } from '../../client/src/lib/queryClient';
import { AuthProvider, useAuth } from '../../client/src/contexts/AuthContext';
import type { RootStackParamList, MainTabParamList } from './src/navigation/types';
import { createScreenWrapper } from './src/navigation/wrappers';
import type { RouteProp } from '@react-navigation/native';

// Import pages
import AuthPage from '../../client/src/pages/auth';
import Home from '../../client/src/pages/home';
import Portfolio from '../../client/src/pages/portfolio';
import Timeline from '../../client/src/pages/timeline';
import Activities from '../../client/src/pages/activities';
import Profile from '../../client/src/pages/profile';
import AddChild from '../../client/src/pages/add-child';
import GiftGiver from '../../client/src/pages/gift-giver';
import SproutRequestPage from '../../client/src/pages/sprout-request';
import ForgotPassword from '../../client/src/pages/forgot-password';
import PrivacyPolicy from '../../client/src/pages/privacy-policy';
import EarlyAccess from '../../client/src/pages/early-access';
import NotFound from '../../client/src/pages/not-found';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();


function LoadingScreen() {
  return (
    <View style={styles.loading}>
      <ActivityIndicator size="large" color="#009538" />
      <Text style={styles.loadingText}>Loading...</Text>
    </View>
  );
}

// Create screen wrappers for pages that need route params
const PortfolioScreen = createScreenWrapper(
  Portfolio,
  'portfolio',
  (route: RouteProp<RootStackParamList, keyof RootStackParamList>) => ({ 
    childId: (route.params as any)?.childId 
  })
);

const TimelineScreen = createScreenWrapper(
  Timeline,
  'timeline',
  (route: RouteProp<RootStackParamList, keyof RootStackParamList>) => ({ 
    childId: (route.params as any)?.childId 
  })
);

const GiftGiverScreen = createScreenWrapper(
  GiftGiver,
  'gift',
  (route: RouteProp<RootStackParamList, 'GiftGiver'>) => ({ 
    giftCode: route.params?.giftCode || '' 
  })
);

const SproutRequestScreen = createScreenWrapper(
  SproutRequestPage,
  'sprout',
  (route: RouteProp<RootStackParamList, 'SproutRequest'>) => ({ 
    requestCode: route.params?.requestCode || '' 
  })
);

const PortfolioDetailScreen = createScreenWrapper(
  Portfolio,
  'portfolio',
  (route: RouteProp<RootStackParamList, 'PortfolioDetail'>) => ({ 
    childId: route.params?.childId 
  })
);

const TimelineDetailScreen = createScreenWrapper(
  Timeline,
  'timeline',
  (route: RouteProp<RootStackParamList, 'TimelineDetail'>) => ({ 
    childId: route.params?.childId 
  })
);

function ProtectedTabs() {
  const { user } = useAuth();
  
  if (!user) {
    return null;
  }

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#009538',
        tabBarInactiveTintColor: '#999',
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={createScreenWrapper(Home, 'home')}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen 
        name="Portfolio" 
        component={createScreenWrapper(Portfolio, 'portfolio')}
        options={{ tabBarLabel: 'Portfolio' }}
      />
      <Tab.Screen 
        name="Timeline" 
        component={createScreenWrapper(Timeline, 'timeline')}
        options={{ tabBarLabel: 'Timeline' }}
      />
      <Tab.Screen 
        name="Activities" 
        component={createScreenWrapper(Activities, 'activities')}
        options={{ tabBarLabel: 'Activities' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={createScreenWrapper(Profile, 'profile')}
        options={{ tabBarLabel: 'Profile' }}
      />
    </Tab.Navigator>
  );
}

function RootNavigator() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        <>
          <Stack.Screen 
            name="Auth" 
            component={createScreenWrapper(AuthPage, 'auth')} 
          />
          <Stack.Screen 
            name="ForgotPassword" 
            component={createScreenWrapper(ForgotPassword, 'forgot-password')} 
          />
          <Stack.Screen 
            name="PrivacyPolicy" 
            component={createScreenWrapper(PrivacyPolicy, 'privacy-policy')} 
          />
          <Stack.Screen 
            name="EarlyAccess" 
            component={createScreenWrapper(EarlyAccess, 'early-access')} 
          />
          <Stack.Screen 
            name="GiftGiver" 
            component={GiftGiverScreen} 
          />
          <Stack.Screen 
            name="SproutRequest" 
            component={SproutRequestScreen} 
          />
        </>
      ) : (
        <>
          <Stack.Screen name="Main" component={ProtectedTabs} />
          <Stack.Screen 
            name="AddChild" 
            component={createScreenWrapper(AddChild, 'add-child')} 
          />
          <Stack.Screen 
            name="PortfolioDetail" 
            component={PortfolioDetailScreen} 
          />
          <Stack.Screen 
            name="TimelineDetail" 
            component={TimelineDetailScreen} 
          />
          <Stack.Screen 
            name="GiftGiver" 
            component={GiftGiverScreen} 
          />
          <Stack.Screen 
            name="SproutRequest" 
            component={SproutRequestScreen} 
          />
        </>
      )}
      <Stack.Screen 
        name="NotFound" 
        component={createScreenWrapper(NotFound, 'not-found')} 
      />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <NavigationContainer>
            <StatusBar style="auto" />
            <RootNavigator />
          </NavigationContainer>
        </AuthProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 20,
  },
  placeholderText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#161823',
    marginBottom: 8,
  },
  placeholderSubtext: {
    fontSize: 16,
    color: '#666',
  },
});
