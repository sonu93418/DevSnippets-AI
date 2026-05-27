// ============================================================
// Card — Elevated surface with Scandinavian shadow & borders
// ============================================================
import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { BorderRadius } from '../../constants/theme';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  elevated?: boolean;
  padding?: number;
  noBorder?: boolean;
}

export function Card({
  children,
  style,
  elevated = false,
  padding = 16,
  noBorder = false,
}: CardProps) {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.base,
        {
          backgroundColor: theme.colors.surface,
          borderColor: noBorder ? 'transparent' : theme.colors.border,
          borderRadius: BorderRadius.lg,
          padding,
          ...(elevated ? theme.shadow.md : theme.shadow.sm),
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: 1,
    overflow: 'hidden',
  },
});
