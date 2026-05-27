// ============================================================
// CodeViewer — Monospace code block with copy button
// ============================================================
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useTheme } from '../../hooks/useTheme';
import { BorderRadius, FontSize, Spacing } from '../../constants/theme';
import { LanguageBadge } from './LanguageBadge';

interface CodeViewerProps {
  code: string;
  language: string;
  maxHeight?: number;
  showLineNumbers?: boolean;
}

export function CodeViewer({
  code,
  language,
  maxHeight,
  showLineNumbers = true,
}: CodeViewerProps) {
  const { theme } = useTheme();
  const [copied, setCopied] = useState(false);

  const lines = code.split('\n');

  const handleCopy = async () => {
    await Clipboard.setStringAsync(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.codeBg,
          borderRadius: BorderRadius.lg,
          borderColor: theme.colors.border,
          ...theme.shadow.sm,
        },
      ]}
    >
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <LanguageBadge language={language} small />
        <TouchableOpacity
          onPress={handleCopy}
          style={[
            styles.copyBtn,
            { backgroundColor: copied ? '#16A34A22' : theme.colors.surface },
          ]}
          activeOpacity={0.7}
        >
          <Feather
            name={copied ? 'check' : 'copy'}
            size={14}
            color={copied ? '#16A34A' : theme.colors.textSecondary}
          />
          <Text
            style={[
              styles.copyText,
              { color: copied ? '#16A34A' : theme.colors.textSecondary },
            ]}
          >
            {copied ? 'Copied!' : 'Copy'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Code */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={maxHeight ? { maxHeight } : undefined}
        nestedScrollEnabled
      >
        <ScrollView showsVerticalScrollIndicator style={styles.codeScroll} nestedScrollEnabled>
          <View style={styles.codeContent}>
            {showLineNumbers && (
              <View style={styles.lineNumbers}>
                {lines.map((_, i) => (
                  <Text
                    key={i}
                    style={[styles.lineNumber, { color: theme.colors.textTertiary }]}
                  >
                    {i + 1}
                  </Text>
                ))}
              </View>
            )}
            <View style={styles.codeLines}>
              {lines.map((line, i) => (
                <Text
                  key={i}
                  style={[styles.codeLine, { color: theme.colors.textPrimary }]}
                >
                  {line || ' '}
                </Text>
              ))}
            </View>
          </View>
        </ScrollView>
      </ScrollView>
    </View>
  );
}

const MONO_FONT = Platform.OS === 'ios' ? 'Menlo' : 'monospace';
const LINE_HEIGHT = 20;

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: BorderRadius.sm,
  },
  copyText: {
    fontSize: FontSize.xs,
    fontWeight: '500',
  },
  codeScroll: {
    flex: 1,
  },
  codeContent: {
    flexDirection: 'row',
    padding: Spacing.base,
  },
  lineNumbers: {
    marginRight: Spacing.base,
    alignItems: 'flex-end',
    minWidth: 28,
  },
  lineNumber: {
    fontFamily: MONO_FONT,
    fontSize: FontSize.sm,
    lineHeight: LINE_HEIGHT,
  },
  codeLines: {
    flex: 1,
  },
  codeLine: {
    fontFamily: MONO_FONT,
    fontSize: FontSize.sm,
    lineHeight: LINE_HEIGHT,
  },
});
