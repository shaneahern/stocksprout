/**
 * React Native stub for @radix-ui/react-select
 * Provides minimal API compatibility for mobile bundling
 */

import React from 'react';
import { View, Text, type ViewProps, type TextProps } from 'react-native';

export const Root = React.forwardRef<View, ViewProps>((props, ref) => {
  return React.createElement(View, { ref, ...props });
});

Root.displayName = 'Select';

export const Trigger = Root;
export const Value = React.forwardRef<Text, TextProps>((props, ref) => {
  return React.createElement(Text, { ref, ...props });
});
export const Icon = Root;
export const Portal = Root;
export const Content = Root;
export const Viewport = Root;
export const Item = Root;
export const ItemText = Value;
export const ItemIndicator = Root;
export const ScrollUpButton = Root;
export const ScrollDownButton = Root;
export const Group = Root;
export const Label = Value;
export const Separator = Root;

export default {
  Root,
  Trigger,
  Value,
  Icon,
  Portal,
  Content,
  Viewport,
  Item,
  ItemText,
  ItemIndicator,
  ScrollUpButton,
  ScrollDownButton,
  Group,
  Label,
  Separator,
};
