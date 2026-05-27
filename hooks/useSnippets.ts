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
  const initialFiltersRef = useRef(initialFilters);
  const initialFiltersKey = JSON.stringify(initialFilters ?? null);

  useEffect(() => {
    initialFiltersRef.current = initialFilters;
  }, [initialFiltersKey]);

  const refresh = useCallback(async (filters?: SearchFilters) => {
    try {
      setLoading(true);
      setError(null);
      // SQLite v15: synchronous — wrap in setTimeout to avoid blocking render
      const data = await new Promise<Snippet[]>((resolve, reject) => {
        try {
          resolve(getSnippets(filters ?? initialFiltersRef.current));
        } catch (e) {
          reject(e);
        }
      });
      setSnippets(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load snippets');
    } finally {
      setLoading(false);
    }
  }, [initialFiltersKey]);

  useEffect(() => {
    refresh();
  }, [refresh, initialFiltersKey]);

  const addSnippet = useCallback(async (input: SnippetCreateInput): Promise<Snippet> => {
    try {
      const snippet = createSnippet(input);
      setSnippets((prev) => [snippet, ...prev]);
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
