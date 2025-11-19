import type { BibleRepository } from '@/domain/repositories/BibleRepository';
import type { Note } from '@/domain/models/bible';
import { bibleDatasource } from '@/data/datasources/BibleDexieDatasource';

export class BibleRepositoryImpl implements BibleRepository {
  getBookById(bookId: number) {
    return bibleDatasource.getBook(bookId);
  }

  watchBookById(bookId: number) {
    return bibleDatasource.watchBook(bookId);
  }

  watchBooksByTestament(testament: 'old' | 'new') {
    return bibleDatasource.watchBooksByTestament(testament);
  }

  getBooks() {
    return bibleDatasource.listBooks();
  }

  getChapter(bookId: number, chapter: number) {
    return bibleDatasource.getChapter(bookId, chapter);
  }

  watchChapter(bookId: number, chapter: number) {
    return bibleDatasource.watchChapter(bookId, chapter);
  }

  searchStrongEntry(code: string) {
    return bibleDatasource.getStrongEntry(code);
  }

  getStrongEntries() {
    return bibleDatasource.getAllStrongEntries();
  }

  getNotes() {
    return bibleDatasource.getNotes();
  }

  watchNotes() {
    return bibleDatasource.watchNotes();
  }

  saveNote(note: Note) {
    return bibleDatasource.saveNote(note);
  }

  deleteNote(noteId: number) {
    return bibleDatasource.deleteNote(noteId);
  }
}

export const bibleRepository = new BibleRepositoryImpl();
