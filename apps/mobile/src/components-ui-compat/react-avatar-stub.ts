/**
 * Stub for @radix-ui/react-avatar
 * Provides minimal API surface to prevent import errors
 */
import React from 'react';
import { View, Text, Image } from 'react-native';

// Radix Avatar exports Root, Image, and Fallback
// We provide simple React Native equivalents that accept but ignore web props

export const Root = ({ children, className, ...props }: any) => {
  return <View {...props}>{children}</View>;
};

export const Avatar = Root; // Alias for compatibility

export const AvatarImage = ({ src, alt, className, ...props }: any) => {
  if (src) {
    return <Image source={{ uri: src }} {...props} />;
  }
  return null;
};

export const Image = AvatarImage; // Alias for compatibility

export const Fallback = ({ children, className, ...props }: any) => {
  return <View {...props}>{children}</View>;
};

export const AvatarFallback = Fallback; // Alias for compatibility
