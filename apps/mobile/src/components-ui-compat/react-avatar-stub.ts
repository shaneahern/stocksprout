/**
 * Stub for @radix-ui/react-avatar
 * Provides minimal API surface to prevent import errors
 */
import React from 'react';
import { View, Text, Image as RNImage } from 'react-native';

export const Root = ({ children, className, ...props }: any) => {
  return React.createElement(View, props, children);
};

export const Avatar = Root;

export const AvatarImage = ({ src, alt, className, ...props }: any) => {
  if (src) {
    return React.createElement(RNImage, { source: { uri: src }, ...props });
  }
  return null;
};

export const Image = AvatarImage;

export const Fallback = ({ children, className, ...props }: any) => {
  return React.createElement(View, props, children);
};

export const AvatarFallback = Fallback;
