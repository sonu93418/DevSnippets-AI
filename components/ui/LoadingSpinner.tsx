// ============================================================
// LoadingSpinner — Centered activity indicator
// ============================================================
import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { FontSize, Spacing } from '../../constants/theme';

interface LoadingSpinnerProps {
  label?: string;
  size?: 'small' | 'large';
  fullScreen?: boolean;
}

export function LoadingSpinner({
  label,
  size = 'large',
  fullScreen = false,
}: LoadingSpinnerProps) {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, fullScreen && styles.fullScreen]}>
      <ActivityIndicator size={size} color={theme.colors.primary} />
      {label && (
        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
          {label}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  fullScreen: {
    flex: 1,
  },
  label: {
    fontSize: FontSize.sm,
    marginTop: Spacing.sm,
  },
});
