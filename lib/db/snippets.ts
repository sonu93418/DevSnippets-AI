// ============================================================
// Snippet CRUD — expo-sqlite v15 synchronous API (SDK 55)
// ============================================================
import { Platform } from 'react-native';
import { queryAll, queryFirst, runQuery } from './database';
import type { Snippet, SnippetCreateInput, SnippetUpdateInput, SearchFilters } from '../../types';

// ─── Row → Domain ─────────────────────────────────────────────

interface SnippetRow {
  id: string;
  title: string;
  code: string;
  language: string;
  tags: string;
  is_favorite: number;
  file_path: string | null;
  created_at: string;
  updated_at: string;
}

const WEB_STORAGE_KEY = '@devsnippets/snippets';

function createSnippetId(): string {
  if (typeof crypto !== 'undefined') {
    if (typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }

    if (typeof crypto.getRandomValues === 'function') {
      const bytes = new Uint8Array(16);
      crypto.getRandomValues(bytes);
      return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
    }
  }

  return `snippet_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function isWeb(): boolean {
  return Platform.OS === 'web';
}

function readWebSnippets(): Snippet[] {
  if (!isWeb() || typeof localStorage === 'undefined') {
    return [];
  }

  try {
    const raw = localStorage.getItem(WEB_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeWebSnippets(snippets: Snippet[]): void {
  if (!isWeb()) {
    return;
  }

  if (typeof localStorage === 'undefined') {
    throw new Error('Snippet storage is unavailable in this browser.');
  }

  try {
    localStorage.setItem(WEB_STORAGE_KEY, JSON.stringify(snippets));
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : 'Unable to save snippets in browser storage.'
    );
  }
}

function matchesFilters(snippet: Snippet, filters?: SearchFilters): boolean {
  if (!filters) return true;

  if (filters.query) {
    const query = filters.query.toLowerCase();
    const haystack = `${snippet.title} ${snippet.code}`.toLowerCase();
    if (!haystack.includes(query)) return false;
  }

  if (filters.language && filters.language !== 'all' && snippet.language !== filters.language) {
    return false;
  }

  if (filters.favoritesOnly && !snippet.isFavorite) {
    return false;
  }

  if (filters.tags && filters.tags.length > 0 && !filters.tags.some((tag) => snippet.tags.includes(tag))) {
    return false;
  }

  return true;
}

function sortSnippets(snippets: Snippet[]): Snippet[] {
  return [...snippets].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

function rowToSnippet(row: SnippetRow): Snippet {
  return {
    id: row.id,
    title: row.title,
    code: row.code,
    language: row.language,
    tags: (() => { try { return JSON.parse(row.tags || '[]'); } catch { return []; } })(),
    isFavorite: row.is_favorite === 1,
    filePath: row.file_path ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ─── Read ──────────────────────────────────────────────────────

export function getSnippets(filters?: SearchFilters): Snippet[] {
  if (isWeb()) {
    return sortSnippets(readWebSnippets().filter((snippet) => matchesFilters(snippet, filters)));
  }

  let sql = 'SELECT * FROM snippets WHERE 1=1';
  const params: (string | number | null)[] = [];

  if (filters?.query) {
    sql += ' AND (LOWER(title) LIKE ? OR LOWER(code) LIKE ?)';
    const q = `%${filters.query.toLowerCase()}%`;
    params.push(q, q);
  }
  if (filters?.language && filters.language !== 'all') {
    sql += ' AND language = ?';
    params.push(filters.language);
  }
  if (filters?.favoritesOnly) {
    sql += ' AND is_favorite = 1';
  }
  sql += ' ORDER BY updated_at DESC';

  let snippets = queryAll<SnippetRow>(sql, params).map(rowToSnippet);

  if (filters?.tags && filters.tags.length > 0) {
    snippets = snippets.filter((s) =>
      filters.tags!.some((t) => s.tags.includes(t))
    );
  }
  return snippets;
}

export function getSnippetById(id: string): Snippet | null {
  if (isWeb()) {
    return readWebSnippets().find((snippet) => snippet.id === id) ?? null;
  }

  const row = queryFirst<SnippetRow>('SELECT * FROM snippets WHERE id = ?', [id]);
  return row ? rowToSnippet(row) : null;
}

// ─── Write ────────────────────────────────────────────────────

export function createSnippet(input: SnippetCreateInput): Snippet {
  const now = new Date().toISOString();
  const id = createSnippetId();

  if (isWeb()) {
    const snippet: Snippet = {
      id,
      title: input.title,
      code: input.code,
      language: input.language || 'plaintext',
      tags: input.tags || [],
      isFavorite: input.isFavorite ?? false,
      filePath: input.filePath,
      createdAt: now,
      updatedAt: now,
    };

    try {
      writeWebSnippets([snippet, ...readWebSnippets()]);
      return snippet;
    } catch (err) {
      console.error('createSnippet (web) failed:', err);
      throw err instanceof Error ? err : new Error(String(err));
    }
  }

  runQuery(
    `INSERT INTO snippets (id, title, code, language, tags, is_favorite, file_path, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      input.title,
      input.code,
      input.language || 'plaintext',
      JSON.stringify(input.tags || []),
      input.isFavorite ? 1 : 0,
      input.filePath ?? null,
      now,
      now,
    ]
  );

  return {
    id,
    title: input.title,
    code: input.code,
    language: input.language || 'plaintext',
    tags: input.tags || [],
    isFavorite: input.isFavorite ?? false,
    filePath: input.filePath,
    createdAt: now,
    updatedAt: now,
  };
}

export function updateSnippet(input: SnippetUpdateInput): void {
  if (isWeb()) {
    const snippets = readWebSnippets();
    const index = snippets.findIndex((snippet) => snippet.id === input.id);
    if (index === -1) throw new Error(`Snippet not found: ${input.id}`);

    const existing = snippets[index];
    snippets[index] = {
      ...existing,
      title: input.title ?? existing.title,
      code: input.code ?? existing.code,
      language: input.language ?? existing.language,
      tags: input.tags ?? existing.tags,
      isFavorite: input.isFavorite ?? existing.isFavorite,
      filePath: input.filePath ?? existing.filePath,
      updatedAt: new Date().toISOString(),
    };
    writeWebSnippets(snippets);
    return;
  }

  const existing = getSnippetById(input.id);
  if (!existing) throw new Error(`Snippet not found: ${input.id}`);
  const now = new Date().toISOString();

  runQuery(
    `UPDATE snippets
     SET title=?, code=?, language=?, tags=?, is_favorite=?, file_path=?, updated_at=?
     WHERE id=?`,
    [
      input.title      ?? existing.title,
      input.code       ?? existing.code,
      input.language   ?? existing.language,
      JSON.stringify(input.tags ?? existing.tags),
      input.isFavorite !== undefined
        ? (input.isFavorite ? 1 : 0)
        : (existing.isFavorite ? 1 : 0),
      input.filePath   ?? existing.filePath ?? null,
      now,
      input.id,
    ]
  );
}

export function toggleFavorite(id: string): boolean {
  if (isWeb()) {
    const snippets = readWebSnippets();
    const index = snippets.findIndex((snippet) => snippet.id === id);
    if (index === -1) throw new Error(`Snippet not found: ${id}`);
    const next = !snippets[index].isFavorite;
    snippets[index] = { ...snippets[index], isFavorite: next, updatedAt: new Date().toISOString() };
    writeWebSnippets(snippets);
    return next;
  }

  const snippet = getSnippetById(id);
  if (!snippet) throw new Error(`Snippet not found: ${id}`);
  const next = !snippet.isFavorite;
  runQuery(
    'UPDATE snippets SET is_favorite=?, updated_at=? WHERE id=?',
    [next ? 1 : 0, new Date().toISOString(), id]
  );
  return next;
}

export function deleteSnippet(id: string): void {
  if (isWeb()) {
    writeWebSnippets(readWebSnippets().filter((snippet) => snippet.id !== id));
    return;
  }

  runQuery('DELETE FROM snippets WHERE id=?', [id]);
}

// ─── Counts & Tags ────────────────────────────────────────────

export function getSnippetCount(): number {
  if (isWeb()) {
    return readWebSnippets().length;
  }

  const row = queryFirst<{ count: number }>('SELECT COUNT(*) as count FROM snippets');
  return row?.count ?? 0;
}

export function getFavoriteCount(): number {
  if (isWeb()) {
    return readWebSnippets().filter((snippet) => snippet.isFavorite).length;
  }

  const row = queryFirst<{ count: number }>('SELECT COUNT(*) as count FROM snippets WHERE is_favorite=1');
  return row?.count ?? 0;
}

export function getAllTags(): string[] {
  const snippets = getSnippets();
  const tagSet = new Set<string>();
  snippets.forEach((s) => s.tags.forEach((t: string) => tagSet.add(t)));
  return Array.from(tagSet).sort();
}

export function getAllSnippetsForExport(): Snippet[] {
  return getSnippets();
}
