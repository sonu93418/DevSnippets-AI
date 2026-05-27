// ============================================================
// useAI — AI explanation hook
// ============================================================
import { useState, useCallback } from 'react';
import type { AIExplanation, AIProvider } from '../types';
import { explainCode } from '../lib/ai/aiClient';
import { getPreferences } from '../lib/storage/asyncStorage';

interface UseAIReturn {
  explanation: AIExplanation | null;
  loading: boolean;
  error: string | null;
  generate: (code: string, language: string) => Promise<void>;
  clear: () => void;
}

export function useAI(): UseAIReturn {
  const [explanation, setExplanation] = useState<AIExplanation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async (code: string, language: string) => {
    try {
      setLoading(true);
      setError(null);
      setExplanation(null);

      const prefs = await getPreferences();
      const provider: AIProvider = prefs.aiProvider;

      const result = await explainCode(code, language, provider);
      setExplanation(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to generate AI explanation. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const clear = useCallback(() => {
    setExplanation(null);
    setError(null);
  }, []);

  return { explanation, loading, error, generate, clear };
}
