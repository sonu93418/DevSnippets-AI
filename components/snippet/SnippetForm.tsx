// ============================================================
// SnippetForm — Create/Edit snippet form
// ============================================================
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { BorderRadius, Colors, FontSize, FontWeight, Spacing } from '../../constants/theme';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Tag } from '../ui/Tag';
import { Modal } from '../ui/Modal';
import { LANGUAGES } from '../../constants/languages';
import { LanguageBadge } from './LanguageBadge';
import type { SnippetCreateInput } from '../../types';

interface SnippetFormProps {
  initialValues?: Partial<SnippetCreateInput>;
  onSubmit: (values: SnippetCreateInput) => Promise<void>;
  onCancel: () => void;
  isEditing?: boolean;
}

export function SnippetForm({
  initialValues,
  onSubmit,
  onCancel,
  isEditing = false,
}: SnippetFormProps) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const footerBottomPadding = Platform.OS === 'ios' ? insets.bottom + 96 : insets.bottom + 88;

  const [title, setTitle] = useState(initialValues?.title ?? '');
  const [code, setCode] = useState(initialValues?.code ?? '');
  const [language, setLanguage] = useState(initialValues?.language ?? 'javascript');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(initialValues?.tags ?? []);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showLangPicker, setShowLangPicker] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = 'Title is required';
    if (!code.trim()) e.code = 'Code cannot be empty';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleAddTag = () => {
    const raw = tagInput.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '');
    if (raw && !tags.includes(raw)) {
      setTags([...tags, raw]);
    }
    setTagInput('');
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      setLoading(true);
      await onSubmit({ title: title.trim(), code: code.trim(), language, tags });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top + 12 : 0}
      style={{ flex: 1 }}
    >
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}> 
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.content,
            { paddingBottom: footerBottomPadding },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Title */}
          <Input
            label="Title"
            placeholder="e.g. Debounce Hook"
            value={title}
            onChangeText={setTitle}
            icon="type"
            error={errors.title}
            autoCapitalize="words"
          />

          {/* Language Picker */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { color: theme.colors.textSecondary }]}> 
              LANGUAGE
            </Text>
            <TouchableOpacity
              onPress={() => setShowLangPicker(true)}
              style={[
                styles.langPicker,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                  borderRadius: BorderRadius.md,
                },
              ]}
            >
              <LanguageBadge language={language} />
              <Feather name="chevron-down" size={16} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Tags */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { color: theme.colors.textSecondary }]}> 
              TAGS
            </Text>
            <View style={styles.tagInputRow}>
              <TextInput
                style={[
                  styles.tagInput,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border,
                    color: theme.colors.textPrimary,
                    borderRadius: BorderRadius.md,
                    fontSize: FontSize.base,
                  },
                ]}
                placeholder="Add tag..."
                placeholderTextColor={theme.colors.textTertiary}
                value={tagInput}
                onChangeText={setTagInput}
                onSubmitEditing={handleAddTag}
                returnKeyType="done"
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={handleAddTag}
                style={[styles.addTagBtn, { backgroundColor: theme.colors.primary, borderRadius: BorderRadius.md }]}
              >
                <Feather name="plus" size={18} color="#fff" />
              </TouchableOpacity>
            </View>
            {tags.length > 0 && (
              <View style={styles.tagsContainer}>
                {tags.map((t) => (
                  <Tag key={t} label={t} onRemove={() => handleRemoveTag(t)} />
                ))}
              </View>
            )}
          </View>

          {/* Code Editor */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { color: theme.colors.textSecondary }]}> 
              CODE {errors.code ? <Text style={{ color: '#DC2626' }}>— {errors.code}</Text> : null}
            </Text>
            <View
              style={[
                styles.codeEditor,
                {
                  backgroundColor: theme.colors.codeBg,
                  borderColor: errors.code ? '#DC2626' : theme.colors.border,
                  borderRadius: BorderRadius.lg,
                },
              ]}
            >
              <TextInput
                style={[
                  styles.codeInput,
                  {
                    color: theme.colors.textPrimary,
                    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
                    fontSize: FontSize.sm,
                  },
                ]}
                value={code}
                onChangeText={setCode}
                multiline
                scrollEnabled={false}
                placeholder={`// Paste your ${language} code here...`}
                placeholderTextColor={theme.colors.textTertiary}
                autoCapitalize="none"
                autoCorrect={false}
                spellCheck={false}
                textAlignVertical="top"
              />
            </View>
          </View>
        </ScrollView>

        {/* Actions */}
        <View
          style={[
            styles.footer,
            {
              backgroundColor: theme.colors.background,
              borderTopColor: theme.colors.border,
              paddingBottom: footerBottomPadding,
            },
          ]}
        >
          <View style={styles.actions}>
            <Button
              label="Cancel"
              onPress={onCancel}
              variant="secondary"
              size="md"
              fullWidth
              style={styles.actionButton}
            />
            <Button
              label={isEditing ? 'Save Changes' : 'Create Snippet'}
              onPress={handleSubmit}
              variant="primary"
              size="md"
              loading={loading}
              icon={isEditing ? 'save' : 'plus'}
              fullWidth
              style={styles.actionButton}
            />
          </View>
        </View>
      </View>

      {/* Language Picker Modal */}
      <Modal
        visible={showLangPicker}
        onClose={() => setShowLangPicker(false)}
        title="Select Language"
        type="bottom"
      >
        <ScrollView style={styles.langList} showsVerticalScrollIndicator={false}>
          {LANGUAGES.map((lang) => (
            <TouchableOpacity
              key={lang.id}
              onPress={() => {
                setLanguage(lang.id);
                setShowLangPicker(false);
              }}
              style={[
                styles.langItem,
                {
                  backgroundColor:
                    language === lang.id
                      ? `${lang.color}18`
                      : 'transparent',
                  borderBottomColor: theme.colors.border,
                },
              ]}
            >
              <View style={[styles.langDot, { backgroundColor: lang.color }]} />
              <Text
                style={[
                  styles.langLabel,
                  {
                    color: language === lang.id ? lang.color : theme.colors.textPrimary,
                    fontWeight: language === lang.id ? FontWeight.semibold : FontWeight.regular,
                  },
                ]}
              >
                {lang.label}
              </Text>
              {language === lang.id && (
                <Feather name="check" size={16} color={lang.color} />
              )}
            </TouchableOpacity>
          ))}
          <View style={{ height: 32 }} />
        </ScrollView>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: Spacing.base,
    paddingBottom: Spacing.xl,
  },
  fieldGroup: {
    marginBottom: Spacing.base,
  },
  fieldLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  langPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingVertical: 14,
    borderWidth: 1.5,
  },
  tagInputRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  tagInput: {
    flex: 1,
    borderWidth: 1.5,
    paddingHorizontal: Spacing.base,
    paddingVertical: 10,
    height: 44,
  },
  addTagBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: Spacing.sm,
  },
  codeEditor: {
    borderWidth: 1.5,
    minHeight: 200,
    padding: Spacing.md,
  },
  codeInput: {
    minHeight: 180,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.md,
    alignItems: 'stretch',
  },
  footer: {
    borderTopWidth: 1,
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.base,
  },
  actionButton: {
    flex: 1,
    minWidth: 0,
  },
  langList: {
    maxHeight: 400,
    paddingHorizontal: Spacing.base,
  },
  langItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: Spacing.sm,
    borderBottomWidth: 1,
    gap: Spacing.md,
  },
  langDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  langLabel: {
    flex: 1,
    fontSize: FontSize.base,
  },
});
