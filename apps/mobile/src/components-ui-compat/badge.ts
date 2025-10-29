/**
 * Compatibility layer: redirect @/components/ui/badge to a simple React Native View/Text
 */
import React from 'react';
import { View, Text, StyleSheet } from '@stocksprout/components';

const badgeStyles = StyleSheet.create({
  badge: {
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  text: {
    fontSize: 12,
    fontWeight: '500',
    color: '#161823',
  },
});

export const Badge: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => {
  return (
    <View style={badgeStyles.badge}>
      <Text style={badgeStyles.text}>{children}</Text>
    </View>
  );
};
