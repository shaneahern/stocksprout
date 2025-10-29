/**
 * Cross-platform Modal component using React Native Modal
 * Replaces shadcn/ui Dialog with React Native Web compatible version
 */

import React from 'react';
import { Modal as RNModal, View, Pressable, StyleSheet, type ViewStyle } from 'react-native-web';
import { Text } from './primitives';
import { Button } from './button';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  showCloseButton?: boolean;
}

export interface ModalContentProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
}

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 24,
    minWidth: 400,
    maxWidth: '90%',
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#161823',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export const Modal: React.FC<ModalProps> = ({ 
  open, 
  onClose, 
  children, 
  title, 
  showCloseButton = true 
}) => {
  return (
    <RNModal
      visible={open}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable 
        style={modalStyles.overlay} 
        onPress={onClose}
      >
        <Pressable 
          style={modalStyles.content}
          onPress={(e: any) => e.stopPropagation()}
        >
          {(title || showCloseButton) && (
            <View style={modalStyles.header}>
              {title && <Text style={modalStyles.title}>{title}</Text>}
              {showCloseButton && (
                <Pressable 
                  onPress={onClose}
                  style={modalStyles.closeButton}
                >
                  <Text style={{ fontSize: 18, color: '#6b7280' }}>×</Text>
                </Pressable>
              )}
            </View>
          )}
          {children}
        </Pressable>
      </Pressable>
    </RNModal>
  );
};

Modal.displayName = 'Modal';
