/**
 * Stub for @radix-ui/react-slot
 * Prevents Radix UI from being loaded in React Native
 * 
 * Slot is used for composition - in React Native we just pass children through
 */
import React from 'react';

interface SlotProps {
  children?: React.ReactNode;
  [key: string]: any;
}

export const Slot = React.forwardRef<any, SlotProps>(
  ({ children, ...props }, ref) => {
    return React.isValidElement(children) 
      ? React.cloneElement(children, { ref, ...props })
      : React.createElement(React.Fragment, null, children);
  }
);

Slot.displayName = 'Slot';

export default {
  Slot,
};
