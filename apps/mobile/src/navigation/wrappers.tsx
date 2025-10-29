/**
 * Wrapper components to adapt wouter-based pages to React Navigation
 * 
 * These wrappers:
 * - Extract route params from React Navigation
 * - Provide mock wouter hooks (useLocation, useRoute, Link) for compatibility
 * - Handle navigation through React Navigation API
 */

import React, { createContext, useContext, ReactNode } from 'react';
import { useNavigation, useRoute, NavigationProp, RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from './types';

// Create a context for navigation (to mock wouter's useLocation, useRoute)
export interface WouterCompatContextType {
  location: string;
  setLocation: (path: string) => void;
  params: Record<string, string | undefined>;
}

export const WouterCompatContext = createContext<WouterCompatContextType | null>(null);

/**
 * Hook to get wouter-compatible location and navigation
 * Pages can use this instead of useLocation from wouter
 */
export function useWouterCompat() {
  const context = useContext(WouterCompatContext);
  if (!context) {
    throw new Error('useWouterCompat must be used within WouterCompatProvider');
  }
  return context;
}

/**
 * Provider component that wraps pages and provides wouter-compatible navigation
 */
export function WouterCompatProvider({ 
  children,
  routeName,
  params = {},
}: { 
  children: ReactNode;
  routeName: string;
  params?: Record<string, string | undefined>;
}) {
  const navigation = useNavigation<NavigationProp<keyof RootStackParamList>>();
  
  const setLocation = (path: string) => {
    // Convert wouter-style paths to React Navigation navigation
    // Use 'as any' to bypass strict typing for navigation calls
    const nav = navigation as any;
    
    if (path === '/') {
      nav.navigate('Main', { screen: 'Home' });
    } else if (path.startsWith('/auth')) {
      nav.navigate('Auth' as keyof RootStackParamList);
    } else if (path.startsWith('/portfolio')) {
      const match = path.match(/\/portfolio\/(.+)/);
      if (match) {
        nav.navigate('PortfolioDetail' as keyof RootStackParamList, { childId: match[1] });
      } else {
        nav.navigate('Main' as keyof RootStackParamList, { screen: 'Portfolio' });
      }
    } else if (path.startsWith('/timeline')) {
      const match = path.match(/\/timeline\/(.+)/);
      if (match) {
        nav.navigate('TimelineDetail' as keyof RootStackParamList, { childId: match[1] });
      } else {
        nav.navigate('Main' as keyof RootStackParamList, { screen: 'Timeline' });
      }
    } else if (path.startsWith('/activities')) {
      nav.navigate('Main' as keyof RootStackParamList, { screen: 'Activities' });
    } else if (path.startsWith('/profile')) {
      nav.navigate('Main' as keyof RootStackParamList, { screen: 'Profile' });
    } else if (path.startsWith('/add-child')) {
      nav.navigate('AddChild' as keyof RootStackParamList);
    } else if (path.startsWith('/gift/')) {
      const match = path.match(/\/gift\/(.+)/);
      if (match) {
        nav.navigate('GiftGiver' as keyof RootStackParamList, { giftCode: match[1] });
      }
    } else if (path.startsWith('/sprout/')) {
      const match = path.match(/\/sprout\/(.+)/);
      if (match) {
        nav.navigate('SproutRequest' as keyof RootStackParamList, { requestCode: match[1] });
      }
    } else if (path.startsWith('/forgot-password')) {
      nav.navigate('ForgotPassword' as keyof RootStackParamList);
    } else if (path.startsWith('/privacy-policy')) {
      nav.navigate('PrivacyPolicy' as keyof RootStackParamList);
    } else if (path.startsWith('/early-access')) {
      nav.navigate('EarlyAccess' as keyof RootStackParamList);
    }
  };

  const location = `/${routeName}`;

  return (
    <WouterCompatContext.Provider value={{ location, setLocation, params }}>
      {children}
    </WouterCompatContext.Provider>
  );
}

/**
 * Screen wrapper component that adapts a wouter-based page component to React Navigation
 */
export function createScreenWrapper<P extends Record<string, any> = {}>(
  Component: React.ComponentType<P>,
  routeName: string,
  extractParams?: (route: RouteProp<RootStackParamList, keyof RootStackParamList>) => Record<string, string | undefined>
) {
  return function ScreenWrapper(props: P = {} as P) {
    const route = useRoute<RouteProp<RootStackParamList, keyof RootStackParamList>>();
    const params = extractParams ? extractParams(route) : (route.params as Record<string, string | undefined> || {});
    
    return (
      <WouterCompatProvider routeName={routeName} params={params}>
        <Component {...props} {...params} />
      </WouterCompatProvider>
    );
  };
}
