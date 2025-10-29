/**
 * Compatibility layer: redirect @/components/ui/avatar to simple React Native View/Text
 */
import React from 'react';
import { View, Text, StyleSheet } from '@stocksprout/components';

const avatarStyles = StyleSheet.create({
  container: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  text: {
    fontSize: 14,
    fontWeight: '500',
    color: '#161823',
  },
});

export const Avatar: React.FC<{ children?: React.ReactNode; className?: string }> = ({ children, className }) => {
  return <View style={avatarStyles.container}>{children}</View>;
};

export const AvatarImage: React.FC<{ src?: string; alt?: string; className?: string }> = ({ src, alt, className, children }) => {
  // In React Native, we'd use Image component, but for compatibility just render children
  return <>{children}</>;
};
export const AvatarFallback: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (typeof children === 'string') {
    return (
      <View style={avatarStyles.container}>
        <Text style={avatarStyles.text}>{children.charAt(0).toUpperCase()}</Text>
      </View>
    );
  }
  return <>{children}</>;
};
