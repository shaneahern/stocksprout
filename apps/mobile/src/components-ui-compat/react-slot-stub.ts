/**
 * Stub for @radix-ui/react-slot
 * Prevents Radix UI from being loaded in React Native
 * 
 * Slot is used for composition - in React Native we just pass children through
 */
import React from 'react';

export const Slot = React.forwardRef<any, { children?: React.ReactNode; [key: string]: any }>(
  ({ children, ...props }, ref) => {
    // In React Native, Slot just passes children through
    // The asChild pattern from Radix UI doesn't apply the same way
    return React.isValidElement(children) 
      ? React.cloneElement(children, { ref, ...props })
      : <>{children}</>;
  }
);

Slot.displayName = 'Slot';
