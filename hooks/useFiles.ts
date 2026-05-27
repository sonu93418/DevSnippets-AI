// ============================================================
// useFiles — File system state management hook
// ============================================================
import { useState, useCallback } from 'react';
import type { FileItem } from '../types';
import {
  listFiles,
  deleteFile,
  createFolder,
  copyFile,
  moveFile,
  APP_DIRECTORY,
} from '../lib/files/fileManager';

interface UseFilesReturn {
  files: FileItem[];
  currentPath: string;
  loading: boolean;
  error: string | null;
  navigateTo: (path: string) => Promise<void>;
  navigateBack: () => void;
  refresh: () => Promise<void>;
  remove: (uri: string) => Promise<void>;
  addFolder: (name: string) => Promise<void>;
  copy: (from: string, to: string) => Promise<void>;
  move: (from: string, to: string) => Promise<void>;
  pathHistory: string[];
}

export function useFiles(): UseFilesReturn {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [currentPath, setCurrentPath] = useState(APP_DIRECTORY);
  const [pathHistory, setPathHistory] = useState<string[]>([APP_DIRECTORY]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadFiles = useCallback(async (path: string) => {
    try {
      setLoading(true);
      setError(null);
      const items = await listFiles(path);
      setFiles(items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to list files');
    } finally {
      setLoading(false);
    }
  }, []);

  const navigateTo = useCallback(async (path: string) => {
    setCurrentPath(path);
    setPathHistory((prev) => [...prev, path]);
    await loadFiles(path);
  }, [loadFiles]);

  const navigateBack = useCallback(() => {
    if (pathHistory.length <= 1) return;
    const newHistory = pathHistory.slice(0, -1);
    const prev = newHistory[newHistory.length - 1];
    setPathHistory(newHistory);
    setCurrentPath(prev);
    loadFiles(prev);
  }, [pathHistory, loadFiles]);

  const refresh = useCallback(async () => {
    await loadFiles(currentPath);
  }, [currentPath, loadFiles]);

  const remove = useCallback(async (uri: string) => {
    await deleteFile(uri);
    setFiles((prev) => prev.filter((f) => f.uri !== uri));
  }, []);

  const addFolder = useCallback(async (name: string) => {
    await createFolder(currentPath, name);
    await loadFiles(currentPath);
  }, [currentPath, loadFiles]);

  const copy = useCallback(async (from: string, to: string) => {
    await copyFile(from, to);
    await loadFiles(currentPath);
  }, [currentPath, loadFiles]);

  const move = useCallback(async (from: string, to: string) => {
    await moveFile(from, to);
    await loadFiles(currentPath);
  }, [currentPath, loadFiles]);

  return {
    files,
    currentPath,
    loading,
    error,
    navigateTo,
    navigateBack,
    refresh,
    remove,
    addFolder,
    copy,
    move,
    pathHistory,
  };
}
