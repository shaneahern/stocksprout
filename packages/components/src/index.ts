/**
 * @stocksprout/components
 * Cross-platform UI component library using React Native Web
 */

// Primitives (export View, Text, ScrollView, Pressable, StyleSheet)
export { 
  View, 
  Text, 
  ScrollView, 
  Pressable, 
  SafeAreaView,
  StyleSheet,
  type ViewProps,
  type TextProps,
  type ScrollViewProps,
  type PressableProps,
  type ViewStyle,
  type TextStyle,
} from './primitives';

// Core Components
export { Button, type ButtonProps, type ButtonVariant, type ButtonSize } from './button';
export { TextInput, type TextInputProps } from './text-input';
export { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter,
  type CardProps,
  type CardHeaderProps,
  type CardTitleProps,
  type CardDescriptionProps,
  type CardContentProps,
  type CardFooterProps,
} from './card';
export { Modal, type ModalProps, type ModalContentProps } from './modal';
export { Label, type LabelProps } from './label';
export { 
  Alert, 
  AlertTitle, 
  AlertDescription,
  type AlertProps,
  type AlertTitleProps,
  type AlertDescriptionProps,
  type AlertVariant,
} from './alert';
export { Checkbox, type CheckboxProps } from './checkbox';
