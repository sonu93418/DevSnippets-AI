// ============================================================
// Global TypeScript Types — DevSnippets
// ============================================================

// --- Snippet ---
export interface Snippet {
  id: string;
  title: string;
  code: string;
  language: string;
  tags: string[];
  isFavorite: boolean;
  filePath?: string;
  createdAt: string;
  updatedAt: string;
}

export type SnippetCreateInput = Omit<Snippet, 'id' | 'createdAt' | 'updatedAt' | 'isFavorite'> & {
  isFavorite?: boolean;
};

export type SnippetUpdateInput = Partial<Omit<Snippet, 'id' | 'createdAt' | 'updatedAt'>> & {
  id: string;
};

// --- File Manager ---
export interface FileItem {
  name: string;
  uri: string;
  isDirectory: boolean;
  size?: number;
  modificationTime?: number;
  mimeType?: string;
}

// --- AI ---
export type AIProvider = 'openai' | 'gemini' | 'none';

export interface AIExplanation {
  summary: string;
  explanation: string;
  improvements: string[];
  provider: AIProvider;
  generatedAt: string;
}

export interface AIConfig {
  provider: AIProvider;
  apiKey: string;
}

// --- Preferences (stored in AsyncStorage) ---
export interface AppPreferences {
  theme: 'light' | 'dark' | 'system';
  aiProvider: AIProvider;
  defaultLanguage: string;
  lastViewedSnippetId?: string;
}

// --- Export ---
export type ExportFormat = 'txt' | 'js' | 'ts' | 'py' | 'go' | 'rs' | 'sql' | 'json' | 'md';

export interface ExportOptions {
  format: ExportFormat;
  includeMetadata: boolean;
}

// --- Search ---
export interface SearchFilters {
  query: string;
  language?: string;
  tags?: string[];
  favoritesOnly?: boolean;
}

// --- Navigation ---
export type RootTabParamList = {
  index: undefined;
  favorites: undefined;
  files: undefined;
  settings: undefined;
};
