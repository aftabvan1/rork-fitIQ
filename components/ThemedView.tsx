import { useThemeStore } from '@/store/theme-store';
import Colors from '@/constants/colors';
import Theme from '@/constants/theme';
import React from 'react';
import { StyleProp, StyleSheet, View, ViewProps, ViewStyle } from 'react-native';

interface ThemedViewProps extends ViewProps {
  style?: StyleProp<ViewStyle>;
  backgroundColor?: keyof typeof Colors.light | keyof typeof Colors.dark;
  shadow?: 'sm' | 'md' | 'lg' | 'none';
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'full';
}

export const ThemedView: React.FC<ThemedViewProps> = ({
  style,
  backgroundColor = 'background',
  shadow = 'none',
  rounded = 'md',
  children,
  ...props
}) => {
  const { theme } = useThemeStore();
  
  const getShadowStyle = () => {
    if (shadow === 'none') return {};
    return Theme.shadows[theme][shadow];
  };
  
  const getBorderRadius = () => {
    return Theme.borderRadius[rounded];
  };
  
  return (
    <View
      style={[
        {
          backgroundColor: Colors[theme][backgroundColor],
          borderRadius: getBorderRadius(),
        },
        getShadowStyle(),
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
};

export default ThemedView;