/**
 * Compatibility layer: redirect @/components/ui/dialog to React Native Modal
 * This prevents Radix UI (web-only) from being loaded in React Native
 */
import React from 'react';
import { Modal, View, Text } from '@stocksprout/components';

// Simple Dialog wrapper using Modal
export const Dialog: React.FC<{ open?: boolean; onOpenChange?: (open: boolean) => void; children?: React.ReactNode }> = ({ 
  open, 
  onOpenChange, 
  children 
}) => {
  return (
    <Modal 
      open={open || false} 
      onClose={() => onOpenChange?.(false)}
    >
      {children}
    </Modal>
  );
};

// DialogContent renders children directly (Modal handles the container)
export const DialogContent = React.forwardRef<any, { children?: React.ReactNode; className?: string }>(
  ({ children, ...props }, ref) => <>{children}</>
);

// Simple wrappers for dialog sub-components
export const DialogHeader = ({ children, ...props }: any) => <View {...props}>{children}</View>;
export const DialogFooter = ({ children, ...props }: any) => <View {...props}>{children}</View>;
export const DialogTitle = ({ children, ...props }: any) => <Text {...props}>{children}</Text>;
export const DialogDescription = ({ children, ...props }: any) => <Text {...props}>{children}</Text>;
export const DialogTrigger = ({ children, ...props }: any) => <>{children}</>;
export const DialogClose = ({ children, ...props }: any) => <>{children}</>;
export const DialogOverlay = ({ children, ...props }: any) => <>{children}</>;
export const DialogPortal = ({ children, ...props }: any) => <>{children}</>;
