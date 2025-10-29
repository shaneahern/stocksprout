/**
 * Cross-platform TextInput component using React Native TextInput
 * Replaces shadcn/ui Input with React Native Web compatible version
 */

import React, { useState } from 'react';
import { TextInput as RNTextInput, StyleSheet, type ViewStyle, type TextStyle } from 'react-native-web';
import type { TextInputProps as RNTextInputProps } from 'react-native-web';

export interface TextInputProps extends Omit<RNTextInputProps, 'style'> {
  style?: ViewStyle | TextStyle | (ViewStyle | TextStyle)[];
}

const inputStyles = StyleSheet.create({
  base: {
    height: 30.19,
    width: '100%',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#C0C0C0',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 10,
    fontWeight: '300',
    color: '#161823',
  },
  focus: {
    borderColor: '#009538',
    borderWidth: 2,
  },
  disabled: {
    opacity: 0.5,
  },
});

export const TextInput = React.forwardRef<typeof RNTextInput, TextInputProps>(
  ({ style, onFocus, onBlur, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);

    const inputStyle: (ViewStyle | TextStyle)[] = [
      inputStyles.base,
      isFocused && inputStyles.focus,
      props.disabled && inputStyles.disabled,
    ];

    if (Array.isArray(style)) {
      inputStyle.push(...style);
    } else if (style) {
      inputStyle.push(style);
    }

    return (
      <RNTextInput
        ref={ref}
        style={inputStyle}
        onFocus={(e: any) => {
          setIsFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e: any) => {
          setIsFocused(false);
          onBlur?.(e);
        }}
        placeholderTextColor="rgba(22, 24, 35, 0.5)"
        {...props}
      />
    );
  }
);

TextInput.displayName = 'TextInput';
