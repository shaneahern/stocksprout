/**
 * Cross-platform Card component using React Native View
 * Replaces shadcn/ui Card with React Native Web compatible version
 */

import React from 'react';
import { View, Text, StyleSheet, type ViewStyle, type TextStyle } from 'react-native-web';

export interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
}

export interface CardHeaderProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
}

export interface CardTitleProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
}

export interface CardDescriptionProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
}

export interface CardContentProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
}

export interface CardFooterProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
}

const cardStyles = StyleSheet.create({
  card: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  header: {
    flexDirection: 'column',
    padding: 24,
    gap: 6,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 32,
    letterSpacing: -0.5,
    color: '#161823',
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
  },
  content: {
    padding: 24,
    paddingTop: 0,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    paddingTop: 0,
  },
});

export const Card = React.forwardRef<typeof View, CardProps>(({ children, style }, ref) => {
  const cardStyle: ViewStyle[] = [cardStyles.card];
  
  if (Array.isArray(style)) {
    cardStyle.push(...style);
  } else if (style) {
    cardStyle.push(style);
  }

  return (
    <View ref={ref} style={cardStyle}>
      {children}
    </View>
  );
});

Card.displayName = 'Card';

export const CardHeader = React.forwardRef<typeof View, CardHeaderProps>(({ children, style }, ref) => {
  const headerStyle: ViewStyle[] = [cardStyles.header];
  
  if (Array.isArray(style)) {
    headerStyle.push(...style);
  } else if (style) {
    headerStyle.push(style);
  }

  return (
    <View ref={ref} style={headerStyle}>
      {children}
    </View>
  );
});

CardHeader.displayName = 'CardHeader';

export const CardTitle = React.forwardRef<Text, CardTitleProps>(({ children, style }, ref) => {
  const titleStyle: (ViewStyle | TextStyle)[] = [cardStyles.title];
  
  if (Array.isArray(style)) {
    titleStyle.push(...style);
  } else if (style) {
    titleStyle.push(style);
  }

  return (
    <Text ref={ref} style={titleStyle}>
      {children}
    </Text>
  );
});

CardTitle.displayName = 'CardTitle';

export const CardDescription = React.forwardRef<Text, CardDescriptionProps>(({ children, style }, ref) => {
  const descStyle: (ViewStyle | TextStyle)[] = [cardStyles.description];
  
  if (Array.isArray(style)) {
    descStyle.push(...style);
  } else if (style) {
    descStyle.push(style);
  }

  return (
    <Text ref={ref} style={descStyle}>
      {children}
    </Text>
  );
});

CardDescription.displayName = 'CardDescription';

export const CardContent = React.forwardRef<typeof View, CardContentProps>(({ children, style }, ref) => {
  const contentStyle: ViewStyle[] = [cardStyles.content];
  
  if (Array.isArray(style)) {
    contentStyle.push(...style);
  } else if (style) {
    contentStyle.push(style);
  }

  return (
    <View ref={ref} style={contentStyle}>
      {children}
    </View>
  );
});

CardContent.displayName = 'CardContent';

export const CardFooter = React.forwardRef<typeof View, CardFooterProps>(({ children, style }, ref) => {
  const footerStyle: ViewStyle[] = [cardStyles.footer];
  
  if (Array.isArray(style)) {
    footerStyle.push(...style);
  } else if (style) {
    footerStyle.push(style);
  }

  return (
    <View ref={ref} style={footerStyle}>
      {children}
    </View>
  );
});

CardFooter.displayName = 'CardFooter';
