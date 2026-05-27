// ============================================================
// AI Explanation Screen
// ============================================================
import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../../hooks/useTheme';
import { useAI } from '../../../hooks/useAI';
import { useSnippets } from '../../../hooks/useSnippets';
import { CodeViewer } from '../../../components/snippet/CodeViewer';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { BorderRadius, FontSize, FontWeight, Spacing } from '../../../constants/theme';
import type { Snippet } from '../../../types';

export default function AIExplainScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme } = useTheme();
  const { getSnippet } = useSnippets();
  const { explanation, loading, error, generate, clear } = useAI();

  const [snippet, setSnippet] = React.useState<Snippet | null>(null);

  useEffect(() => {
    if (id) {
      getSnippet(id).then((s) => {
        setSnippet(s);
        if (s) generate(s.code, s.language);
      });
    }
    return () => clear();
  }, [id]);

  const handleRetry = () => {
    if (snippet) generate(snippet.code, snippet.language);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'AI Explanation',
          headerRight: () =>
            explanation ? (
              <TouchableOpacity onPress={handleRetry} style={{ marginRight: 8 }}>
                <Feather name="refresh-cw" size={18} color={theme.colors.primary} />
              </TouchableOpacity>
            ) : null,
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
          {/* Snippet Preview */}
          {snippet && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
                ANALYZING
              </Text>
              <Text style={[styles.snippetTitle, { color: theme.colors.textPrimary }]}>
                {snippet.title}
              </Text>
              <CodeViewer
                code={snippet.code}
                language={snippet.language}
                maxHeight={160}
                showLineNumbers={false}
              />
            </View>
          )}

          {/* Loading */}
          {loading && (
            <View style={styles.loadingContainer}>
              <View
                style={[
                  styles.loadingCard,
                  { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
                ]}
              >
                <LoadingSpinner label="Generating AI explanation..." />
                <Text style={[styles.loadingHint, { color: theme.colors.textTertiary }]}>
                  Powered by Gemini / OpenAI
                </Text>
              </View>
            </View>
          )}

          {/* Error */}
          {error && !loading && (
            <Card style={[styles.errorCard, { borderColor: '#DC262640' }]}>
              <Feather name="alert-circle" size={24} color="#DC2626" />
              <Text style={[styles.errorTitle, { color: '#DC2626' }]}>
                AI Unavailable
              </Text>
              <Text style={[styles.errorText, { color: theme.colors.textSecondary }]}>
                {error}
              </Text>
              <View style={styles.errorActions}>
                <Button
                  label="Configure AI"
                  onPress={() => router.push('/settings')}
                  variant="outline"
                  size="sm"
                  icon="settings"
                />
                <Button
                  label="Retry"
                  onPress={handleRetry}
                  variant="primary"
                  size="sm"
                  icon="refresh-cw"
                />
              </View>
            </Card>
          )}

          {/* AI Result */}
          {explanation && !loading && (
            <View style={styles.resultsContainer}>
              {/* Summary */}
              <Card style={styles.resultCard} elevated>
                <View style={styles.resultHeader}>
                  <View style={[styles.resultIcon, { backgroundColor: `${theme.colors.primary}18` }]}>
                    <Feather name="zap" size={16} color={theme.colors.primary} />
                  </View>
                  <Text style={[styles.resultTitle, { color: theme.colors.textPrimary }]}>
                    Summary
                  </Text>
                </View>
                <Text style={[styles.resultText, { color: theme.colors.textSecondary }]}>
                  {explanation.summary}
                </Text>
              </Card>

              {/* Explanation */}
              <Card style={styles.resultCard} elevated>
                <View style={styles.resultHeader}>
                  <View style={[styles.resultIcon, { backgroundColor: '#16A34A18' }]}>
                    <Feather name="book-open" size={16} color="#16A34A" />
                  </View>
                  <Text style={[styles.resultTitle, { color: theme.colors.textPrimary }]}>
                    Explanation
                  </Text>
                </View>
                <Text style={[styles.resultText, { color: theme.colors.textSecondary, lineHeight: 22 }]}>
                  {explanation.explanation}
                </Text>
              </Card>

              {/* Improvements */}
              {explanation.improvements.length > 0 && (
                <Card style={styles.resultCard} elevated>
                  <View style={styles.resultHeader}>
                    <View style={[styles.resultIcon, { backgroundColor: '#D9770618' }]}>
                      <Feather name="trending-up" size={16} color="#D97706" />
                    </View>
                    <Text style={[styles.resultTitle, { color: theme.colors.textPrimary }]}>
                      Improvements
                    </Text>
                  </View>
                  {explanation.improvements.map((item, i) => (
                    <View key={i} style={styles.improvementItem}>
                      <View style={[styles.improvementNum, { backgroundColor: theme.colors.primary }]}>
                        <Text style={styles.improvementNumText}>{i + 1}</Text>
                      </View>
                      <Text style={[styles.improvementText, { color: theme.colors.textSecondary }]}>
                        {item}
                      </Text>
                    </View>
                  ))}
                </Card>
              )}

              {/* Provider info */}
              <Text style={[styles.providerInfo, { color: theme.colors.textTertiary }]}>
                Generated by {explanation.provider === 'gemini' ? 'Google Gemini' : 'OpenAI GPT'}{' '}
                · {new Date(explanation.generatedAt).toLocaleTimeString()}
              </Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: Spacing.base, paddingBottom: 160, gap: Spacing.base },
  section: { gap: Spacing.sm },
  sectionTitle: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  snippetTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, marginBottom: Spacing.sm },
  loadingContainer: { alignItems: 'center', paddingVertical: Spacing['2xl'] },
  loadingCard: {
    alignItems: 'center',
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: Spacing.xl,
    width: '100%',
    gap: Spacing.md,
  },
  loadingHint: { fontSize: FontSize.xs },
  errorCard: {
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: '#FEF2F2',
    borderWidth: 1.5,
  },
  errorTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold },
  errorText: { textAlign: 'center', fontSize: FontSize.base, lineHeight: 22 },
  errorActions: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.sm },
  resultsContainer: { gap: Spacing.base },
  resultCard: { gap: Spacing.md },
  resultHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  resultIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultTitle: { fontSize: FontSize.md, fontWeight: FontWeight.semibold },
  resultText: { fontSize: FontSize.base },
  improvementItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    paddingTop: Spacing.sm,
  },
  improvementNum: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  improvementNumText: { color: '#fff', fontSize: 11, fontWeight: FontWeight.bold },
  improvementText: { flex: 1, fontSize: FontSize.base, lineHeight: 22 },
  providerInfo: { fontSize: FontSize.xs, textAlign: 'center', paddingTop: Spacing.sm },
});
