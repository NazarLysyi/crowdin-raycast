export interface Project {
  data: {
    id: number;
    name: string;
    webUrl: string;
    groupId?: number;
    description?: string;
    sourceLanguageId?: string;
    targetLanguageIds?: string[];
  };
}

export interface Group {
  data: {
    id: number;
    name: string;
    parentId?: number;
  };
}

export interface Language {
  data: {
    id: string;
    name: string;
  };
}

export interface TranslationProgress {
  data: {
    data: {
      languageId: string;
      words: {
        total: number;
        translated: number;
        approved: number;
      };
      phrases: {
        total: number;
        translated: number;
        approved: number;
      };
    };
  }[];
}
