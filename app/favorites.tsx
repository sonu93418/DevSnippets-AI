// ============================================================
// Favorites Screen
// ============================================================
import React, { useCallback } from 'react';
import {
  FlatList,
  View,
  Text,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../hooks/useTheme';
import { useSnippets } from '../hooks/useSnippets';
import { SnippetCard } from '../components/snippet/SnippetCard';
import { EmptyState } from '../components/ui/EmptyState';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { FontSize, Spacing } from '../constants/theme';
import type { SearchFilters } from '../types';

const FAVORITES_FILTER: SearchFilters = { query: '', favoritesOnly: true };

export default function FavoritesScreen() {
  const { theme } = useTheme();
  const [refreshing, setRefreshing] = React.useState(false);

  const { snippets, loading, refresh, removeSnippet, toggleSnippetFavorite } =
    useSnippets(FAVORITES_FILTER);

  useFocusEffect(
    useCallback(() => {
      refresh(FAVORITES_FILTER);
    }, [])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh(FAVORITES_FILTER);
    setRefreshing(false);
  };

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: theme.colors.background }]}
      edges={['left', 'right']}
    >
      {!loading && snippets.length > 0 && (
        <View style={styles.countRow}>
          <Text style={[styles.count, { color: theme.colors.textTertiary }]}>
            {snippets.length} favorite{snippets.length !== 1 ? 's' : ''}
          </Text>
        </View>
      )}

      {loading ? (
        <LoadingSpinner fullScreen label="Loading favorites..." />
      ) : (
        <FlatList
          data={snippets}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.list,
            snippets.length === 0 && { flex: 1 },
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={theme.colors.primary}
              colors={[theme.colors.primary]}
            />
          }
          ListEmptyComponent={
            <EmptyState
              icon="star"
              title="No favorites yet"
              subtitle="Star a snippet to save it here for quick access"
              actionLabel="Browse Snippets"
              onAction={() => router.push('/')}
            />
          }
          renderItem={({ item }) => (
            <SnippetCard
              snippet={item}
              onPress={() => router.push(`/snippet/${item.id}`)}
              onToggleFavorite={async () => {
                await toggleSnippetFavorite(item.id);
                refresh(FAVORITES_FILTER);
              }}
              onDelete={() => removeSnippet(item.id)}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  countRow: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xs,
  },
  count: { fontSize: FontSize.sm },
  list: {
    padding: Spacing.base,
    paddingBottom: 160,
  },
});
