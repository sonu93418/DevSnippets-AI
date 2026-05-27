// ============================================================
// Tag — Pill badge for snippet tags
// ============================================================
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { BorderRadius, FontSize, Spacing } from '../../constants/theme';

interface TagProps {
  label: string;
  onRemove?: () => void;
  color?: string;
  small?: boolean;
}

export function Tag({ label, onRemove, color, small = false }: TagProps) {
  const { theme } = useTheme();

  const bgColor = color
    ? `${color}22`
    : theme.isDark
    ? 'rgba(91,164,208,0.12)'
    : 'rgba(45,106,159,0.08)';

  const textColor = color ?? theme.colors.primary;

  return (
    <View
      style={[
        styles.tag,
        {
          backgroundColor: bgColor,
          borderRadius: BorderRadius.full,
          borderColor: color ? `${color}44` : `${theme.colors.primary}44`,
          paddingVertical: small ? 2 : 4,
          paddingHorizontal: small ? 8 : 12,
        },
      ]}
    >
      <Text
        style={[
          styles.label,
          { color: textColor, fontSize: small ? FontSize.xs : FontSize.sm },
        ]}
      >
        #{label}
      </Text>
      {onRemove && (
        <TouchableOpacity onPress={onRemove} style={styles.removeBtn} hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}>
          <Feather name="x" size={10} color={textColor} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    marginRight: 6,
    marginBottom: 6,
  },
  label: {
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  removeBtn: {
    marginLeft: 4,
  },
});
