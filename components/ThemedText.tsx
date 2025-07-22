import { useThemeStore } from '@/store/theme-store';
import Colors from '@/constants/colors';
import Theme from '@/constants/theme';
import React from 'react';
import { StyleProp, StyleSheet, Text, TextProps, TextStyle } from 'react-native';

type ColorKeys = 'text' | 'textSecondary' | 'subtext' | 'background' | 'backgroundSecondary' | 'tint' | 'icon' | 'tabIconDefault' | 'tabIconSelected' | 'border' | 'card' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'errorBackground' | 'info' | 'protein' | 'carbs' | 'fat';

interface ThemedTextProps extends TextProps {
  style?: StyleProp<TextStyle>;
  color?: ColorKeys;
  size?: keyof typeof Theme.typography.sizes;
  weight?: keyof typeof Theme.typography.weights;
}

export const ThemedText: React.FC<ThemedTextProps> = ({
  style,
  color = 'text',
  size = 'md',
  weight = 'regular',
  children,
  ...props
}) => {
  const { theme } = useThemeStore();
  
  return (
    <Text
      style={[
        {
          color: Colors[theme][color],
          fontSize: Theme.typography.sizes[size],
          fontWeight: Theme.typography.weights[weight],
        },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
};

export default ThemedText;