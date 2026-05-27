// ============================================================
// AI Client — Provider Abstraction (OpenAI / Gemini)
// ============================================================
import type { AIProvider, AIExplanation } from '../../types';
import { getAPIKey } from '../storage/secureStorage';

const PROMPT_TEMPLATE = (code: string, language: string) => `
You are an expert software engineer. Analyze the following ${language} code and provide:

1. **Summary**: A concise one-sentence summary of what this code does.
2. **Explanation**: A clear explanation of the code logic, broken into steps.
3. **Improvements**: 3 specific, actionable improvement suggestions.

Format your response as JSON:
{
  "summary": "...",
  "explanation": "...",
  "improvements": ["suggestion 1", "suggestion 2", "suggestion 3"]
}

Code:
\`\`\`${language}
${code}
\`\`\`

Return ONLY the JSON object, no markdown code blocks.
`;

// --- Gemini API ---
async function explainWithGemini(code: string, language: string, apiKey: string): Promise<AIExplanation> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: PROMPT_TEMPLATE(code, language) }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 1024,
        },
      }),
    }
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message ?? `Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  return parseAIResponse(text, 'gemini');
}

// --- OpenAI API ---
async function explainWithOpenAI(code: string, language: string, apiKey: string): Promise<AIExplanation> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are an expert code reviewer. Always respond with valid JSON.' },
        { role: 'user', content: PROMPT_TEMPLATE(code, language) },
      ],
      temperature: 0.3,
      max_tokens: 1024,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message ?? `OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content ?? '';
  return parseAIResponse(text, 'openai');
}

// --- Parse AI response ---
function parseAIResponse(text: string, provider: AIProvider): AIExplanation {
  try {
    // Strip markdown code fences if present
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(cleaned);
    return {
      summary: parsed.summary ?? 'No summary provided.',
      explanation: parsed.explanation ?? 'No explanation provided.',
      improvements: Array.isArray(parsed.improvements) ? parsed.improvements : [],
      provider,
      generatedAt: new Date().toISOString(),
    };
  } catch {
    // Fallback: return raw text
    return {
      summary: 'AI response received.',
      explanation: text,
      improvements: [],
      provider,
      generatedAt: new Date().toISOString(),
    };
  }
}

// --- Main export ---
export async function explainCode(
  code: string,
  language: string,
  provider: AIProvider
): Promise<AIExplanation> {
  if (provider === 'none') {
    throw new Error('No AI provider configured. Please set one in Settings.');
  }

  const apiKey = await getAPIKey(provider);
  if (!apiKey || apiKey.trim().length === 0) {
    throw new Error(`No API key found for ${provider}. Please add your API key in Settings.`);
  }

  if (provider === 'gemini') {
    return explainWithGemini(code, language, apiKey);
  } else {
    return explainWithOpenAI(code, language, apiKey);
  }
}
