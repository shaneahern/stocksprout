/**
 * Cross-platform Button component using React Native Pressable
 * Replaces shadcn/ui Button with React Native Web compatible version
 */

import React from 'react';
import { Pressable, Text, StyleSheet, type ViewStyle, type TextStyle, ActivityIndicator } from 'react-native-web';
import type { PressableProps } from './primitives';

export type ButtonVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
export type ButtonSize = 'default' | 'sm' | 'lg' | 'icon';

export interface ButtonProps extends Omit<PressableProps, 'style'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle | ViewStyle[];
}

const buttonStyles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 5,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 29,
  },
  default: {
    backgroundColor: '#009538', // --primary color
  },
  destructive: {
    backgroundColor: '#dc2626',
  },
  outline: {
    borderWidth: 1,
    borderColor: '#C0C0C0',
    backgroundColor: 'transparent',
  },
  secondary: {
    backgroundColor: '#f3f4f6',
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  link: {
    backgroundColor: 'transparent',
    paddingHorizontal: 0,
    paddingVertical: 0,
    minHeight: 'auto',
    textDecorationLine: 'underline',
  },
  sizeDefault: {
    minHeight: 29,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sizeSm: {
    minHeight: 29,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  sizeLg: {
    minHeight: 44,
    paddingHorizontal: 32,
    paddingVertical: 12,
  },
  sizeIcon: {
    width: 40,
    height: 40,
    paddingHorizontal: 0,
    paddingVertical: 0,
    minHeight: 40,
  },
  text: {
    fontSize: 14,
    fontWeight: '500',
    color: '#161823',
  },
  textDefault: {
    color: '#ffffff',
  },
  textDestructive: {
    color: '#ffffff',
  },
  textOutline: {
    color: '#161823',
  },
  textSecondary: {
    color: '#161823',
  },
  textGhost: {
    color: '#161823',
  },
  textLink: {
    color: '#009538',
    textDecorationLine: 'underline',
  },
  disabled: {
    opacity: 0.5,
  },
});

const getVariantTextStyle = (variant: ButtonVariant): TextStyle => {
  switch (variant) {
    case 'default':
      return buttonStyles.textDefault;
    case 'destructive':
      return buttonStyles.textDestructive;
    case 'outline':
      return buttonStyles.textOutline;
    case 'secondary':
      return buttonStyles.textSecondary;
    case 'ghost':
      return buttonStyles.textGhost;
    case 'link':
      return buttonStyles.textLink;
    default:
      return buttonStyles.textDefault;
  }
};

const getSizeStyle = (size: ButtonSize): ViewStyle => {
  switch (size) {
    case 'sm':
      return buttonStyles.sizeSm;
    case 'lg':
      return buttonStyles.sizeLg;
    case 'icon':
      return buttonStyles.sizeIcon;
    default:
      return buttonStyles.sizeDefault;
  }
};

export const Button = React.forwardRef<any, ButtonProps>(
  ({ variant = 'default', size = 'default', children, disabled, loading, style, ...props }, ref) => {
    const baseStyle: ViewStyle[] = [
      buttonStyles.base,
      buttonStyles[variant],
      getSizeStyle(size),
    ];

    if (disabled) {
      baseStyle.push(buttonStyles.disabled);
    }

    if (Array.isArray(style)) {
      baseStyle.push(...style);
    } else if (style) {
      baseStyle.push(style);
    }

    const textStyle: TextStyle[] = [
      buttonStyles.text,
      getVariantTextStyle(variant),
    ];

    const isLink = variant === 'link';

    return (
      <Pressable
        ref={ref}
        style={({ pressed }: { pressed: boolean }) => [
          ...baseStyle,
          pressed && !disabled && !isLink && { opacity: 0.8 },
        ]}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <ActivityIndicator 
            size="small" 
            color={variant === 'default' || variant === 'destructive' ? '#ffffff' : '#161823'} 
          />
        ) : typeof children === 'string' ? (
          <Text style={textStyle}>{children}</Text>
        ) : (
          children
        )}
      </Pressable>
    );
  }
);

Button.displayName = 'Button';
