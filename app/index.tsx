// ============================================================
// Home Screen — Snippet list with search, filters & FAB
// ============================================================
import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ScrollView,
  RefreshControl,
  Platform,
  Keyboard,
} from 'react-native';
import { useRef } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { useSnippets } from '../hooks/useSnippets';
import { SearchBar } from '../components/layout/SearchBar';
import { SnippetCard } from '../components/snippet/SnippetCard';
import { EmptyState } from '../components/ui/EmptyState';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { HomeBanner } from '../components/ui/HomeBanner';
import { BorderRadius, FontSize, FontWeight, Spacing } from '../constants/theme';
import { LANGUAGES } from '../constants/languages';
import type { SearchFilters } from '../types';

const LANG_FILTERS = [
  { id: 'all', label: 'All' },
  ...LANGUAGES.slice(0, 8),
];

export default function HomeScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [langFilter, setLangFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const fabScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const filters: SearchFilters = {
    query,
    language: langFilter === 'all' ? undefined : langFilter,
  };

  const { snippets, loading, refresh, toggleSnippetFavorite, removeSnippet } =
    useSnippets(filters);
  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh(filters);
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      refresh(filters);
    }, [refresh, query, langFilter])
  );

  const handleFabPress = () => {
    Animated.sequence([
      Animated.timing(fabScale, { toValue: 0.92, duration: 80, useNativeDriver: true }),
      Animated.timing(fabScale, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start();
    router.push('/snippet/create');
  };

  const emptyTitle = query
    ? 'No results found'
    : langFilter !== 'all'
    ? `No ${langFilter} snippets`
    : 'No snippets yet';

  const emptySubtitle = query
    ? `No snippets match "${query}"`
    : 'Tap the + button to create your first code snippet';

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: theme.colors.background }]}
      edges={['left', 'right', 'bottom']}
    >
      <View style={styles.bannerWrap}>
        <HomeBanner snippetCount={snippets.length} />
      </View>

      <View style={[styles.topBar, { borderBottomColor: theme.colors.border }]}> 
        <SearchBar
          value={query}
          onChangeText={setQuery}
          placeholder="Search snippets..."
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterRow}
        >
          {LANG_FILTERS.map((lang) => {
            const active = langFilter === lang.id;
            return (
              <TouchableOpacity
                key={lang.id}
                onPress={() => setLangFilter(lang.id)}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: active
                      ? theme.colors.primary
                      : theme.isDark
                      ? 'rgba(255,255,255,0.06)'
                      : 'rgba(0,0,0,0.04)',
                    borderRadius: BorderRadius.full,
                    borderWidth: active ? 0 : 1,
                    borderColor: theme.colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.filterLabel,
                    {
                      color: active ? '#FFFFFF' : theme.colors.textSecondary,
                      fontWeight: active ? FontWeight.semibold : FontWeight.regular,
                    },
                  ]}
                >
                  {lang.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {loading && !refreshing ? (
        <LoadingSpinner label="Loading snippets..." fullScreen />
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
              icon="code"
              title={emptyTitle}
              subtitle={emptySubtitle}
              actionLabel={query ? undefined : 'Create Snippet'}
              onAction={query ? undefined : () => router.push('/snippet/create')}
            />
          }
          renderItem={({ item }) => (
            <SnippetCard
              snippet={item}
              onPress={() => router.push(`/snippet/${item.id}`)}
              onToggleFavorite={() => toggleSnippetFavorite(item.id)}
              onDelete={() => removeSnippet(item.id)}
            />
          )}
        />
      )}

      {!keyboardVisible && (
        <Animated.View
          style={[
            styles.fab,
            {
              bottom: Platform.OS === 'ios' ? insets.bottom + 112 : insets.bottom + 100,
            },
            { transform: [{ scale: fabScale }] },
          ]}
        >
          <TouchableOpacity
            onPress={handleFabPress}
            style={[
              styles.fabButton,
              {
                backgroundColor: theme.colors.primary,
                borderColor: theme.isDark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.30)',
                ...theme.shadow.lg,
              },
            ]}
            activeOpacity={0.85}
          >
            <Feather name="plus" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  topBar: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
  },
  filterScroll: {
    marginTop: Spacing.md,
  },
  filterRow: {
    gap: Spacing.sm,
    paddingRight: Spacing.sm,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  filterLabel: {
    fontSize: FontSize.sm,
  },
  countRow: {
    paddingHorizontal: Spacing.base,
    paddingTop: 0,
    paddingBottom: Spacing.xs,
  },
  bannerWrap: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.base,
    paddingBottom: Spacing.sm,
  },
  list: {
    padding: Spacing.base,
    paddingBottom: Platform.OS === 'ios' ? 192 : 180,
  },
  fab: {
    position: 'absolute',
    right: 16,
    zIndex: 20,
    elevation: 20,
  },
  fabButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
