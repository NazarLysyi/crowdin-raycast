import { Language } from '../types';

export function getLanguageName(languages: Language[], languageId: string): string {
  const language = languages.find((l) => l.data.id === languageId);
  return language?.data.name || languageId;
}
