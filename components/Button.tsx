import { useThemeStore } from '@/store/theme-store';
import Colors from '@/constants/colors';
import Theme from '@/constants/theme';
import React from 'react';
import { ActivityIndicator, Pressable, StyleProp, StyleSheet, TextStyle, View, ViewStyle } from 'react-native';
import ThemedText from './ThemedText';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'text';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  style,
  textStyle,
  leftIcon,
  rightIcon,
}) => {
  const { theme } = useThemeStore();
  
  const getButtonStyles = () => {
    const baseStyle: ViewStyle = {
      borderRadius: Theme.borderRadius.full,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      paddingHorizontal: Theme.spacing.xl,
      ...Theme.shadows[theme].md,
    };
    
    // Size styles
    switch (size) {
      case 'sm':
        baseStyle.height = 44;
        baseStyle.paddingHorizontal = Theme.spacing.lg;
        break;
      case 'lg':
        baseStyle.height = 64;
        baseStyle.paddingHorizontal = Theme.spacing.xxl;
        break;
      case 'md':
      default:
        baseStyle.height = 56;
        break;
    }
    
    // Variant styles
    switch (variant) {
      case 'secondary':
        baseStyle.backgroundColor = Colors[theme].secondary;
        break;
      case 'outline':
        baseStyle.backgroundColor = Colors[theme].background;
        baseStyle.borderWidth = 2;
        baseStyle.borderColor = Colors[theme].primary;
        break;
      case 'text':
        baseStyle.backgroundColor = 'transparent';
        baseStyle.shadowOpacity = 0;
        baseStyle.elevation = 0;
        break;
      case 'primary':
      default:
        baseStyle.backgroundColor = Colors[theme].primary;
        break;
    }
    
    // Disabled state
    if (disabled || loading) {
      baseStyle.opacity = 0.6;
      baseStyle.shadowOpacity = 0.05;
    }
    
    return baseStyle;
  };
  
  const getTextColor = (): keyof typeof Colors.light => {
    switch (variant) {
      case 'outline':
      case 'text':
        return 'primary';
      case 'primary':
      case 'secondary':
      default:
        return theme === 'light' ? 'background' : 'text';
    }
  };
  
  return (
    <Pressable
      style={({ pressed }) => [
        getButtonStyles(),
        pressed && { transform: [{ scale: 0.98 }] },
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      android_ripple={{ color: 'rgba(0, 0, 0, 0.1)' }}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' || variant === 'secondary' ? Colors[theme].background : Colors[theme].primary}
          size="small"
        />
      ) : (
        <>
          {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}
          <ThemedText
            color={getTextColor()}
            weight="semibold"
            style={[
              size === 'sm' ? { fontSize: 14 } : size === 'lg' ? { fontSize: 18 } : { fontSize: 16 },
              textStyle,
            ]}
          >
            {title}
          </ThemedText>
          {rightIcon && <View style={styles.iconRight}>{rightIcon}</View>}
        </>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
});

export default Button;