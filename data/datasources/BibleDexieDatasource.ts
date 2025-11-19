import { useLiveQuery } from 'dexie-react-hooks';
import type { Book, Chapter, Note, StrongEntry } from '@/domain/models/bible';
import { bibleDB, type ProgressCallback } from '@/infra/database/bibleDb';

export class BibleDexieDatasource {
  isPopulated() {
    return bibleDB.isPopulated();
  }

  populate(onProgress: ProgressCallback) {
    return bibleDB.populate(onProgress);
  }

  listBooks(): Promise<Book[]> {
    return bibleDB.books.toArray();
  }

  getBook(bookId: number): Promise<Book | undefined> {
    return bibleDB.books.get(bookId);
  }

  watchBook(bookId: number) {
    return () => bibleDB.books.get(bookId);
  }

  watchBooksByTestament(testament: 'old' | 'new') {
    return () => bibleDB.books.where('testament').equals(testament).toArray();
  }

  getChapter(bookId: number, chapter: number): Promise<Chapter | undefined> {
    return bibleDB.chapters.get([bookId, chapter]);
  }

  watchChapter(bookId: number, chapter: number) {
    return () => bibleDB.chapters.get([bookId, chapter]);
  }

  getStrongEntry(code: string): Promise<StrongEntry | undefined> {
    return bibleDB.strongs.get(code);
  }

  getAllStrongEntries(): Promise<StrongEntry[]> {
    return bibleDB.strongs.toArray();
  }

  getNotes(): Promise<Note[]> {
    return bibleDB.notes.orderBy('updatedAt').reverse().toArray();
  }

  watchNotes() {
    return () => bibleDB.notes.orderBy('updatedAt').reverse().toArray();
  }

  saveNote(note: Note): Promise<number> {
    if (note.id) {
      return bibleDB.notes.put(note);
    }
    return bibleDB.notes.add(note);
  }

  deleteNote(id: number) {
    return bibleDB.notes.delete(id);
  }
}

export const bibleDatasource = new BibleDexieDatasource();
export { useLiveQuery };
