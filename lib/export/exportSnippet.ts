// ============================================================
// Export & Sharing — Snippet Export Utilities (SDK 55)
// Uses expo-file-system/legacy for the functional API
// ============================================================
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as Clipboard from 'expo-clipboard';
import type { Snippet, ExportFormat, ExportOptions } from '../../types';
import { EXPORTS_DIR } from '../files/fileManager';
import { getLanguageExtension } from '../../constants/languages';

// --- Build export content ---
function buildExportContent(snippet: Snippet, options: ExportOptions): string {
  if (options.format === 'json') {
    return JSON.stringify(
      options.includeMetadata
        ? snippet
        : { title: snippet.title, code: snippet.code, language: snippet.language, tags: snippet.tags },
      null,
      2
    );
  }

  if (options.includeMetadata) {
    const header = [
      `// Title: ${snippet.title}`,
      `// Language: ${snippet.language}`,
      `// Tags: ${snippet.tags.join(', ')}`,
      `// Created: ${new Date(snippet.createdAt).toLocaleString()}`,
      `// Updated: ${new Date(snippet.updatedAt).toLocaleString()}`,
      '',
    ].join('\n');
    return header + snippet.code;
  }

  return snippet.code;
}

// --- Get file name for export ---
function getExportFileName(snippet: Snippet, format: ExportFormat): string {
  const safeName = snippet.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  const ext = format === 'txt' ? 'txt' : format === 'json' ? 'json' : getLanguageExtension(snippet.language);
  return `${safeName}.${ext}`;
}

// --- Export to local file ---
export async function exportSnippetToFile(
  snippet: Snippet,
  options: ExportOptions = { format: 'txt', includeMetadata: true }
): Promise<string> {
  const content = buildExportContent(snippet, options);
  const fileName = getExportFileName(snippet, options.format);
  const fileUri = EXPORTS_DIR + fileName;

  if (Platform.OS === 'web') {
    return URL.createObjectURL(new Blob([content], { type: 'text/plain;charset=utf-8' }));
  }

  await FileSystem.writeAsStringAsync(fileUri, content, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  return fileUri;
}

// --- Share snippet via native share sheet ---
export async function shareSnippet(
  snippet: Snippet,
  options: ExportOptions = { format: 'txt', includeMetadata: false }
): Promise<void> {
  if (Platform.OS === 'web') {
    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      await navigator.share({ title: snippet.title, text: snippet.code });
      return;
    }
    await Clipboard.setStringAsync(snippet.code);
    return;
  }

  const isSharingAvailable = await Sharing.isAvailableAsync();

  if (isSharingAvailable) {
    const fileUri = await exportSnippetToFile(snippet, options);
    await Sharing.shareAsync(fileUri, {
      mimeType: 'text/plain',
      dialogTitle: `Share "${snippet.title}"`,
    });
  } else {
    // Fallback: copy to clipboard
    await Clipboard.setStringAsync(snippet.code);
  }
}

// --- Copy code to clipboard ---
export async function copySnippetToClipboard(snippet: Snippet): Promise<void> {
  await Clipboard.setStringAsync(snippet.code);
}

// --- Export all snippets as JSON ---
export async function exportAllSnippets(snippets: Snippet[]): Promise<string> {
  const content = JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      count: snippets.length,
      snippets,
    },
    null,
    2
  );
  const fileUri = EXPORTS_DIR + `devsnippets_backup_${Date.now()}.json`;

  if (Platform.OS === 'web') {
    return URL.createObjectURL(new Blob([content], { type: 'application/json;charset=utf-8' }));
  }

  await FileSystem.writeAsStringAsync(fileUri, content, {
    encoding: FileSystem.EncodingType.UTF8,
  });
  return fileUri;
}

// --- Share exported file ---
export async function shareFile(fileUri: string): Promise<void> {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') {
      window.open(fileUri, '_blank', 'noopener,noreferrer');
    }
    return;
  }

  const available = await Sharing.isAvailableAsync();
  if (available) {
    await Sharing.shareAsync(fileUri);
  }
}
