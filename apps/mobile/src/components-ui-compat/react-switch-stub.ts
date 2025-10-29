/**
 * React Native stub for @radix-ui/react-switch
 * Provides minimal API compatibility for mobile bundling
 */

import React from 'react';
import { View, type ViewProps } from 'react-native';

export const Root = React.forwardRef<View, ViewProps>((props, ref) => {
  return React.createElement(View, { ref, ...props });
});

Root.displayName = 'Switch';

export const Thumb = Root;

export default {
  Root,
  Thumb,
};
