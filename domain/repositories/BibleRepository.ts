import type { Book, Chapter, Note, StrongEntry } from '@/domain/models/bible';

export interface BibleRepository {
  getBookById(bookId: number): Promise<Book | undefined>;
  watchBookById(bookId: number): () => Promise<Book | undefined>;
  watchBooksByTestament(testament: 'old' | 'new'): () => Promise<Book[]>;
  getBooks(): Promise<Book[]>;
  getChapter(bookId: number, chapter: number): Promise<Chapter | undefined>;
  watchChapter(bookId: number, chapter: number): () => Promise<Chapter | undefined>;
  searchStrongEntry(code: string): Promise<StrongEntry | undefined>;
  getStrongEntries(): Promise<StrongEntry[]>;
  getNotes(): Promise<Note[]>;
  watchNotes(): () => Promise<Note[]>;
  saveNote(note: Note): Promise<number>;
  deleteNote(noteId: number): Promise<void>;
}
