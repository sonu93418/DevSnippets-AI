// ============================================================
// FileCard — File browser item
// ============================================================
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { BorderRadius, FontSize, FontWeight, Spacing } from '../../constants/theme';
import { formatFileSize, getFileIcon } from '../../lib/files/fileManager';
import type { FileItem } from '../../types';

interface FileCardProps {
  item: FileItem;
  onPress: () => void;
  onLongPress?: () => void;
  selected?: boolean;
}

export function FileCard({ item, onPress, onLongPress, selected = false }: FileCardProps) {
  const { theme } = useTheme();
  const iconName = getFileIcon(item.name, item.isDirectory) as keyof typeof Feather.glyphMap;

  const iconColor = item.isDirectory ? theme.colors.primary : theme.colors.textSecondary;
  const iconBg = item.isDirectory
    ? theme.isDark ? 'rgba(91,164,208,0.12)' : 'rgba(45,106,159,0.08)'
    : theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)';

  const modTime = item.modificationTime
    ? new Date(item.modificationTime * 1000).toLocaleDateString()
    : '';

  return (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.75}
      style={[
        styles.card,
        {
          backgroundColor: selected
            ? `${theme.colors.primary}18`
            : theme.colors.surface,
          borderColor: selected ? theme.colors.primary : theme.colors.border,
          borderRadius: BorderRadius.lg,
          ...theme.shadow.sm,
        },
      ]}
    >
      <View style={[styles.iconWrapper, { backgroundColor: iconBg, borderRadius: BorderRadius.md }]}>
        <Feather name={iconName} size={22} color={iconColor} />
      </View>
      <View style={styles.info}>
        <Text
          style={[styles.name, { color: theme.colors.textPrimary, fontWeight: FontWeight.medium }]}
          numberOfLines={1}
        >
          {item.name}
        </Text>
        <Text style={[styles.meta, { color: theme.colors.textTertiary }]}>
          {item.isDirectory ? 'Folder' : formatFileSize(item.size)}
          {modTime ? ` · ${modTime}` : ''}
        </Text>
      </View>
      <View style={styles.trailing}>
        {item.isDirectory ? (
          <Feather name="chevron-right" size={16} color={theme.colors.textTertiary} />
        ) : (
          <Feather name="more-vertical" size={16} color={theme.colors.textTertiary} />
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    gap: Spacing.md,
    minHeight: 72,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: FontSize.base,
    marginBottom: 2,
  },
  meta: {
    fontSize: FontSize.xs,
  },
  trailing: {
    width: 20,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
});
