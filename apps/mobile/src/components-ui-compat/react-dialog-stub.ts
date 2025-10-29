/**
 * Stub for @radix-ui/react-dialog
 * Prevents Radix UI from being loaded in React Native
 * 
 * Dialog components are handled by our compatibility layers
 */
import React from 'react';
import { View } from 'react-native';

export const Root = ({ children }: { children?: React.ReactNode }) => React.createElement(React.Fragment, null, children);
export const Trigger = ({ children }: { children?: React.ReactNode }) => React.createElement(React.Fragment, null, children);
export const Portal = ({ children }: { children?: React.ReactNode }) => React.createElement(React.Fragment, null, children);
export const Overlay = ({ children }: { children?: React.ReactNode }) => React.createElement(View, null, children);
export const Content = ({ children }: { children?: React.ReactNode }) => React.createElement(View, null, children);
export const Close = ({ children }: { children?: React.ReactNode }) => React.createElement(React.Fragment, null, children);
export const Title = ({ children }: { children?: React.ReactNode }) => React.createElement(React.Fragment, null, children);
export const Description = ({ children }: { children?: React.ReactNode }) => React.createElement(React.Fragment, null, children);
