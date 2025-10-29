/**
 * Cross-platform Checkbox component using React Native Pressable
 * Replaces shadcn/ui Checkbox with React Native Web compatible version
 */

import React from 'react';
import { Pressable, View, Text, StyleSheet, type ViewStyle } from 'react-native-web';

export interface CheckboxProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  style?: ViewStyle | ViewStyle[];
  id?: string;
}

const checkboxStyles = StyleSheet.create({
  base: {
    width: 16,
    height: 16,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: '#009538',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  checked: {
    backgroundColor: '#009538',
  },
  disabled: {
    opacity: 0.5,
  },
  checkmark: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
    lineHeight: 16,
  },
});

export const Checkbox = React.forwardRef<any, CheckboxProps>(
  ({ checked = false, onCheckedChange, disabled, style, id }, ref) => {
    const checkboxStyle: ViewStyle[] = [checkboxStyles.base];

    if (checked) {
      checkboxStyle.push(checkboxStyles.checked);
    }

    if (disabled) {
      checkboxStyle.push(checkboxStyles.disabled);
    }

    if (Array.isArray(style)) {
      checkboxStyle.push(...style);
    } else if (style) {
      checkboxStyle.push(style);
    }

    const handlePress = () => {
      if (!disabled && onCheckedChange) {
        onCheckedChange(!checked);
      }
    };

    return (
      <Pressable
        ref={ref}
        style={({ pressed }: { pressed: boolean }) => [
          ...checkboxStyle,
          pressed && !disabled && { opacity: 0.7 },
        ]}
        onPress={handlePress}
        disabled={disabled}
        // @ts-ignore - id and accessibility for web
        id={id}
        role="checkbox"
        aria-checked={checked}
        aria-disabled={disabled}
      >
        {checked && (
          <Text style={checkboxStyles.checkmark}>✓</Text>
        )}
      </Pressable>
    );
  }
);

Checkbox.displayName = 'Checkbox';
