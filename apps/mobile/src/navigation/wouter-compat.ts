/**
 * Wouter compatibility layer for React Navigation
 * 
 * Provides wouter-style hooks (useRoute, useLocation, useParams) that work
 * with React Navigation. Pages can use these hooks without modification.
 */

import { useRoute as useRNRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { useContext } from 'react';
import { WouterCompatContext } from './wrappers';

/**
 * Wouter-compatible useLocation hook
 * Returns [location, setLocation] where location is the current route path
 * and setLocation navigates to a new route
 */
export function useLocation(): [string, (path: string) => void] {
  const context = useContext(WouterCompatContext);
  if (!context) {
    // Fallback for when not in a wrapper (web environment)
    const navigation = useNavigation();
    const route = useRNRoute();
    
    const location = (route as any).name ? `/${(route as any).name.toLowerCase()}` : '/';
    
    const setLocation = (path: string) => {
      // Convert wouter paths to React Navigation
      if (path === '/') {
        (navigation as any).navigate('Main', { screen: 'Home' });
      } else {
        // Simple navigation - could be enhanced
        console.warn('Navigation from compatibility layer:', path);
      }
    };
    
    return [location, setLocation];
  }
  
  return [context.location, context.setLocation];
}

/**
 * Wouter-compatible useRoute hook
 * Returns [match, params] where match is a boolean and params contains route parameters
 */
export function useRoute(pattern: string): [boolean, Record<string, string | undefined> | null] {
  const context = useContext(WouterCompatContext);
  const rnRoute = useRNRoute();
  
  if (!context) {
    // Fallback: try to match pattern against current route
    const currentRoute = ((rnRoute as any).name?.toLowerCase() || '') as string;
    const patternRoute = pattern.replace(/^\/|\/:.*$/g, '').toLowerCase();
    const matches = currentRoute === patternRoute;
    
    return [matches, ((rnRoute as any).params as Record<string, string | undefined>) || null];
  }
  
  // Check if pattern matches current route
  const patternRoute = pattern.replace(/^\/|\/:.*$/g, '').toLowerCase();
  const currentRoute = context.location.replace(/^\//, '').toLowerCase();
  const matches = currentRoute.startsWith(patternRoute);
  
  // Extract params from pattern
  const paramNames = (pattern.match(/:\w+/g) || []).map(p => p.slice(1));
  const params: Record<string, string | undefined> = {};
  
  if (matches && context.params) {
    paramNames.forEach(paramName => {
      params[paramName] = context.params[paramName];
    });
  }
  
  return [matches, matches ? (context.params || null) : null];
}

/**
 * Wouter-compatible useParams hook
 * Returns params object from current route
 */
export function useParams<T extends Record<string, string | undefined> = Record<string, string | undefined>>(): T {
  const context = useContext(WouterCompatContext);
  const rnRoute = useRNRoute();
  
  if (context) {
    return (context.params || {}) as T;
  }
  
  return (((rnRoute as any).params as T) || {}) as T;
}
