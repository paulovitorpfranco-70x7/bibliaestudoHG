// FIX: Separated the Dexie default import from the named type import to resolve subclassing errors.
import Dexie from 'dexie';
import type { Table } from 'dexie';
import type { Book, BookDefinition, Chapter, StrongEntry, Note } from '../types';
import booksJson from '../data/books.json';
import strongsJson from '../data/strongs.json';
import { loadArcBibleChapters } from './arcSource';

type ProgressCallback = (percentage: number, bookName: string) => void;

export class BibleDB extends Dexie {
  books!: Table<Book, number>;
  chapters!: Table<Chapter, [number, number]>; // Compound key [bookId, chapter]
  strongs!: Table<StrongEntry, string>; // Key is the strong code
  notes!: Table<Note, number>;

  constructor() {
    super('BibleDatabase');
    this.version(2).stores({
      books: 'id, name, testament',
      chapters: '[bookId+chapter], bookId',
      strongs: 'code, language',
      notes: '++id, updatedAt',
    });
  }

  async isPopulated(): Promise<boolean> {
    const bookCount = await this.books.count();
    return bookCount > 0;
  }

  async populate(onProgress: ProgressCallback): Promise<void> {
    console.log("Starting incremental database population...");
    try {
      const allBooks = booksJson as BookDefinition[];
      const strongsToSeed: StrongEntry[] = Object.values(strongsJson as Record<string, StrongEntry>);

      onProgress(0, 'Baixando tradução ARC');
      const arcChaptersMap = await loadArcBibleChapters(allBooks);

      await this.transaction('rw', this.books, this.strongs, async () => {
        await this.books.clear();
        await this.strongs.clear();

        await this.books.bulkAdd(allBooks);
        await this.strongs.bulkAdd(strongsToSeed);
      });

      console.log("Books and Strong's dictionary populated.");
      onProgress(0, 'Preparando capítulos');

      await this.chapters.clear();

      for (let i = 0; i < allBooks.length; i++) {
        const book = allBooks[i];
        const bookChapters = arcChaptersMap.get(book.id);

        if (!bookChapters || bookChapters.length === 0) {
          console.warn(`Nenhum capítulo encontrado para ${book.name}.`);
          continue;
        }

        await this.chapters.bulkAdd(bookChapters);
        console.log(`Successfully loaded ${book.name}`);

        const percentage = Math.round(((i + 1) / allBooks.length) * 100);
        onProgress(percentage, book.name);
        await new Promise(resolve => setTimeout(resolve, 20));
      }

      console.log("Database population completed successfully.");
    } catch (error) {
      console.error("Failed to populate database:", error);
      throw error; // Rethrow so the UI can handle it
    }
  }
}

export const db = new BibleDB();