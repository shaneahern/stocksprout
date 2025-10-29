/**
 * Stub for @radix-ui/react-tooltip
 * Prevents Radix UI from being loaded in React Native
 */
import React from 'react';

export const Root = ({ children }: { children?: React.ReactNode }) => React.createElement(React.Fragment, null, children);
export const Trigger = ({ children }: { children?: React.ReactNode }) => React.createElement(React.Fragment, null, children);
export const Portal = ({ children }: { children?: React.ReactNode }) => React.createElement(React.Fragment, null, children);
export const Provider = ({ children }: { children?: React.ReactNode }) => React.createElement(React.Fragment, null, children);
export const Content = ({ children }: { children?: React.ReactNode }) => React.createElement(React.Fragment, null, children);
export const Arrow = ({ children }: { children?: React.ReactNode }) => React.createElement(React.Fragment, null, children);

export default {
  Root,
  Trigger,
  Portal,
  Provider,
  Content,
  Arrow,
};
