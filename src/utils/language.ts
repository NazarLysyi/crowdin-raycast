export interface Language {
  data: {
    id: string;
    name: string;
  };
}

export function getLanguageName(languages: Language[], languageId: string): string {
  const language = languages.find(l => l.data.id === languageId);
  return language?.data.name || languageId;
} 