/**
 * React Native stub for @radix-ui/react-label
 * Provides minimal API compatibility for mobile bundling
 */

import React from 'react';
import { Text, type TextProps } from 'react-native';

export const Root = React.forwardRef<Text, TextProps>((props, ref) => {
  return React.createElement(Text, { ref, ...props });
});

Root.displayName = 'Label';

export default {
  Root,
};
