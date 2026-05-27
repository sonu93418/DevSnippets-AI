// ============================================================
// Settings Screen — Theme, AI Config, Export All
// ============================================================
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Alert,
  TextInput,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { BorderRadius, Colors, FontSize, FontWeight, Spacing } from '../constants/theme';
import { getPreferences, setPreferences } from '../lib/storage/asyncStorage';
import { getAPIKey, setAPIKey, deleteAPIKey } from '../lib/storage/secureStorage';
import { getAllSnippetsForExport } from '../lib/db/snippets';
import { exportAllSnippets, shareFile } from '../lib/export/exportSnippet';
import { initFileSystem } from '../lib/files/fileManager';
import type { AIProvider, AppPreferences } from '../types';

type ThemeMode = AppPreferences['theme'];

const AI_PROVIDERS: { id: AIProvider; label: string; description: string }[] = [
  { id: 'gemini', label: 'Google Gemini', description: 'Free tier available · gemini-1.5-flash' },
  { id: 'openai', label: 'OpenAI GPT', description: 'GPT-4o mini · Requires paid key' },
  { id: 'none', label: 'Disabled', description: 'No AI features' },
];

const THEME_OPTIONS: { id: ThemeMode; label: string; icon: keyof typeof Feather.glyphMap }[] = [
  { id: 'light', label: 'Light', icon: 'sun' },
  { id: 'dark', label: 'Dark', icon: 'moon' },
  { id: 'system', label: 'System', icon: 'smartphone' },
];

export default function SettingsScreen() {
  const { theme, themeMode, setThemeMode } = useTheme();

  const [aiProvider, setAIProvider] = useState<AIProvider>('gemini');
  const [apiKey, setApiKeyState] = useState('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [savingKey, setSavingKey] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [prefs, setPrefsState] = useState<AppPreferences | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const p = await getPreferences();
    setPrefsState(p);
    setAIProvider(p.aiProvider);
    if (p.aiProvider !== 'none') {
      const key = await getAPIKey(p.aiProvider);
      if (key) setApiKeyState(key);
    }
  };

  const handleThemeChange = async (mode: ThemeMode) => {
    await setThemeMode(mode);
  };

  const handleAIProviderChange = async (provider: AIProvider) => {
    setAIProvider(provider);
    await setPreferences({ aiProvider: provider });
    if (provider !== 'none') {
      const key = await getAPIKey(provider);
      setApiKeyState(key ?? '');
    }
  };

  const handleSaveAPIKey = async () => {
    if (!apiKey.trim()) return;
    setSavingKey(true);
    try {
      await setAPIKey(aiProvider, apiKey.trim());
      setShowApiKeyInput(false);
      Alert.alert('Saved', 'API key stored securely.');
    } catch {
      Alert.alert('Error', 'Failed to save API key.');
    } finally {
      setSavingKey(false);
    }
  };

  const handleClearAPIKey = async () => {
    Alert.alert('Clear API Key', 'Remove stored API key?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: async () => {
          await deleteAPIKey(aiProvider);
          setApiKeyState('');
        },
      },
    ]);
  };

  const handleExportAll = async () => {
    setExporting(true);
    try {
      if (Platform.OS !== 'web') {
        await initFileSystem();
      }
      const snippets = await getAllSnippetsForExport();
      const uri = await exportAllSnippets(snippets);
      Alert.alert(
        'Export Complete',
        `${snippets.length} snippets exported.`,
        [
          { text: 'Share', onPress: () => shareFile(uri) },
          { text: 'OK' },
        ]
      );
    } catch {
      Alert.alert('Error', 'Export failed. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const SettingRow = ({
    icon,
    label,
    subtitle,
    rightElement,
    onPress,
    danger = false,
  }: {
    icon: keyof typeof Feather.glyphMap;
    label: string;
    subtitle?: string;
    rightElement?: React.ReactNode;
    onPress?: () => void;
    danger?: boolean;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      style={[styles.settingRow, { borderBottomColor: theme.colors.border }]}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View
        style={[
          styles.settingIcon,
          {
            backgroundColor: danger
              ? '#FEE2E2'
              : theme.isDark
              ? 'rgba(91,164,208,0.1)'
              : 'rgba(45,106,159,0.08)',
          },
        ]}
      >
        <Feather
          name={icon}
          size={18}
          color={danger ? '#DC2626' : theme.colors.primary}
        />
      </View>
      <View style={styles.settingContent}>
        <Text style={[styles.settingLabel, { color: danger ? '#DC2626' : theme.colors.textPrimary }]}>
          {label}
        </Text>
        {subtitle && (
          <Text style={[styles.settingSubtitle, { color: theme.colors.textTertiary }]}>
            {subtitle}
          </Text>
        )}
      </View>
      {rightElement ?? (onPress && (
        <Feather name="chevron-right" size={16} color={theme.colors.textTertiary} />
      ))}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: theme.colors.background }]}
      edges={['left', 'right', 'bottom']}
    >
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Appearance */}
        <Text style={[styles.sectionHeader, { color: theme.colors.textTertiary }]}>
          APPEARANCE
        </Text>
        <Card style={styles.card}>
          <Text style={[styles.cardTitle, { color: theme.colors.textSecondary }]}>
            Theme
          </Text>
          <View style={styles.themeRow}>
            {THEME_OPTIONS.map((opt) => {
              const active = themeMode === opt.id;
              return (
                <TouchableOpacity
                  key={opt.id}
                  onPress={() => handleThemeChange(opt.id)}
                  style={[
                    styles.themeOption,
                    {
                      backgroundColor: active
                        ? `${theme.colors.primary}18`
                        : theme.isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                      borderColor: active ? theme.colors.primary : theme.colors.border,
                      borderRadius: BorderRadius.md,
                    },
                  ]}
                >
                  <Feather name={opt.icon} size={18} color={active ? theme.colors.primary : theme.colors.textSecondary} />
                  <Text style={[styles.themeLabel, { color: active ? theme.colors.primary : theme.colors.textSecondary, fontWeight: active ? FontWeight.semibold : FontWeight.regular }]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>

        {/* AI */}
        <Text style={[styles.sectionHeader, { color: theme.colors.textTertiary }]}>
          AI CONFIGURATION
        </Text>
        <Card style={styles.card}>
          {AI_PROVIDERS.map((p, i) => {
            const active = aiProvider === p.id;
            return (
              <TouchableOpacity
                key={p.id}
                onPress={() => handleAIProviderChange(p.id)}
                style={[
                  styles.aiProvider,
                  {
                    borderBottomColor: theme.colors.border,
                    borderBottomWidth: i < AI_PROVIDERS.length - 1 ? 1 : 0,
                    backgroundColor: active ? `${theme.colors.primary}08` : 'transparent',
                  },
                ]}
              >
                <View
                  style={[
                    styles.radioCircle,
                    {
                      borderColor: active ? theme.colors.primary : theme.colors.border,
                    },
                  ]}
                >
                  {active && (
                    <View style={[styles.radioDot, { backgroundColor: theme.colors.primary }]} />
                  )}
                </View>
                <View style={styles.aiProviderContent}>
                  <Text style={[styles.aiProviderLabel, { color: theme.colors.textPrimary, fontWeight: active ? FontWeight.semibold : FontWeight.regular }]}>
                    {p.label}
                  </Text>
                  <Text style={[styles.aiProviderDesc, { color: theme.colors.textTertiary }]}>
                    {p.description}
                  </Text>
                </View>
                {active && <Feather name="check" size={16} color={theme.colors.primary} />}
              </TouchableOpacity>
            );
          })}
        </Card>

        {/* API Key */}
        {aiProvider !== 'none' && (
          <Card style={styles.card}>
            <SettingRow
              icon="key"
              label="API Key"
              subtitle={apiKey ? `${apiKey.slice(0, 8)}••••••••` : 'Not configured'}
              onPress={() => setShowApiKeyInput(true)}
            />
            {apiKey ? (
              <SettingRow
                icon="trash-2"
                label="Clear API Key"
                danger
                onPress={handleClearAPIKey}
              />
            ) : null}
          </Card>
        )}

        {/* Data */}
        <Text style={[styles.sectionHeader, { color: theme.colors.textTertiary }]}>
          DATA & STORAGE
        </Text>
        <Card style={styles.card}>
          <TouchableOpacity
            onPress={handleExportAll}
            disabled={exporting}
            style={[styles.settingRow, { borderBottomColor: 'transparent' }]}
          >
            <View style={[styles.settingIcon, { backgroundColor: theme.isDark ? 'rgba(91,164,208,0.1)' : 'rgba(45,106,159,0.08)' }]}>
              {exporting ? (
                <LoadingSpinner size="small" />
              ) : (
                <Feather name="download-cloud" size={18} color={theme.colors.primary} />
              )}
            </View>
            <View style={styles.settingContent}>
              <Text style={[styles.settingLabel, { color: theme.colors.textPrimary }]}>
                Export All Snippets
              </Text>
              <Text style={[styles.settingSubtitle, { color: theme.colors.textTertiary }]}>
                Save all snippets as JSON backup
              </Text>
            </View>
            <Feather name="chevron-right" size={16} color={theme.colors.textTertiary} />
          </TouchableOpacity>
        </Card>

        {/* About */}
        <Text style={[styles.sectionHeader, { color: theme.colors.textTertiary }]}>
          ABOUT
        </Text>
        <Card style={styles.card}>
          <View style={styles.aboutRow}>
            <View style={[styles.appIconBg, { backgroundColor: theme.colors.primary }]}>
              <Feather name="code" size={24} color="#FFFFFF" />
            </View>
            <View style={styles.aboutContent}>
              <Text style={[styles.appName, { color: theme.colors.textPrimary }]}>
                DevSnippets
              </Text>
              <Text style={[styles.appVersion, { color: theme.colors.textTertiary }]}>
                Version 1.0.0 · Scandinavian Theme 🇸🇪
              </Text>
              <Text style={[styles.appDesc, { color: theme.colors.textTertiary }]}>
                Built with Expo SDK 51 · SQLite · Offline-First
              </Text>
            </View>
          </View>
        </Card>

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* API Key Input Modal */}
      <Modal
        visible={showApiKeyInput}
        onClose={() => setShowApiKeyInput(false)}
        title={`${aiProvider === 'gemini' ? 'Gemini' : 'OpenAI'} API Key`}
        type="bottom"
      >
        <View style={styles.apiKeyForm}>
          <Text style={[styles.apiKeyHint, { color: theme.colors.textSecondary }]}>
            {aiProvider === 'gemini'
              ? 'Get your free key at aistudio.google.com'
              : 'Get your key at platform.openai.com'}
          </Text>
          <TextInput
            style={[
              styles.apiKeyInput,
              {
                backgroundColor: theme.colors.codeBg,
                borderColor: theme.colors.border,
                color: theme.colors.textPrimary,
                borderRadius: BorderRadius.md,
                fontFamily: 'monospace',
              },
            ]}
            placeholder="Paste API key here..."
            placeholderTextColor={theme.colors.textTertiary}
            value={apiKey}
            onChangeText={setApiKeyState}
            autoCapitalize="none"
            autoCorrect={false}
            secureTextEntry
          />
          <View style={styles.apiKeyButtons}>
            <Button
              label="Cancel"
              onPress={() => setShowApiKeyInput(false)}
              variant="secondary"
              size="md"
              fullWidth
              style={{ flex: 1 }}
            />
            <Button
              label="Save Securely"
              onPress={handleSaveAPIKey}
              variant="primary"
              loading={savingKey}
              icon="lock"
              size="md"
              fullWidth
              style={{ flex: 1 }}
            />
          </View>
          <View style={{ height: 24 }} />
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: Spacing.base, paddingBottom: 160 },
  sectionHeader: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginTop: Spacing.xl,
    marginBottom: Spacing.sm,
    marginLeft: Spacing.xs,
  },
  card: { padding: 0, overflow: 'hidden' },
  cardTitle: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.base,
    paddingBottom: Spacing.sm,
  },
  themeRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    padding: Spacing.base,
    paddingTop: 0,
  },
  themeOption: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    gap: 6,
    borderWidth: 1.5,
  },
  themeLabel: { fontSize: FontSize.sm },
  aiProvider: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  aiProviderContent: { flex: 1 },
  aiProviderLabel: { fontSize: FontSize.base },
  aiProviderDesc: { fontSize: FontSize.xs, marginTop: 2 },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
    borderBottomWidth: 1,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingContent: { flex: 1 },
  settingLabel: { fontSize: FontSize.base },
  settingSubtitle: { fontSize: FontSize.xs, marginTop: 2 },
  aboutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.base,
    gap: Spacing.base,
  },
  appIconBg: {
    width: 56,
    height: 56,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aboutContent: { flex: 1 },
  appName: { fontSize: FontSize.lg, fontWeight: FontWeight.bold },
  appVersion: { fontSize: FontSize.xs, marginTop: 2 },
  appDesc: { fontSize: FontSize.xs, marginTop: 2 },
  apiKeyForm: { padding: Spacing.base, gap: Spacing.base },
  apiKeyHint: { fontSize: FontSize.sm, lineHeight: 20 },
  apiKeyInput: {
    borderWidth: 1.5,
    paddingHorizontal: Spacing.base,
    paddingVertical: 12,
    fontSize: FontSize.sm,
  },
  apiKeyButtons: { flexDirection: 'row', gap: Spacing.md },
});
