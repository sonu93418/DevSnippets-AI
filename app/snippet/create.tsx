// ============================================================
// Create Snippet Screen
// ============================================================
import React from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { router, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';
import { useSnippets } from '../../hooks/useSnippets';
import { SnippetForm } from '../../components/snippet/SnippetForm';
import type { SnippetCreateInput } from '../../types';

export default function CreateSnippetScreen() {
  const { theme } = useTheme();
  const { addSnippet } = useSnippets();

  const safeClose = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/');
  };

  const handleSubmit = async (values: SnippetCreateInput) => {
    try {
      await addSnippet(values);
      safeClose();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      Alert.alert('Error', `Failed to create snippet.\n\n${message}`);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'New Snippet',
          headerStyle: { backgroundColor: theme.colors.surface },
          headerTitleStyle: { color: theme.colors.textPrimary, fontWeight: '600' },
          headerTintColor: theme.colors.primary,
          presentation: 'modal',
        }}
      />
      <SafeAreaView
        style={[styles.safe, { backgroundColor: theme.colors.background }]}
        edges={['bottom']}
      >
        <SnippetForm
          onSubmit={handleSubmit}
          onCancel={safeClose}
        />
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
});
