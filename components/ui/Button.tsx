// ============================================================
// Button — Scandinavian Clean Design Component
// ============================================================
import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { BorderRadius, FontSize, FontWeight, Spacing } from '../../constants/theme';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  icon?: keyof typeof Feather.glyphMap;
  iconPosition?: 'left' | 'right';
  style?: ViewStyle;
  fullWidth?: boolean;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  style,
  fullWidth = false,
}: ButtonProps) {
  const { theme } = useTheme();

  const sizeStyles = {
    // Standard touch targets: sm=36, md=44, lg=52
    sm: { paddingVertical: 6, paddingHorizontal: 12, fontSize: FontSize.sm, iconSize: 14, minHeight: 36 },
    md: { paddingVertical: 10, paddingHorizontal: 16, fontSize: FontSize.base, iconSize: 16, minHeight: 44 },
    lg: { paddingVertical: 14, paddingHorizontal: 20, fontSize: FontSize.md, iconSize: 18, minHeight: 52 },
  }[size];

  const variantStyles: Record<ButtonVariant, { bg: string; text: string; border?: string }> = {
    primary: { bg: theme.colors.primary, text: '#FFFFFF' },
    secondary: { bg: theme.colors.surface, text: theme.colors.textPrimary, border: theme.colors.border },
    ghost: { bg: 'transparent', text: theme.colors.primary },
    danger: { bg: theme.colors.danger, text: '#FFFFFF' },
    outline: { bg: 'transparent', text: theme.colors.primary, border: theme.colors.primary },
  };

  const vs = variantStyles[variant];
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.75}
      style={[
        styles.base,
        {
          backgroundColor: vs.bg,
          borderWidth: vs.border ? 1.5 : 0,
          borderColor: vs.border ?? 'transparent',
          paddingVertical: sizeStyles.paddingVertical,
          paddingHorizontal: sizeStyles.paddingHorizontal,
          opacity: isDisabled ? 0.5 : 1,
          borderRadius: BorderRadius.xl,
          width: fullWidth ? '100%' : undefined,
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
          minHeight: sizeStyles.minHeight ?? 44,
          ...(variant === 'primary' || variant === 'danger' ? theme.shadow.sm : {}),
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={vs.text} />
      ) : (
        <View style={styles.content}>
          {icon && iconPosition === 'left' && (
            <Feather
              name={icon}
              size={sizeStyles.iconSize}
              color={vs.text}
              style={styles.iconLeft}
            />
          )}
          <Text style={[styles.label, { color: vs.text, fontSize: sizeStyles.fontSize }]}>
            {label}
          </Text>
          {icon && iconPosition === 'right' && (
            <Feather
              name={icon}
              size={sizeStyles.iconSize}
              color={vs.text}
              style={styles.iconRight}
            />
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  label: {
    fontWeight: FontWeight.semibold,
    letterSpacing: 0.1,
    flexShrink: 1,
  },
  iconLeft: {
    marginRight: 6,
  },
  iconRight: {
    marginLeft: 6,
  },
});
