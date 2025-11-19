import Dexie, { type Table } from 'dexie';
import type { Book, BookDefinition, Chapter, Note, StrongEntry } from '@/domain/models/bible';
import booksJson from '@/data/books.json';
import strongsJson from '@/data/strongs.json';
import { loadArcBibleChapters } from '@/infra/database/loadArcSource';

type ProgressCallback = (percentage: number, bookName: string) => void;

export class BibleDB extends Dexie {
  books!: Table<Book, number>;
  chapters!: Table<Chapter, [number, number]>;
  strongs!: Table<StrongEntry, string>;
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

    await this.chapters.clear();

    for (let i = 0; i < allBooks.length; i++) {
      const book = allBooks[i];
      const bookChapters = arcChaptersMap.get(book.id);
      if (!bookChapters?.length) {
        continue;
      }

      await this.chapters.bulkAdd(bookChapters);
      const percentage = Math.round(((i + 1) / allBooks.length) * 100);
      onProgress(percentage, book.name);
      await new Promise(resolve => setTimeout(resolve, 20));
    }
  }
}

export const bibleDB = new BibleDB();
export type { ProgressCallback };
