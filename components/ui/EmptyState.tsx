// ============================================================
// EmptyState — Illustrated empty state component
// ============================================================
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { FontSize, FontWeight, Spacing } from '../../constants/theme';
import { Button } from './Button';

interface EmptyStateProps {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  subtitle: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon,
  title,
  subtitle,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: theme.isDark ? 'rgba(91,164,208,0.1)' : 'rgba(45,106,159,0.06)' },
        ]}
      >
        <Feather name={icon} size={40} color={theme.colors.primary} />
      </View>
      <Text style={[styles.title, { color: theme.colors.textPrimary }]}>{title}</Text>
      <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>{subtitle}</Text>
      {actionLabel && onAction && (
        <Button
          label={actionLabel}
          onPress={onAction}
          variant="primary"
          size="md"
          fullWidth
          style={styles.button}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing['3xl'],
  },
  iconContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: FontSize.base,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.xl,
  },
  button: {
    width: '100%',
    maxWidth: 320,
  },
});
