
import React, { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../services/database';
import type { Book } from '../types';
import { IconX, IconCheck } from '../constants';

interface BookChapterSelectorProps {
  currentBookId: number;
  onSelect: (bookId: number, chapter: number) => void;
  onClose: () => void;
  darkMode: boolean;
}

const BookChapterSelector: React.FC<BookChapterSelectorProps> = ({ currentBookId, onSelect, onClose, darkMode }) => {
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [view, setView] = useState<'books' | 'chapters'>('books');
  const [testament, setTestament] = useState<'old' | 'new'>('old');

  const books = useLiveQuery(() => db.books.where('testament').equals(testament).toArray(), [testament], []);

  const handleBookClick = (book: Book) => {
    setSelectedBook(book);
    setView('chapters');
  };

  const ChapterGrid = () => {
    if (!selectedBook) return null;
    return (
      <div className="p-4">
        <button onClick={() => setView('books')} className="font-semibold text-indigo-600 dark:text-indigo-400 mb-4">
          &larr; Voltar para livros
        </button>
        <h3 className="text-2xl font-bold mb-4">{selectedBook.name}</h3>
        <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 gap-2">
          {Array.from({ length: selectedBook.chapterCount }, (_, i) => i + 1).map(chapter => (
            <button
              key={chapter}
              onClick={() => onSelect(selectedBook.id, chapter)}
              className="aspect-square flex items-center justify-center font-bold text-lg bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200 rounded-lg hover:bg-indigo-500 hover:text-white transition-colors"
            >
              {chapter}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const BookGrid = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4">
      {books?.map(book => (
        <button
          key={book.id}
          onClick={() => handleBookClick(book)}
          className={`p-4 rounded-lg text-left transition-colors ${
            book.id === currentBookId
              ? 'bg-indigo-600 text-white font-bold'
              : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          {book.name}
          {book.id === currentBookId && <IconCheck className="w-5 h-5 inline-block ml-2"/>}
        </button>
      ))}
    </div>
  );
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn" onClick={onClose}>
      <div 
        className={`w-full max-w-2xl h-[80vh] flex flex-col rounded-2xl shadow-2xl animate-slideUp ${darkMode ? 'bg-gray-800 text-gray-200' : 'bg-white'}`}
        onClick={e => e.stopPropagation()}
      >
        <header className="p-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold">Selecione um Livro</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
            <IconX className="w-6 h-6" />
          </button>
        </header>
        
        <div className="p-2 bg-gray-100 dark:bg-gray-900">
            <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setTestament('old')} className={`px-4 py-2 rounded-lg font-semibold transition-colors ${testament === 'old' ? 'bg-indigo-600 text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
                    Antigo Testamento
                </button>
                <button onClick={() => setTestament('new')} className={`px-4 py-2 rounded-lg font-semibold transition-colors ${testament === 'new' ? 'bg-indigo-600 text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
                    Novo Testamento
                </button>
            </div>
        </div>

        <div className="flex-grow overflow-y-auto">
          {view === 'books' ? <BookGrid /> : <ChapterGrid />}
        </div>
      </div>
    </div>
  );
};

export default BookChapterSelector;
