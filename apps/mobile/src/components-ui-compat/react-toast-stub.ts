/**
 * Stub for @radix-ui/react-toast
 * Prevents Radix UI from being loaded in React Native
 */
import React from 'react';

export const Provider = ({ children }: { children?: React.ReactNode }) => React.createElement(React.Fragment, null, children);
export const Viewport = ({ children }: { children?: React.ReactNode }) => React.createElement(React.Fragment, null, children);
export const Root = ({ children }: { children?: React.ReactNode }) => React.createElement(React.Fragment, null, children);
export const Title = ({ children }: { children?: React.ReactNode }) => React.createElement(React.Fragment, null, children);
export const Description = ({ children }: { children?: React.ReactNode }) => React.createElement(React.Fragment, null, children);
export const Action = ({ children }: { children?: React.ReactNode }) => React.createElement(React.Fragment, null, children);
export const Close = ({ children }: { children?: React.ReactNode }) => React.createElement(React.Fragment, null, children);

export default {
  Provider,
  Viewport,
  Root,
  Title,
  Description,
  Action,
  Close,
};
