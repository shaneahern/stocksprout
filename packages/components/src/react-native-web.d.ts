declare module 'react-native-web' {
  import * as React from 'react';
  import * as ReactNative from 'react-native';

  export const View: typeof ReactNative.View;
  export const Text: typeof ReactNative.Text;
  export const ScrollView: typeof ReactNative.ScrollView;
  export const Pressable: typeof ReactNative.Pressable;
  export const TextInput: typeof ReactNative.TextInput;
  export const Modal: typeof ReactNative.Modal;
  export const StyleSheet: typeof ReactNative.StyleSheet;
  export const ActivityIndicator: typeof ReactNative.ActivityIndicator;
  
  export type ViewStyle = ReactNative.ViewStyle;
  export type TextStyle = ReactNative.TextStyle;
  export type TextInputProps = ReactNative.TextInputProps;
}
