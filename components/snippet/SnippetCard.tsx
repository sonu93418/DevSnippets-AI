// ============================================================
// SnippetCard — List item card with swipe-like actions
// ============================================================
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { BorderRadius, FontSize, FontWeight, Spacing } from '../../constants/theme';
import { LanguageBadge } from './LanguageBadge';
import { Tag } from '../ui/Tag';
import type { Snippet } from '../../types';
import { Colors } from '../../constants/theme';

interface SnippetCardProps {
  snippet: Snippet;
  onPress: () => void;
  onToggleFavorite: () => void;
  onDelete: () => void;
}

export function SnippetCard({
  snippet,
  onPress,
  onToggleFavorite,
  onDelete,
}: SnippetCardProps) {
  const { theme } = useTheme();

  const handleDelete = () => {
    Alert.alert(
      'Delete Snippet',
      `Are you sure you want to delete "${snippet.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: onDelete },
      ]
    );
  };

  // Preview first 3 lines of code
  const codePreview = snippet.code.split('\n').slice(0, 3).join('\n');

  const timeAgo = getTimeAgo(snippet.updatedAt);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          borderRadius: BorderRadius.lg,
          ...theme.shadow.sm,
        },
      ]}
    >
      {/* Top row: title + actions */}
      <View style={styles.topRow}>
        <View style={styles.titleArea}>
          <Text
            style={[
              styles.title,
              { color: theme.colors.textPrimary, fontWeight: FontWeight.semibold },
            ]}
            numberOfLines={1}
          >
            {snippet.title}
          </Text>
          <Text style={[styles.time, { color: theme.colors.textTertiary }]}>
            {timeAgo}
          </Text>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity
            onPress={onToggleFavorite}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.actionBtn}
          >
            <Feather
              name={snippet.isFavorite ? 'star' : 'star'}
              size={18}
              color={snippet.isFavorite ? Colors.favorite : theme.colors.textTertiary}
              style={snippet.isFavorite ? { opacity: 1 } : { opacity: 0.5 }}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleDelete}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.actionBtn}
          >
            <Feather name="trash-2" size={16} color={theme.colors.textTertiary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Language badge */}
      <View style={styles.badgeRow}>
        <LanguageBadge language={snippet.language} small />
        {snippet.filePath && (
          <View style={styles.attachmentBadge}>
            <Feather name="paperclip" size={10} color={theme.colors.textTertiary} />
            <Text style={[styles.attachmentText, { color: theme.colors.textTertiary }]}>
              attachment
            </Text>
          </View>
        )}
      </View>

      {/* Code preview */}
      <View
        style={[
          styles.codePreview,
          { backgroundColor: theme.colors.codeBg, borderRadius: BorderRadius.sm },
        ]}
      >
        <Text
          style={[styles.codeText, { color: theme.colors.textSecondary }]}
          numberOfLines={3}
        >
          {codePreview}
        </Text>
      </View>

      {/* Tags */}
      {snippet.tags.length > 0 && (
        <View style={styles.tagsRow}>
          {snippet.tags.slice(0, 4).map((tag) => (
            <Tag key={tag} label={tag} small />
          ))}
          {snippet.tags.length > 4 && (
            <Text style={[styles.moreTags, { color: theme.colors.textTertiary }]}>
              +{snippet.tags.length - 4}
            </Text>
          )}
        </View>
      )}

      {/* Footer */}
      <View style={styles.footerRow}>
        <Feather name="chevron-right" size={16} color={theme.colors.textTertiary} />
      </View>
    </TouchableOpacity>
  );
}

function getTimeAgo(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(isoDate).toLocaleDateString();
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    padding: Spacing.base,
    marginBottom: Spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  titleArea: {
    flex: 1,
  },
  title: {
    fontSize: FontSize.md,
    marginBottom: 2,
  },
  time: {
    fontSize: FontSize.xs,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginLeft: Spacing.sm,
  },
  actionBtn: {
    padding: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  attachmentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  attachmentText: {
    fontSize: FontSize.xs,
  },
  codePreview: {
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  codeText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: FontSize.xs,
    lineHeight: 16,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  moreTags: {
    fontSize: FontSize.xs,
    marginBottom: 6,
  },
  footerRow: {
    marginTop: Spacing.sm,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
});
