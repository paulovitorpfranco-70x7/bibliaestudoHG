import type { BookDefinition, Chapter, Verse } from '@/domain/models/bible';

interface ArcVerseRecord {
  book: string;
  chapter: number;
  number: number;
  text: string;
}

const ARC_SOURCE_URLS = [
  '/data/bible-arc.json',
  'https://raw.githubusercontent.com/thiagobodruk/biblia/master/json/arc.json',
];

const BOOK_NAME_ALIASES: Record<string, string> = {
  cantaresdesalomao: normalizeBookName('Cânticos'),
  cantares: normalizeBookName('Cânticos'),
  atosdosapostolos: normalizeBookName('Atos'),
  apocalipsedejoao: normalizeBookName('Apocalipse'),
};

let remoteArcCache: ArcVerseRecord[] | null = null;
const bibleChapterSources = import.meta.glob<string>('@/data/*.json', {
  eager: true,
  query: '?raw',
  import: 'default',
});

const PLACEHOLDER_VERSE_REGEX = /^vers[íi]culo\s+1\s+do\s+cap[ií]tulo/i;

function escapeNewlinesInsideJsonStrings(rawJson: string): string {
  let sanitized = '';
  let inString = false;
  let escaping = false;

  for (let i = 0; i < rawJson.length; i++) {
    const char = rawJson[i];

    if (escaping) {
      sanitized += char;
      escaping = false;
      continue;
    }

    if (char === '\\') {
      sanitized += char;
      escaping = true;
      continue;
    }

    if (char === '"') {
      inString = !inString;
      sanitized += char;
      continue;
    }

    if (inString && (char === '\n' || char === '\r')) {
      sanitized += '\\n';
      if (char === '\r' && rawJson[i + 1] === '\n') {
        i += 1;
      }
      continue;
    }

    sanitized += char;
  }

  return sanitized;
}

function isPlaceholderChapterList(chapters: Chapter[]): boolean {
  if (chapters.length === 0) {
    return true;
  }

  return chapters.every(chapter => {
    if (!chapter?.verses || chapter.verses.length !== 1) {
      return false;
    }

    const verseText = chapter.verses[0]?.text?.trim() ?? '';
    return PLACEHOLDER_VERSE_REGEX.test(verseText);
  });
}

function normalizeBookName(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

function resolveNormalizedName(name: string): string {
  const normalized = normalizeBookName(name);
  return BOOK_NAME_ALIASES[normalized] ?? normalized;
}

function sanitizeVerses(verses: Verse[]): Verse[] {
  return verses.map(verse => ({
    number: verse.number,
    text: verse.text.trim(),
    strongs: verse.strongs,
  }));
}

function normalizeChapterList(bookId: number, rawChapters: Chapter[]): Chapter[] {
  return rawChapters
    .map(chapter => ({
      bookId,
      chapter: chapter.chapter,
      verses: sanitizeVerses(chapter.verses ?? []),
    }))
    .sort((a, b) => a.chapter - b.chapter);
}

async function loadLocalBookChapters(book: BookDefinition): Promise<Chapter[] | null> {
  const sourceKey = `@/data/${book.fileName}`;
  const rawContent = bibleChapterSources[sourceKey];

  if (!rawContent) {
    console.warn(`Arquivo local não encontrado para ${book.fileName}.`);
    return null;
  }

  try {
    const normalizedJson = escapeNewlinesInsideJsonStrings(rawContent);
    const chapters = JSON.parse(normalizedJson) as Chapter[];

    if (isPlaceholderChapterList(chapters)) {
      console.warn(`Dados fictícios detectados para ${book.name}; usando fonte remota.`);
      return null;
    }

    return normalizeChapterList(book.id, chapters);
  } catch (error) {
    console.warn(`Falha ao interpretar o arquivo ${book.fileName}:`, error);
    return null;
  }
}

async function fetchArcSourceData(): Promise<ArcVerseRecord[]> {
  if (remoteArcCache) {
    return remoteArcCache;
  }

  const errors: string[] = [];
  for (const url of ARC_SOURCE_URLS) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Status ${response.status}`);
      }
      const data = await response.json();
      if (!Array.isArray(data)) {
        throw new Error('Formato de resposta inválido');
      }
      const filtered = data.filter((record): record is ArcVerseRecord => {
        return (
          typeof record?.book === 'string' &&
          typeof record?.chapter === 'number' &&
          typeof record?.number === 'number' &&
          typeof record?.text === 'string'
        );
      });
      remoteArcCache = filtered;
      return filtered;
    } catch (error) {
      errors.push(`${url}: ${(error as Error).message}`);
    }
  }

  throw new Error(`Não foi possível obter o texto da ARC. Detalhes: ${errors.join(' | ')}`);
}

async function loadRemoteChapters(books: BookDefinition[]): Promise<Map<number, Chapter[]>> {
  const arcVerses = await fetchArcSourceData();
  const bookIndex = new Map<string, BookDefinition>();
  books.forEach(book => {
    bookIndex.set(normalizeBookName(book.name), book);
  });

  const grouped = new Map<number, Map<number, Verse[]>>();

  for (const record of arcVerses) {
    const bookMeta = bookIndex.get(resolveNormalizedName(record.book));
    if (!bookMeta) {
      continue;
    }

    const chapters = grouped.get(bookMeta.id) ?? new Map<number, Verse[]>();
    const verses = chapters.get(record.chapter) ?? [];

    verses.push({
      number: record.number,
      text: record.text.trim(),
    });

    chapters.set(record.chapter, verses);
    grouped.set(bookMeta.id, chapters);
  }

  const chapterMap = new Map<number, Chapter[]>();

  for (const [bookId, chapters] of grouped.entries()) {
    const orderedChapters = Array.from(chapters.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([chapterNumber, verses]) => ({
        bookId,
        chapter: chapterNumber,
        verses: verses.sort((a, b) => a.number - b.number),
      }));

    chapterMap.set(bookId, orderedChapters);
  }

  return chapterMap;
}

export async function loadArcBibleChapters(books: BookDefinition[]): Promise<Map<number, Chapter[]>> {
  const chapterMap = new Map<number, Chapter[]>();
  const missingBooks: BookDefinition[] = [];

  for (const book of books) {
    const chapters = await loadLocalBookChapters(book);
    if (chapters) {
      chapterMap.set(book.id, chapters);
      if (chapters.length !== book.chapterCount) {
        console.warn(
          `Número de capítulos divergente para ${book.name}. Esperado ${book.chapterCount}, recebido ${chapters.length}.`
        );
      }
    } else {
      missingBooks.push(book);
    }
  }

  if (missingBooks.length === 0) {
    return chapterMap;
  }

  console.info(`Carregando ${missingBooks.length} livros a partir da fonte remota da ARC...`);
  const remoteChapters = await loadRemoteChapters(books);

  for (const book of missingBooks) {
    const chapters = remoteChapters.get(book.id);
    if (!chapters) {
      throw new Error(`Não foi possível obter capítulos para ${book.name} nas fontes locais ou remotas.`);
    }
    chapterMap.set(book.id, chapters);
  }

  return chapterMap;
}
