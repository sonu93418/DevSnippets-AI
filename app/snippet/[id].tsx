// ============================================================
// Snippet Detail Screen — Full view, edit, export, AI
// ============================================================
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Share,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useSnippets } from '../../hooks/useSnippets';
import { CodeViewer } from '../../components/snippet/CodeViewer';
import { LanguageBadge } from '../../components/snippet/LanguageBadge';
import { getLanguageExtension, getLanguageLabel } from '../../constants/languages';
import { Tag } from '../../components/ui/Tag';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { SnippetForm } from '../../components/snippet/SnippetForm';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { BorderRadius, Colors, FontSize, FontWeight, Spacing } from '../../constants/theme';
import {
  exportSnippetToFile,
  shareSnippet,
  copySnippetToClipboard,
} from '../../lib/export/exportSnippet';
import { initFileSystem } from '../../lib/files/fileManager';
import * as Clipboard from 'expo-clipboard';
import type { Snippet, ExportFormat } from '../../types';

const EXPORT_FORMATS: { label: string; format: ExportFormat; icon: keyof typeof Feather.glyphMap }[] = [
  { label: 'Text File (.txt)', format: 'txt', icon: 'file-text' },
  { label: 'Language Native', format: 'js', icon: 'code' },
  { label: 'JSON (.json)', format: 'json', icon: 'database' },
  { label: 'Markdown (.md)', format: 'md', icon: 'hash' },
];

export default function SnippetDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme } = useTheme();
  const { getSnippet, editSnippet, removeSnippet, toggleSnippetFavorite } = useSnippets();

  const [snippet, setSnippet] = useState<Snippet | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    loadSnippet();
  }, [id]);

  const loadSnippet = async () => {
    if (!id) return;
    setLoading(true);
    const s = await getSnippet(id);
    setSnippet(s);
    setLoading(false);
  };

  const handleToggleFavorite = async () => {
    if (!snippet) return;
    const newVal = await toggleSnippetFavorite(snippet.id);
    setSnippet({ ...snippet, isFavorite: newVal });
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Snippet',
      `Delete "${snippet?.title}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (snippet) {
              await removeSnippet(snippet.id);
              router.back();
            }
          },
        },
      ]
    );
  };

  const handleEdit = async (values: any) => {
    if (!snippet) return;
    await editSnippet({ id: snippet.id, ...values });
    setEditing(false);
    loadSnippet();
  };

  const handleExport = async (format: ExportFormat) => {
    if (!snippet) return;
    try {
      setExporting(true);
      if (Platform.OS !== 'web') {
        await initFileSystem();
      }
      const uri = await exportSnippetToFile(snippet, { format, includeMetadata: true });
      setShowExport(false);
      Alert.alert('Exported!', `Saved to: ${uri}`, [
        { text: 'Share', onPress: () => shareSnippet(snippet, { format, includeMetadata: false }) },
        { text: 'OK' },
      ]);
    } catch (e) {
      Alert.alert('Export Failed', String(e));
    } finally {
      setExporting(false);
    }
  };

  const handleShare = async () => {
    if (!snippet) return;
    try {
      await shareSnippet(snippet);
    } catch {
      await copySnippetToClipboard(snippet);
      Alert.alert('Copied!', 'Code copied to clipboard.');
    }
  };

  const handleCopy = async () => {
    if (!snippet) return;
    await copySnippetToClipboard(snippet);
    Alert.alert('Copied!', 'Code copied to clipboard.');
  };

  if (loading) return <LoadingSpinner fullScreen label="Loading..." />;
  if (!snippet) {
    return (
      <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
        <Text style={{ color: theme.colors.textSecondary }}>Snippet not found.</Text>
      </View>
    );
  }

  if (editing) {
    return (
      <>
        <Stack.Screen options={{ title: 'Edit Snippet' }} />
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['bottom']}>
          <SnippetForm
            initialValues={snippet}
            onSubmit={handleEdit}
            onCancel={() => setEditing(false)}
            isEditing
          />
        </SafeAreaView>
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: snippet.title,
          headerRight: () => (
            <View style={styles.headerActions}>
              <TouchableOpacity onPress={handleToggleFavorite} style={styles.headerBtn}>
                <Feather
                  name="star"
                  size={20}
                  color={snippet.isFavorite ? Colors.favorite : theme.colors.textSecondary}
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setEditing(true)} style={styles.headerBtn}>
                <Feather name="edit-2" size={20} color={theme.colors.primary} />
              </TouchableOpacity>
            </View>
          ),
        }}
      />
      <SafeAreaView
        style={[styles.safe, { backgroundColor: theme.colors.background }]}
        edges={['bottom']}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* Meta Card: language, file, run command */}
          <View style={[styles.metaCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <View style={styles.metaLeft}>
              <LanguageBadge language={snippet.language} />
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text style={[styles.metaTitle, { color: theme.colors.textPrimary }]}>{getLanguageLabel(snippet.language)}</Text>
                <Text style={[styles.metaSub, { color: theme.colors.textTertiary }]}>Updated {new Date(snippet.updatedAt).toLocaleDateString()}</Text>
                {snippet.filePath ? (
                  <Text style={[styles.metaSub, { color: theme.colors.textTertiary }]}>Path: {snippet.filePath}</Text>
                ) : null}
              </View>
            </View>

            <View style={styles.metaRight}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.commandRow}>
                {(() => {
                  const ext = getLanguageExtension(snippet.language);
                  const baseName = snippet.filePath ? snippet.filePath.split('/').pop()?.split('.')[0] ?? 'snippet' : 'snippet';
                  let cmd = '';
                  switch (snippet.language) {
                    case 'javascript':
                    case 'js':
                      cmd = `node ${baseName}.${ext}`;
                      break;
                    case 'typescript':
                    case 'ts':
                      cmd = `ts-node ${baseName}.${ext}`;
                      break;
                    case 'python':
                    case 'py':
                      cmd = `python ${baseName}.${ext}`;
                      break;
                    case 'go':
                      cmd = `go run ${baseName}.${ext}`;
                      break;
                    case 'rust':
                      cmd = `cargo run`;
                      break;
                    case 'bash':
                    case 'sh':
                      cmd = `bash ${baseName}.${ext}`;
                      break;
                    default:
                      cmd = `// No run command for .${ext}`;
                  }

                  return (
                    <View style={[styles.commandBox, { backgroundColor: theme.colors.codeBg, borderColor: theme.colors.border }]}>
                      <Text style={[styles.commandText, { color: theme.colors.textPrimary }]} selectable numberOfLines={1} ellipsizeMode="middle">{cmd}</Text>
                      <TouchableOpacity onPress={async () => { await Clipboard.setStringAsync(cmd); Alert.alert('Copied', 'Command copied to clipboard'); }} style={styles.commandCopy}>
                        <Feather name="copy" size={14} color={theme.colors.textTertiary} />
                      </TouchableOpacity>
                    </View>
                  );
                })()}
              </ScrollView>
            </View>
          </View>

          {/* Tags */}
          {snippet.tags.length > 0 && (
            <View style={styles.tagsRow}>
              {snippet.tags.map((tag) => (
                <Tag key={tag} label={tag} />
              ))}
            </View>
          )}

          {/* Code Viewer */}
          <CodeViewer
            code={snippet.code}
            language={snippet.language}
            showLineNumbers
          />

          {/* Action Buttons */}
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              onPress={handleCopy}
              style={[styles.actionTile, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
            >
              <Feather name="copy" size={20} color={theme.colors.primary} />
              <Text style={[styles.actionLabel, { color: theme.colors.textPrimary }]}>Copy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleShare}
              style={[styles.actionTile, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
            >
              <Feather name="share-2" size={20} color={theme.colors.primary} />
              <Text style={[styles.actionLabel, { color: theme.colors.textPrimary }]}>Share</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowExport(true)}
              style={[styles.actionTile, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
            >
              <Feather name="download" size={20} color={theme.colors.primary} />
              <Text style={[styles.actionLabel, { color: theme.colors.textPrimary }]}>Export</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push(`/snippet/ai-explain/${snippet.id}`)}
              style={[
                styles.actionTile,
                styles.aiTile,
                { backgroundColor: `${theme.colors.primary}18`, borderColor: `${theme.colors.primary}44` },
              ]}
            >
              <Feather name="zap" size={20} color={theme.colors.primary} />
              <Text style={[styles.actionLabel, { color: theme.colors.primary, fontWeight: FontWeight.semibold }]}>
                AI Explain
              </Text>
            </TouchableOpacity>

            {/* Delete tile (danger) */}
            <TouchableOpacity
              onPress={handleDelete}
              style={[
                styles.actionTile,
                styles.deleteTile,
                { backgroundColor: `${theme.colors.danger}12`, borderColor: `${theme.colors.danger}30` },
              ]}
            >
              <Feather name="trash-2" size={18} color={theme.colors.danger} />
              <Text style={[styles.actionLabel, { color: theme.colors.danger }]}>Delete</Text>
            </TouchableOpacity>
          </View>

          {/* removed bottom delete button (now in action tiles) */}
        </ScrollView>

        {/* Export Modal */}
        <Modal
          visible={showExport}
          onClose={() => setShowExport(false)}
          title="Export As"
          type="bottom"
        >
          <View style={styles.exportList}>
            {EXPORT_FORMATS.map((f) => (
              <TouchableOpacity
                key={f.format}
                onPress={() => handleExport(f.format)}
                disabled={exporting}
                style={[
                  styles.exportItem,
                  { borderBottomColor: theme.colors.border },
                ]}
              >
                <Feather name={f.icon} size={20} color={theme.colors.primary} />
                <Text style={[styles.exportLabel, { color: theme.colors.textPrimary }]}>
                  {f.label}
                </Text>
                {exporting && <ActivityIndicator size="small" color={theme.colors.primary} />}
              </TouchableOpacity>
            ))}
            <View style={{ height: 24 }} />
          </View>
        </Modal>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { padding: Spacing.base, paddingBottom: 160 },
  headerActions: { flexDirection: 'row', gap: Spacing.sm, marginRight: Spacing.sm },
  headerBtn: { padding: 6, width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  date: { fontSize: FontSize.xs },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: Spacing.base },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.xl,
    marginBottom: Spacing.base,
  },
  actionTile: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10, // matches Button md touch size
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    gap: Spacing.sm,
    minHeight: 44,
  },
  deleteTile: {
    // subtle stronger border for danger action
    borderWidth: 1.25,
  },
  
  aiTile: { borderWidth: 1.5 },
  actionLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.medium },
  deleteBtn: { marginTop: Spacing.xl },
  exportList: { paddingHorizontal: Spacing.base },
  exportItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    gap: Spacing.base,
    borderBottomWidth: 1,
  },
  exportLabel: { flex: 1, fontSize: FontSize.base },
  metaCard: {
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  metaTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
  metaSub: {
    fontSize: FontSize.sm,
    marginTop: 2,
  },
  metaRight: {
    marginLeft: Spacing.base,
    minWidth: 140,
    maxWidth: '45%',
  },
  commandRow: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  commandBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  commandText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: FontSize.sm,
    marginRight: Spacing.sm,
  },
  commandCopy: {
    padding: 6,
    borderRadius: 8,
  },
});
