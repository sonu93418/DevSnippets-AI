// ============================================================
// useSnippets — Snippet state management (SDK 55 / SQLite v15)
// DB calls are synchronous; hook keeps async interface for UI
// ============================================================
import { useState, useEffect, useCallback, useRef } from 'react';
import type { Snippet, SnippetCreateInput, SnippetUpdateInput, SearchFilters } from '../types';
import {
  getSnippets,
  createSnippet,
  updateSnippet,
  deleteSnippet,
  toggleFavorite,
  getSnippetById,
} from '../lib/db/snippets';
import { snippetEvents } from '../lib/events';

interface UseSnippetsReturn {
  snippets: Snippet[];
  loading: boolean;
  error: string | null;
  refresh: (filters?: SearchFilters) => Promise<void>;
  addSnippet: (input: SnippetCreateInput) => Promise<Snippet>;
  editSnippet: (input: SnippetUpdateInput) => Promise<void>;
  removeSnippet: (id: string) => Promise<void>;
  toggleSnippetFavorite: (id: string) => Promise<boolean>;
  getSnippet: (id: string) => Promise<Snippet | null>;
}

export function useSnippets(initialFilters?: SearchFilters): UseSnippetsReturn {
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isRefreshingRef = useRef(false);
  const initialFiltersRef = useRef(initialFilters);
  const initialFiltersKey = JSON.stringify(initialFilters ?? null);

  useEffect(() => {
    initialFiltersRef.current = initialFilters;
  }, [initialFiltersKey]);

  const refresh = useCallback(async (filters?: SearchFilters) => {
    if (isRefreshingRef.current) {
      return;
    }

    try {
      isRefreshingRef.current = true;
      setLoading(true);
      setError(null);
      // SQLite v15: synchronous — wrap in setTimeout to avoid blocking render
      console.debug('useSnippets.refresh: requesting snippets', { filters: filters ?? initialFiltersRef.current });
      const data = await new Promise<Snippet[]>((resolve, reject) => {
        try {
          const res = getSnippets(filters ?? initialFiltersRef.current);
          console.debug('useSnippets.refresh: got', res.length, 'snippets', res.slice(0, 6).map((s) => ({ id: s.id, title: s.title })));
          resolve(res);
        } catch (e) {
          reject(e);
        }
      });
      setSnippets(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load snippets');
    } finally {
      isRefreshingRef.current = false;
      setLoading(false);
    }
  }, [initialFiltersKey]);

  useEffect(() => {
    refresh();
  }, [refresh, initialFiltersKey]);

  // Subscribe to global snippet events so different hook instances stay in sync
  useEffect(() => {
    const unsub = snippetEvents.subscribe(() => {
      // prefer the current filters in this hook
      refresh().catch(() => {});
    });
    return () => unsub();
  }, [refresh]);

  const addSnippet = useCallback(async (input: SnippetCreateInput): Promise<Snippet> => {
    try {
      const snippet = createSnippet(input);
      // Ensure UI reflects authoritative DB state (handles filters / ordering)
      try {
        await refresh();
      } catch {
        // fallback: optimistic update if refresh fails
        setSnippets((prev) => [snippet, ...prev]);
      }
      return snippet;
    } catch (err) {
      console.error('addSnippet failed:', err);
      throw err instanceof Error ? err : new Error(String(err));
    }
  }, []);

  const editSnippet = useCallback(async (input: SnippetUpdateInput): Promise<void> => {
    updateSnippet(input);
    setSnippets((prev) =>
      prev.map((s) =>
        s.id === input.id
          ? { ...s, ...input, tags: input.tags ?? s.tags, updatedAt: new Date().toISOString() }
          : s
      )
    );
  }, []);

  const removeSnippet = useCallback(async (id: string): Promise<void> => {
    deleteSnippet(id);
    setSnippets((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const toggleSnippetFavorite = useCallback(async (id: string): Promise<boolean> => {
    const newValue = toggleFavorite(id);
    setSnippets((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isFavorite: newValue } : s))
    );
    return newValue;
  }, []);

  const getSnippet = useCallback(async (id: string): Promise<Snippet | null> => {
    return getSnippetById(id);
  }, []);

  return {
    snippets,
    loading,
    error,
    refresh,
    addSnippet,
    editSnippet,
    removeSnippet,
    toggleSnippetFavorite,
    getSnippet,
  };
}
