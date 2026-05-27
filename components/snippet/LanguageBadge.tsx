// ============================================================
// LanguageBadge — Color-coded language pill
// ============================================================
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getLanguageColor, getLanguageLabel } from '../../constants/languages';
import { BorderRadius, FontSize } from '../../constants/theme';

interface LanguageBadgeProps {
  language: string;
  small?: boolean;
}

export function LanguageBadge({ language, small = false }: LanguageBadgeProps) {
  const color = getLanguageColor(language);
  const label = getLanguageLabel(language);

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: `${color}22`,
          borderColor: `${color}55`,
          borderRadius: BorderRadius.sm,
          paddingVertical: small ? 2 : 4,
          paddingHorizontal: small ? 6 : 10,
        },
      ]}
    >
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text
        style={[
          styles.label,
          { color, fontSize: small ? FontSize.xs : FontSize.sm },
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  label: {
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
