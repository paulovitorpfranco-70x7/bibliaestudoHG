// FIX: Separated the Dexie default import from the named type import to resolve subclassing errors.
import Dexie from 'dexie';
import type { Table } from 'dexie';
import type { Book, Chapter, StrongEntry, Note } from '../types';

type BookWithFileName = Book & { fileName: string };
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
      const [allBooks, strongsData] = await Promise.all([
        fetch('/data/books.json').then(res => res.json()) as Promise<BookWithFileName[]>,
        fetch('/data/strongs.json').then(res => res.json())
      ]);

      const strongsToSeed: StrongEntry[] = Object.values(strongsData);

      // Populate books and strongs first
      await this.transaction('rw', this.books, this.strongs, async () => {
        await this.books.bulkAdd(allBooks);
        await this.strongs.bulkAdd(strongsToSeed);
      });
      console.log("Books and Strong's dictionary populated.");
      
      onProgress(0, 'livros');

      // Populate chapters incrementally
      for (let i = 0; i < allBooks.length; i++) {
        const book = allBooks[i];
        const percentage = Math.round(((i + 1) / allBooks.length) * 100);

        if (book.fileName) {
          try {
            const response = await fetch(`/data/${book.fileName}`);
            if (!response.ok) {
              throw new Error(`File not found: ${book.fileName}`);
            }
            const bookChapters: Chapter[] = await response.json();
            await this.chapters.bulkAdd(bookChapters);
             console.log(`Successfully loaded ${book.name}`);
          } catch (error) {
            console.warn(`Could not load book data for ${book.name}:`, (error as Error).message);
          }
        }
        
        onProgress(percentage, book.name);
         // A small delay to allow UI to update
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