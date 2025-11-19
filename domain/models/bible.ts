export interface Book {
  id: number;
  name: string;
  testament: 'old' | 'new';
  chapterCount: number;
}

export interface BookDefinition extends Book {
  fileName: string;
}

export interface StrongReference {
  position: number;
  code: string;
}

export interface Verse {
  number: number;
  text: string;
  strongs?: StrongReference[];
}

export interface Chapter {
  bookId: number;
  chapter: number;
  verses: Verse[];
}

export interface StrongEntry {
  code: string;
  language: 'hebrew' | 'greek';
  original: string;
  transliteration: string;
  pronunciation: string;
  definition: string;
  etymology?: string;
  occurrences: {
    total: number;
    old: number;
    new: number;
  };
  relatedVerses?: RelatedVerse[];
}

export interface RelatedVerse {
  reference: string;
  text: string;
}

export interface Note {
  id?: number;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  verseReference?: string;
}
