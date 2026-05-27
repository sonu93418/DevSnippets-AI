// ============================================================
// File Manager Screen
// ============================================================
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
  RefreshControl,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { useFiles } from '../hooks/useFiles';
import { FileCard } from '../components/files/FileCard';
import { EmptyState } from '../components/ui/EmptyState';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { APP_DIRECTORY, readFile } from '../lib/files/fileManager';
import { initFileSystem } from '../lib/files/fileManager';
import { shareFile } from '../lib/export/exportSnippet';
import { BorderRadius, FontSize, FontWeight, Spacing } from '../constants/theme';
import * as Sharing from 'expo-sharing';
import type { FileItem } from '../types';
import { useCallback } from 'react';

export default function FilesScreen() {
  const { theme } = useTheme();
  const {
    files,
    currentPath,
    loading,
    navigateTo,
    navigateBack,
    refresh,
    remove,
    addFolder,
    pathHistory,
  } = useFiles();

  const [showNewFolder, setShowNewFolder] = useState(false);
  const [folderName, setFolderName] = useState('');
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (Platform.OS !== 'web') {
        initFileSystem().then(() => navigateTo(APP_DIRECTORY));
        return;
      }
      navigateTo(APP_DIRECTORY);
    }, [])
  );

  const handleItemPress = async (item: FileItem) => {
    if (item.isDirectory) {
      await navigateTo(item.uri);
    } else {
      setSelectedFile(item);
    }
  };

  const handleDeleteFile = async (item: FileItem) => {
    Alert.alert(
      'Delete',
      `Delete "${item.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await remove(item.uri);
            setSelectedFile(null);
          },
        },
      ]
    );
  };

  const handleShareFile = async (item: FileItem) => {
    try {
      await shareFile(item.uri);
    } catch {
      Alert.alert('Error', 'Could not share this file.');
    }
  };

  const handleCreateFolder = async () => {
    const name = folderName.trim();
    if (!name) return;
    try {
      await addFolder(name);
      setFolderName('');
      setShowNewFolder(false);
    } catch {
      Alert.alert('Error', 'Could not create folder.');
    }
  };

  // Breadcrumb display
  const getRelativePath = (path: string) => {
    const rel = path.replace(APP_DIRECTORY, '');
    return rel || 'DevSnippets';
  };

  const isAtRoot = pathHistory.length <= 1 || currentPath === APP_DIRECTORY;

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: theme.colors.background }]}
      edges={['left', 'right']}
    >
      {/* Breadcrumb / Path bar */}
      <View style={[styles.pathBar, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
        {!isAtRoot && (
          <TouchableOpacity onPress={navigateBack} style={styles.backBtn}>
            <Feather name="arrow-left" size={18} color={theme.colors.primary} />
          </TouchableOpacity>
        )}
        <Feather
          name={isAtRoot ? 'hard-drive' : 'folder'}
          size={14}
          color={theme.colors.textTertiary}
        />
        <Text
          style={[styles.pathText, { color: theme.colors.textSecondary }]}
          numberOfLines={1}
        >
          {getRelativePath(currentPath)}
        </Text>
      </View>

      {/* Toolbar */}
      <View style={[styles.toolbar, { borderBottomColor: theme.colors.border }]}>
        <Text style={[styles.fileCount, { color: theme.colors.textTertiary }]}>
          {files.length} item{files.length !== 1 ? 's' : ''}
        </Text>
        <View style={styles.toolbarActions}>
          <TouchableOpacity
            onPress={() => refresh()}
            style={styles.toolbarBtn}
          >
            <Feather name="refresh-cw" size={16} color={theme.colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setShowNewFolder(true)}
            style={[styles.toolbarBtn, styles.newFolderBtn, { backgroundColor: theme.colors.primary, borderRadius: BorderRadius.md }]}
          >
            <Feather name="folder-plus" size={16} color="#fff" />
            <Text style={styles.newFolderLabel}>New Folder</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* File List */}
      {loading ? (
        <LoadingSpinner fullScreen label="Loading files..." />
      ) : (
        <FlatList
          data={files}
          keyExtractor={(item) => item.uri}
          contentContainerStyle={[
            styles.list,
            files.length === 0 && { flex: 1 },
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={refresh}
              tintColor={theme.colors.primary}
            />
          }
          ListEmptyComponent={
            <EmptyState
              icon="folder"
              title="Empty folder"
              subtitle="No files here yet. Templates are in the Templates folder."
            />
          }
          renderItem={({ item }) => (
            <FileCard
              item={item}
              onPress={() => handleItemPress(item)}
              onLongPress={() => setSelectedFile(item)}
            />
          )}
        />
      )}

      {/* File Action Modal */}
      <Modal
        visible={!!selectedFile}
        onClose={() => setSelectedFile(null)}
        title={selectedFile?.name ?? ''}
        type="bottom"
      >
        {selectedFile && (
          <View style={styles.fileActions}>
            <TouchableOpacity
              onPress={() => handleShareFile(selectedFile)}
              style={[styles.fileAction, { borderBottomColor: theme.colors.border }]}
            >
              <Feather name="share-2" size={20} color={theme.colors.primary} />
              <Text style={[styles.fileActionLabel, { color: theme.colors.textPrimary }]}>
                Share
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleDeleteFile(selectedFile)}
              style={[styles.fileAction, { borderBottomColor: 'transparent' }]}
            >
              <Feather name="trash-2" size={20} color="#DC2626" />
              <Text style={[styles.fileActionLabel, { color: '#DC2626' }]}>
                Delete
              </Text>
            </TouchableOpacity>
            <View style={{ height: 24 }} />
          </View>
        )}
      </Modal>

      {/* New Folder Modal */}
      <Modal
        visible={showNewFolder}
        onClose={() => setShowNewFolder(false)}
        title="New Folder"
        type="center"
      >
        <View style={styles.newFolderForm}>
          <TextInput
            style={[
              styles.folderInput,
              {
                backgroundColor: theme.colors.codeBg,
                borderColor: theme.colors.border,
                color: theme.colors.textPrimary,
                borderRadius: BorderRadius.md,
              },
            ]}
            placeholder="Folder name..."
            placeholderTextColor={theme.colors.textTertiary}
            value={folderName}
            onChangeText={setFolderName}
            autoFocus
            returnKeyType="done"
            onSubmitEditing={handleCreateFolder}
          />
          <View style={styles.newFolderButtons}>
            <Button
              label="Cancel"
              onPress={() => setShowNewFolder(false)}
              variant="secondary"
              style={{ flex: 1 }}
            />
            <Button
              label="Create"
              onPress={handleCreateFolder}
              variant="primary"
              style={{ flex: 1 }}
              disabled={!folderName.trim()}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  pathBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    gap: Spacing.sm,
  },
  backBtn: { marginRight: Spacing.xs },
  pathText: { flex: 1, fontSize: FontSize.sm },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
  },
  fileCount: { fontSize: FontSize.sm },
  toolbarActions: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  toolbarBtn: { padding: 8 },
  newFolderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  newFolderLabel: { color: '#fff', fontSize: FontSize.sm, fontWeight: FontWeight.medium },
  list: { padding: Spacing.base, paddingBottom: 160 },
  fileActions: { paddingHorizontal: Spacing.base },
  fileAction: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    gap: Spacing.base,
    borderBottomWidth: 1,
  },
  fileActionLabel: { fontSize: FontSize.base },
  newFolderForm: { padding: Spacing.base, gap: Spacing.base },
  folderInput: {
    borderWidth: 1.5,
    paddingHorizontal: Spacing.base,
    paddingVertical: 12,
    fontSize: FontSize.base,
  },
  newFolderButtons: { flexDirection: 'row', gap: Spacing.md },
});
