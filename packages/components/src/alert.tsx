/**
 * Cross-platform Alert component using React Native View
 * Replaces shadcn/ui Alert with React Native Web compatible version
 */

import React from 'react';
import { View, Text, StyleSheet, type ViewStyle, type TextStyle } from 'react-native-web';

export type AlertVariant = 'default' | 'destructive';

export interface AlertProps {
  children: React.ReactNode;
  variant?: AlertVariant;
  style?: ViewStyle | ViewStyle[];
}

export interface AlertTitleProps {
  children: React.ReactNode;
  style?: ViewStyle | TextStyle | (ViewStyle | TextStyle)[];
}

export interface AlertDescriptionProps {
  children: React.ReactNode;
  style?: ViewStyle | TextStyle | (ViewStyle | TextStyle)[];
}

const alertStyles = StyleSheet.create({
  base: {
    width: '100%',
    borderRadius: 8,
    borderWidth: 1,
    padding: 16,
    position: 'relative',
  },
  default: {
    backgroundColor: '#ffffff',
    borderColor: '#e5e7eb',
  },
  destructive: {
    borderColor: 'rgba(239, 68, 68, 0.5)',
    backgroundColor: '#fef2f2',
  },
  title: {
    marginBottom: 4,
    fontWeight: '500',
    lineHeight: 20,
    letterSpacing: -0.2,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  destructiveText: {
    color: '#dc2626',
  },
});

export const Alert = React.forwardRef<any, AlertProps>(
  ({ children, variant = 'default', style }, ref) => {
    const alertStyle: ViewStyle[] = [
      alertStyles.base,
      alertStyles[variant],
    ];

    if (Array.isArray(style)) {
      alertStyle.push(...style);
    } else if (style) {
      alertStyle.push(style);
    }

    return (
      <View
        ref={ref}
        style={alertStyle}
        // @ts-ignore - role for web accessibility
        role="alert"
      >
        {children}
      </View>
    );
  }
);

Alert.displayName = 'Alert';

export const AlertTitle = React.forwardRef<any, AlertTitleProps>(
  ({ children, style }, ref) => {
    const titleStyle: (ViewStyle | TextStyle)[] = [alertStyles.title];

    if (Array.isArray(style)) {
      titleStyle.push(...style);
    } else if (style) {
      titleStyle.push(style);
    }

    return (
      <Text ref={ref} style={titleStyle}>
        {children}
      </Text>
    );
  }
);

AlertTitle.displayName = 'AlertTitle';

export const AlertDescription = React.forwardRef<any, AlertDescriptionProps>(
  ({ children, style, ...props }, ref) => {
    const descStyle: (ViewStyle | TextStyle)[] = [alertStyles.description];

    // Destructive variant text color is handled by parent Alert in most cases
    // This can be overridden with style prop if needed

    if (Array.isArray(style)) {
      descStyle.push(...style);
    } else if (style) {
      descStyle.push(style);
    }

    return (
      <Text ref={ref} style={descStyle}>
        {children}
      </Text>
    );
  }
);

AlertDescription.displayName = 'AlertDescription';
