/**
 * Cross-platform Label component using React Native Text
 * Replaces shadcn/ui Label with React Native Web compatible version
 */

import React from 'react';
import { Text, StyleSheet, type TextStyle, type ViewStyle } from 'react-native-web';

export interface LabelProps {
  children: React.ReactNode;
  htmlFor?: string;
  style?: TextStyle | ViewStyle | (TextStyle | ViewStyle)[];
  onPress?: () => void;
}

const labelStyles = StyleSheet.create({
  base: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  pressable: {
    cursor: 'pointer',
  },
});

export const Label = React.forwardRef<any, LabelProps>(
  ({ children, htmlFor, style, onPress }, ref) => {
    const labelStyle: (TextStyle | ViewStyle)[] = [labelStyles.base];
    
    if (onPress) {
      labelStyle.push(labelStyles.pressable);
    }

    if (Array.isArray(style)) {
      labelStyle.push(...style);
    } else if (style) {
      labelStyle.push(style);
    }

    return (
      <Text
        ref={ref}
        style={labelStyle}
        onPress={onPress}
        // @ts-ignore - htmlFor for web accessibility
        htmlFor={htmlFor}
      >
        {children}
      </Text>
    );
  }
);

Label.displayName = 'Label';
