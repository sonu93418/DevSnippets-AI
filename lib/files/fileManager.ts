// ============================================================
// File Manager — Expo FileSystem Operations (SDK 55)
// Uses expo-file-system/legacy for the functional API
// ============================================================
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import type { FileItem } from '../../types';

export const APP_DIRECTORY = FileSystem.documentDirectory + 'DevSnippets/';
export const TEMPLATES_DIR = APP_DIRECTORY + 'Templates/';
export const EXPORTS_DIR = APP_DIRECTORY + 'Exports/';
export const ATTACHMENTS_DIR = APP_DIRECTORY + 'Attachments/';

// --- Ensure directories exist ---
export async function initFileSystem(): Promise<void> {
  if (Platform.OS === 'web') return;

  const dirs = [APP_DIRECTORY, TEMPLATES_DIR, EXPORTS_DIR, ATTACHMENTS_DIR];
  for (const dir of dirs) {
    const info = await FileSystem.getInfoAsync(dir);
    if (!info.exists) {
      await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
    }
  }

  // Seed template files
  await seedTemplates();
}

async function seedTemplates(): Promise<void> {
  if (Platform.OS === 'web') return;

  const templates: { name: string; content: string }[] = [
    {
      name: 'api-fetch.js',
      content: `// Fetch API Template
async function fetchData(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(\`HTTP error: \${response.status}\`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Fetch failed:', error);
    throw error;
  }
}`,
    },
    {
      name: 'react-component.tsx',
      content: `import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  title: string;
}

export default function MyComponent({ title }: Props) {
  const [count, setCount] = useState(0);
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text>Count: {count}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold' },
});`,
    },
    {
      name: 'sql-queries.sql',
      content: `-- Common SQL Patterns

-- SELECT with JOIN
SELECT u.name, o.total
FROM users u
INNER JOIN orders o ON u.id = o.user_id
WHERE o.created_at >= DATE('now', '-30 days')
ORDER BY o.total DESC;

-- INSERT with RETURNING
INSERT INTO items (name, price, stock)
VALUES ('Widget', 9.99, 100)
RETURNING id, created_at;

-- UPDATE with subquery
UPDATE products
SET price = price * 1.1
WHERE category_id IN (
  SELECT id FROM categories WHERE name = 'Electronics'
);`,
    },
    {
      name: 'python-class.py',
      content: `from dataclasses import dataclass, field
from typing import Optional, List
from datetime import datetime


@dataclass
class Snippet:
    id: str
    title: str
    code: str
    language: str
    tags: List[str] = field(default_factory=list)
    is_favorite: bool = False
    created_at: datetime = field(default_factory=datetime.now)
    
    def to_dict(self) -> dict:
        return {
            'id': self.id,
            'title': self.title,
            'code': self.code,
            'language': self.language,
            'tags': self.tags,
            'is_favorite': self.is_favorite,
            'created_at': self.created_at.isoformat(),
        }
    
    @classmethod
    def from_dict(cls, data: dict) -> 'Snippet':
        return cls(**data)`,
    },
  ];

  for (const template of templates) {
    const path = TEMPLATES_DIR + template.name;
    const info = await FileSystem.getInfoAsync(path);
    if (!info.exists) {
      await FileSystem.writeAsStringAsync(path, template.content, {
        encoding: FileSystem.EncodingType.UTF8,
      });
    }
  }
}

// --- List files in a directory ---
export async function listFiles(dirUri: string = APP_DIRECTORY): Promise<FileItem[]> {
  if (Platform.OS === 'web') return [];

  try {
    const info = await FileSystem.getInfoAsync(dirUri);
    if (!info.exists || !info.isDirectory) return [];

    const names = await FileSystem.readDirectoryAsync(dirUri);
    const items: FileItem[] = [];

    for (const name of names) {
      const uri = dirUri.endsWith('/') ? `${dirUri}${name}` : `${dirUri}/${name}`;
      const fileInfo = await FileSystem.getInfoAsync(uri);
      items.push({
        name,
        uri,
        isDirectory: fileInfo.isDirectory ?? false,
        size: 'size' in fileInfo ? fileInfo.size : undefined,
        modificationTime: 'modificationTime' in fileInfo ? fileInfo.modificationTime : undefined,
      });
    }

    return items.sort((a, b) => {
      if (a.isDirectory && !b.isDirectory) return -1;
      if (!a.isDirectory && b.isDirectory) return 1;
      return a.name.localeCompare(b.name);
    });
  } catch {
    return [];
  }
}

// --- Read file content ---
export async function readFile(uri: string): Promise<string> {
  if (Platform.OS === 'web') {
    throw new Error('File reading is not available on web.');
  }

  return FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.UTF8 });
}

// --- Write file ---
export async function writeFile(uri: string, content: string): Promise<void> {
  if (Platform.OS === 'web') {
    throw new Error('File writing is not available on web.');
  }

  await FileSystem.writeAsStringAsync(uri, content, {
    encoding: FileSystem.EncodingType.UTF8,
  });
}

// --- Delete file or directory ---
export async function deleteFile(uri: string): Promise<void> {
  if (Platform.OS === 'web') return;

  const info = await FileSystem.getInfoAsync(uri);
  if (info.exists) {
    await FileSystem.deleteAsync(uri, { idempotent: true });
  }
}

// --- Create folder ---
export async function createFolder(parentUri: string, name: string): Promise<string> {
  if (Platform.OS === 'web') {
    throw new Error('Folder creation is not available on web.');
  }

  const folderUri = parentUri.endsWith('/') ? `${parentUri}${name}` : `${parentUri}/${name}`;
  await FileSystem.makeDirectoryAsync(folderUri, { intermediates: true });
  return folderUri;
}

// --- Copy file ---
export async function copyFile(fromUri: string, toUri: string): Promise<void> {
  if (Platform.OS === 'web') {
    throw new Error('File copy is not available on web.');
  }

  await FileSystem.copyAsync({ from: fromUri, to: toUri });
}

// --- Move file ---
export async function moveFile(fromUri: string, toUri: string): Promise<void> {
  if (Platform.OS === 'web') {
    throw new Error('File move is not available on web.');
  }

  await FileSystem.moveAsync({ from: fromUri, to: toUri });
}

// --- Get file info ---
export async function getFileInfo(uri: string): Promise<FileSystem.FileInfo> {
  if (Platform.OS === 'web') {
    throw new Error('File info is not available on web.');
  }

  return FileSystem.getInfoAsync(uri);
}

// --- Format file size ---
export function formatFileSize(bytes?: number): string {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

// --- Save attachment ---
export async function saveAttachment(sourceUri: string, fileName: string): Promise<string> {
  if (Platform.OS === 'web') {
    throw new Error('Attachment saving is not available on web.');
  }

  await initFileSystem();
  const destUri = ATTACHMENTS_DIR + fileName;
  await FileSystem.copyAsync({ from: sourceUri, to: destUri });
  return destUri;
}

// --- Get file extension icon ---
export function getFileIcon(name: string, isDirectory: boolean): string {
  if (isDirectory) return 'folder';
  const ext = name.split('.').pop()?.toLowerCase();
  const icons: Record<string, string> = {
    js: 'code',
    ts: 'code',
    tsx: 'code',
    jsx: 'code',
    py: 'code',
    go: 'code',
    rs: 'code',
    sql: 'database',
    md: 'file-text',
    txt: 'file-text',
    json: 'file-text',
    png: 'image',
    jpg: 'image',
    jpeg: 'image',
    gif: 'image',
    pdf: 'file',
  };
  return icons[ext ?? ''] ?? 'file';
}
