/**
 * Stub for @radix-ui/react-toggle-group
 * Prevents Radix UI from being loaded in React Native
 */
import React from 'react';

export const Root = React.forwardRef<any, { children?: React.ReactNode; [key: string]: any }>(
  ({ children, ...props }, ref) => <>{children}</>
);

export default {
  Root,
};
