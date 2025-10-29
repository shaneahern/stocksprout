/**
 * React Native Web Primitives
 * 
 * Cross-platform primitive components that work with React Native Web.
 * These components can be used on web, iOS, Android, and desktop.
 */

import React from 'react';
import { 
  View as RNView, 
  Text as RNText, 
  ScrollView as RNScrollView, 
  Pressable,
  TextInput as RNTextInput,
  StyleSheet,
  type ViewStyle,
  type TextStyle,
} from 'react-native-web';

// Re-export React Native primitives for web compatibility
export const View = RNView;
export const Text = RNText;
export const ScrollView = RNScrollView;
export { Pressable };
export { StyleSheet };

// SafeAreaView placeholder - can use react-native-safe-area-context later
export const SafeAreaView = RNView;

// Type exports
export type ViewProps = React.ComponentProps<typeof RNView>;
export type TextProps = React.ComponentProps<typeof RNText>;
export type ScrollViewProps = React.ComponentProps<typeof RNScrollView>;
export type PressableProps = React.ComponentProps<typeof Pressable>;
export type { ViewStyle, TextStyle };

// TextInput is re-exported from text-input to avoid conflicts
export type { TextInputProps } from './text-input';
