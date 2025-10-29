/**
 * React Native stub for @radix-ui/react-radio-group
 * Provides minimal API compatibility for mobile bundling
 */

import React from 'react';
import { View, type ViewProps } from 'react-native';

export const Root = React.forwardRef<View, ViewProps>((props, ref) => {
  return React.createElement(View, { ref, ...props });
});

Root.displayName = 'RadioGroup';

export const Item = Root;
export const Indicator = Root;

export default {
  Root,
  Item,
  Indicator,
};
