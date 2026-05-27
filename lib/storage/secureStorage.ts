// ============================================================
// SecureStore — API Keys & Sensitive Data
// ============================================================
import * as SecureStore from 'expo-secure-store';
import type { AIProvider } from '../../types';

const KEYS = {
  OPENAI_KEY: 'devsnippets_openai_key',
  GEMINI_KEY: 'devsnippets_gemini_key',
} as const;

export async function getAPIKey(provider: AIProvider): Promise<string | null> {
  if (provider === 'none') return null;
  try {
    const key = provider === 'openai' ? KEYS.OPENAI_KEY : KEYS.GEMINI_KEY;
    return await SecureStore.getItemAsync(key);
  } catch {
    return null;
  }
}

export async function setAPIKey(provider: AIProvider, key: string): Promise<void> {
  if (provider === 'none') return;
  const storeKey = provider === 'openai' ? KEYS.OPENAI_KEY : KEYS.GEMINI_KEY;
  await SecureStore.setItemAsync(storeKey, key);
}

export async function deleteAPIKey(provider: AIProvider): Promise<void> {
  if (provider === 'none') return;
  const storeKey = provider === 'openai' ? KEYS.OPENAI_KEY : KEYS.GEMINI_KEY;
  await SecureStore.deleteItemAsync(storeKey);
}

export async function hasAPIKey(provider: AIProvider): Promise<boolean> {
  const key = await getAPIKey(provider);
  return !!key && key.trim().length > 0;
}
