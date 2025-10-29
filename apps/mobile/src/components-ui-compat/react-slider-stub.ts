/**
 * React Native stub for @radix-ui/react-slider
 * Provides minimal API compatibility for mobile bundling
 */

import React from 'react';
import { View, type ViewProps } from 'react-native';

export const Root = React.forwardRef<View, ViewProps>((props, ref) => {
  return React.createElement(View, { ref, ...props });
});

Root.displayName = 'Slider';

export const Track = Root;
export const Range = Root;
export const Thumb = Root;

export default {
  Root,
  Track,
  Range,
  Thumb,
};
