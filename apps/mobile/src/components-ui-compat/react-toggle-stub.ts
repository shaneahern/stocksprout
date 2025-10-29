/**
 * Stub for @radix-ui/react-toggle
 * Prevents Radix UI from being loaded in React Native
 */
import React from 'react';

export const Root = React.forwardRef<any, { children?: React.ReactNode; [key: string]: any }>(
  ({ children, ...props }, ref) => React.createElement(React.Fragment, null, children)
);

export default {
  Root,
};
