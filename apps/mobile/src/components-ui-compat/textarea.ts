/**
 * Compatibility layer: redirect @/components/ui/textarea to @stocksprout/components TextInput
 * TextArea is just a multi-line TextInput
 */
import React from 'react';
import { TextInput, type TextInputProps } from '@stocksprout/components';

export const Textarea = React.forwardRef<any, TextInputProps & { rows?: number }>(
  ({ rows = 4, ...props }, ref) => {
    return (
      <TextInput
        ref={ref}
        multiline
        numberOfLines={rows}
        style={{ minHeight: rows * 20 }}
        {...props}
      />
    );
  }
);

Textarea.displayName = 'Textarea';
