import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import type { Book, Chapter } from '@/domain/models/bible';
import { useBibleRepository } from '@/shared/hooks/useBibleRepository';
import { useLiveQuery } from '@/data/datasources/BibleDexieDatasource';

type Direction = 'next' | 'prev';

export interface ReaderControllerState {
  strongsMode: boolean;
  selectedStrong: string | null;
  isSelectorOpen: boolean;
  activeVerse: number | null;
  currentBookId: number;
  currentChapter: number;
}

export interface ReaderControllerActions {
  toggleStrongsMode(): void;
  openStrong(code: string): void;
  closeStrong(): void;
  openSelector(): void;
  closeSelector(): void;
  selectChapter(bookId: number, chapter: number): void;
  navigateChapter(direction: Direction): void;
  toggleVerse(verseNumber: number): void;
}

export interface ReaderController {
  state: ReaderControllerState;
  actions: ReaderControllerActions;
  data: {
    book?: Book;
    chapter?: Chapter;
  };
  refs: {
    mainContentRef: RefObject<HTMLDivElement>;
  };
}

const storage = {
  getBookId(): number {
    if (typeof window === 'undefined') return 1;
    const stored = window.localStorage.getItem('currentBookId');
    return stored ? parseInt(stored, 10) : 1;
  },
  getChapter(): number {
    if (typeof window === 'undefined') return 1;
    const stored = window.localStorage.getItem('currentChapter');
    return stored ? parseInt(stored, 10) : 1;
  },
  set(bookId: number, chapter: number) {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem('currentBookId', bookId.toString());
    window.localStorage.setItem('currentChapter', chapter.toString());
  },
};

export const useReaderController = (): ReaderController => {
  const repository = useBibleRepository();
  const mainContentRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<ReaderControllerState>({
    strongsMode: false,
    selectedStrong: null,
    isSelectorOpen: false,
    activeVerse: null,
    currentBookId: storage.getBookId(),
    currentChapter: storage.getChapter(),
  });

  const bookQuery = useMemo(
    () => repository.watchBookById(state.currentBookId),
    [repository, state.currentBookId],
  );
  const chapterQuery = useMemo(
    () => repository.watchChapter(state.currentBookId, state.currentChapter),
    [repository, state.currentBookId, state.currentChapter],
  );

  const book = useLiveQuery(bookQuery, [bookQuery]);
  const chapter = useLiveQuery(chapterQuery, [chapterQuery]);

  useEffect(() => {
    storage.set(state.currentBookId, state.currentChapter);
    setState(prev => (prev.activeVerse ? { ...prev, activeVerse: null } : prev));
    mainContentRef.current?.scrollTo(0, 0);
  }, [state.currentBookId, state.currentChapter]);

  const toggleStrongsMode = useCallback(() => {
    setState(prev => ({ ...prev, strongsMode: !prev.strongsMode }));
  }, []);

  const openStrong = useCallback((code: string) => {
    setState(prev => ({ ...prev, selectedStrong: code }));
  }, []);

  const closeStrong = useCallback(() => {
    setState(prev => ({ ...prev, selectedStrong: null }));
  }, []);

  const openSelector = useCallback(() => {
    setState(prev => ({ ...prev, isSelectorOpen: true }));
  }, []);

  const closeSelector = useCallback(() => {
    setState(prev => ({ ...prev, isSelectorOpen: false }));
  }, []);

  const selectChapter = useCallback((bookId: number, chapterNumber: number) => {
    setState(prev => ({ ...prev, currentBookId: bookId, currentChapter: chapterNumber, isSelectorOpen: false }));
  }, []);

  const navigateChapter = useCallback((direction: Direction) => {
    if (!book) return;
    setState(prev => {
      if (direction === 'next' && prev.currentChapter < book.chapterCount) {
        return { ...prev, currentChapter: prev.currentChapter + 1 };
      }
      if (direction === 'prev' && prev.currentChapter > 1) {
        return { ...prev, currentChapter: prev.currentChapter - 1 };
      }
      return prev;
    });
  }, [book]);

  const toggleVerse = useCallback((verseNumber: number) => {
    setState(prev => ({ ...prev, activeVerse: prev.activeVerse === verseNumber ? null : verseNumber }));
  }, []);

  return {
    state,
    actions: {
      toggleStrongsMode,
      openStrong,
      closeStrong,
      openSelector,
      closeSelector,
      selectChapter,
      navigateChapter,
      toggleVerse,
    },
    data: {
      book,
      chapter,
    },
    refs: {
      mainContentRef,
    },
  };
};
