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

  // Lightweight JS/TS tokenizer to provide VS Code-like syntax colors.
  // Falls back to plain text for unrecognised languages.
  function tokenize(line: string) {
    // order matters: comments, strings, numbers, keywords, identifiers(func), booleans, whitespace, everything else
    const keywords = '\\b(?:const|let|var|function|return|if|else|for|while|switch|case|break|new|class|extends|import|from|export|default|try|catch|finally|throw|await|async|typeof|instanceof|in|of)\\b';
    const tokenRegex = new RegExp(
      `(//.*$|/\\*[\\s\\S]*?\\*/|"(?:\\\\.|[^"\\\\])*"|'(?:\\\\.|[^'\\\\])*'|` +
        "`(?:\\\\.|[^`\\\\])*`" +
        `|\\b\\d+(?:\\.\\d+)?\\b|${keywords}|[A-Za-z_$][\\w$]*(?=\\s*\\()|\\b(?:true|false|null|undefined)\\b|\\s+|.)`,
      'g',
    );

    const parts: { text: string; type: string }[] = [];
    let m: RegExpExecArray | null;
    while ((m = tokenRegex.exec(line)) !== null) {
      const t = m[0];
      let type = 'plain';
      if (t.startsWith('//') || t.startsWith('/*')) type = 'comment';
      else if (t.startsWith('"') || t.startsWith("'") || t.startsWith('`')) type = 'string';
      else if (/^\d/.test(t)) type = 'number';
      else if (new RegExp(keywords).test(t)) type = 'keyword';
      else if (/^[A-Za-z_$][\w$]*\($/.test(t + '(')) type = 'function';
      else if (/^(true|false|null|undefined)$/.test(t)) type = 'literal';
      else if (/^\s+$/.test(t)) type = 'whitespace';
      else if (/^[(){}\[\].,;:+\-*/%!=<>|&^~?:]+$/.test(t)) type = 'operator';
      parts.push({ text: t, type });
    }
    return parts;
  }

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
                <Text key={i} style={styles.codeLine}>
                  {tokenize(line).map((tok, j) => {
                    const colorMap: { [k: string]: string } = {
                      keyword: theme.colors.syntax?.keyword || theme.colors.primary,
                      string: theme.colors.syntax?.string || '#A31515',
                      comment: theme.colors.syntax?.comment || '#6A9955',
                      function: theme.colors.syntax?.function || theme.colors.primary,
                      number: theme.colors.syntax?.number || theme.colors.tabActive,
                      operator: theme.colors.syntax?.operator || theme.colors.textTertiary,
                      variable: theme.colors.syntax?.variable || theme.colors.textPrimary,
                      literal: theme.colors.syntax?.number || theme.colors.tabActive,
                      plain: theme.colors.textPrimary,
                      whitespace: theme.colors.textPrimary,
                    };

                    const tokenColor = colorMap[tok.type] || theme.colors.textPrimary;
                    return (
                      <Text key={j} style={{ color: tokenColor, fontFamily: MONO_FONT }}>
                        {tok.text || ' '}
                      </Text>
                    );
                  })}
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
