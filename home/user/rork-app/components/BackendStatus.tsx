import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { AlertCircle, CheckCircle, RefreshCw } from 'lucide-react-native';
import { trpcClient } from '@/lib/trpc';

interface BackendStatusProps {
  onRetry?: () => void;
}

export function BackendStatus({ onRetry }: BackendStatusProps) {
  const [status, setStatus] = useState<{
    available: boolean;
    error?: string;
    checking: boolean;
  }>({ available: false, checking: true });

  const checkStatus = async () => {
    setStatus(prev => ({ ...prev, checking: true }));
    try {
      const result = await trpcClient.health.query();
      setStatus({
        available: true,
        error: undefined,
        checking: false,
      });
    } catch (error) {
      setStatus({
        available: false,
        error: error instanceof Error ? error.message : 'Backend connection failed',
        checking: false,
      });
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  const handleRetry = () => {
    checkStatus();
    onRetry?.();
  };

  if (status.checking) {
    return (
      <View style={styles.container}>
        <RefreshCw size={16} color="#666" />
        <Text style={styles.text}>Checking backend connection...</Text>
      </View>
    );
  }

  if (status.available) {
    return (
      <View style={[styles.container, styles.success]}>
        <CheckCircle size={16} color="#22c55e" />
        <Text style={[styles.text, styles.successText]}>Backend connected</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, styles.error]}>
      <AlertCircle size={16} color="#ef4444" />
      <Text style={[styles.text, styles.errorText]}>
        Backend unavailable: {status.error}
      </Text>
      <TouchableOpacity onPress={handleRetry} style={styles.retryButton}>
        <RefreshCw size={14} color="#ef4444" />
        <Text style={styles.retryText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    margin: 16,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    gap: 8,
  },
  success: {
    backgroundColor: '#dcfce7',
    borderColor: '#22c55e',
    borderWidth: 1,
  },
  error: {
    backgroundColor: '#fef2f2',
    borderColor: '#ef4444',
    borderWidth: 1,
  },
  text: {
    flex: 1,
    fontSize: 14,
    color: '#666',
  },
  successText: {
    color: '#16a34a',
  },
  errorText: {
    color: '#dc2626',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  retryText: {
    fontSize: 12,
    color: '#ef4444',
    fontWeight: '500',
  },
});