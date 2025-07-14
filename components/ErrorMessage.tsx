import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { AlertCircle, X } from 'lucide-react-native';
import Colors from '@/constants/colors';

interface ErrorMessageProps {
  message: string;
  onDismiss?: () => void;
  action?: {
    label: string;
    onPress: () => void;
  };
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ 
  message, 
  onDismiss, 
  action 
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <AlertCircle size={20} color={Colors.error} />
        <Text style={styles.message}>{message}</Text>
      </View>
      
      <View style={styles.actions}>
        {action && (
          <TouchableOpacity style={styles.actionButton} onPress={action.onPress}>
            <Text style={styles.actionText}>{action.label}</Text>
          </TouchableOpacity>
        )}
        
        {onDismiss && (
          <TouchableOpacity style={styles.dismissButton} onPress={onDismiss}>
            <X size={16} color={Colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.errorBackground,
    borderColor: Colors.error,
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    margin: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  message: {
    flex: 1,
    fontSize: 14,
    color: Colors.error,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    backgroundColor: Colors.error,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  actionText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  dismissButton: {
    padding: 4,
  },
});