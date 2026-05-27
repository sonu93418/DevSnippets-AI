// ============================================================
// Input — Scandinavian clean text input
// ============================================================
import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { BorderRadius, FontSize, FontWeight, Spacing } from '../../constants/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  icon?: keyof typeof Feather.glyphMap;
  rightIcon?: keyof typeof Feather.glyphMap;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
  hint?: string;
}

export function Input({
  label,
  error,
  icon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  hint,
  style,
  ...rest
}: InputProps) {
  const { theme } = useTheme();
  const [focused, setFocused] = useState(false);

  const borderColor = error
    ? '#DC2626'
    : focused
    ? theme.colors.primary
    : theme.colors.border;

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text
          style={[
            styles.label,
            { color: theme.colors.textSecondary, fontWeight: FontWeight.medium },
          ]}
        >
          {label}
        </Text>
      )}
      <View
        style={[
          styles.inputWrapper,
          {
            backgroundColor: theme.colors.surface,
            borderColor,
            borderRadius: BorderRadius.md,
          },
        ]}
      >
        {icon && (
          <Feather
            name={icon}
            size={16}
            color={focused ? theme.colors.primary : theme.colors.textTertiary}
            style={styles.leftIcon}
          />
        )}
        <TextInput
          {...rest}
          style={[
            styles.input,
            {
              color: theme.colors.textPrimary,
              fontSize: FontSize.base,
              paddingLeft: icon ? 0 : Spacing.base,
            },
            style,
          ]}
          placeholderTextColor={theme.colors.textTertiary}
          onFocus={(e) => {
            setFocused(true);
            rest.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            rest.onBlur?.(e);
          }}
        />
        {rightIcon && (
          <TouchableOpacity onPress={onRightIconPress} style={styles.rightIcon}>
            <Feather
              name={rightIcon}
              size={16}
              color={theme.colors.textTertiary}
            />
          </TouchableOpacity>
        )}
      </View>
      {error && (
        <Text style={[styles.error, { color: '#DC2626' }]}>{error}</Text>
      )}
      {hint && !error && (
        <Text style={[styles.hint, { color: theme.colors.textTertiary }]}>{hint}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.base,
  },
  label: {
    fontSize: FontSize.sm,
    marginBottom: 6,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    minHeight: 48,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingRight: Spacing.base,
    fontFamily: 'System',
  },
  leftIcon: {
    paddingHorizontal: Spacing.md,
  },
  rightIcon: {
    padding: Spacing.md,
  },
  error: {
    fontSize: FontSize.xs,
    marginTop: 4,
  },
  hint: {
    fontSize: FontSize.xs,
    marginTop: 4,
  },
});
