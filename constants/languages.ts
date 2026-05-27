export interface Language {
  id: string;
  label: string;
  extension: string;
  color: string;
}

export const LANGUAGES: Language[] = [
  { id: 'javascript', label: 'JavaScript', extension: 'js', color: '#F7DF1E' },
  { id: 'typescript', label: 'TypeScript', extension: 'ts', color: '#3178C6' },
  { id: 'python', label: 'Python', extension: 'py', color: '#3572A5' },
  { id: 'rust', label: 'Rust', extension: 'rs', color: '#DEA584' },
  { id: 'go', label: 'Go', extension: 'go', color: '#00ADD8' },
  { id: 'swift', label: 'Swift', extension: 'swift', color: '#FA7343' },
  { id: 'kotlin', label: 'Kotlin', extension: 'kt', color: '#7F52FF' },
  { id: 'java', label: 'Java', extension: 'java', color: '#B07219' },
  { id: 'cpp', label: 'C++', extension: 'cpp', color: '#F34B7D' },
  { id: 'c', label: 'C', extension: 'c', color: '#555555' },
  { id: 'csharp', label: 'C#', extension: 'cs', color: '#178600' },
  { id: 'php', label: 'PHP', extension: 'php', color: '#4F5D95' },
  { id: 'ruby', label: 'Ruby', extension: 'rb', color: '#701516' },
  { id: 'css', label: 'CSS', extension: 'css', color: '#563D7C' },
  { id: 'html', label: 'HTML', extension: 'html', color: '#E34C26' },
  { id: 'sql', label: 'SQL', extension: 'sql', color: '#336791' },
  { id: 'bash', label: 'Bash', extension: 'sh', color: '#4EAA25' },
  { id: 'yaml', label: 'YAML', extension: 'yaml', color: '#CB171E' },
  { id: 'json', label: 'JSON', extension: 'json', color: '#2E7D32' },
  { id: 'markdown', label: 'Markdown', extension: 'md', color: '#083FA1' },
  { id: 'plaintext', label: 'Plain Text', extension: 'txt', color: '#6B7280' },
];

export const LANGUAGE_MAP: Record<string, Language> = LANGUAGES.reduce(
  (acc, lang) => ({ ...acc, [lang.id]: lang }),
  {}
);

export function getLanguageColor(languageId: string): string {
  return LANGUAGE_MAP[languageId]?.color ?? '#6B7280';
}

export function getLanguageExtension(languageId: string): string {
  return LANGUAGE_MAP[languageId]?.extension ?? 'txt';
}

export function getLanguageLabel(languageId: string): string {
  return LANGUAGE_MAP[languageId]?.label ?? languageId;
}
