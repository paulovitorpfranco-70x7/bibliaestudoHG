import React from 'react';
import type { Verse } from '@/domain/models/bible';
import { IconChevronLeft, IconChevronRight, IconSettings, IconBookOpen } from '@/ui/icons/IconSet';
import { ReaderController } from '@/features/reader/hooks/useReaderController';
import BookChapterSelector from '@/features/reader/components/selector/BookChapterSelector';
import VerseActionToolbar from '@/features/reader/components/toolbar/VerseActionToolbar';
import StrongsModal from '@/features/reader/components/modals/StrongsModal';

interface ReaderViewProps {
  controller: ReaderController;
  onNavigateHome: () => void;
  darkMode: boolean;
}

const renderVerseText = (
  verse: Verse,
  strongsMode: boolean,
  onSelectStrong: (code: string) => void,
) => {
  if (!strongsMode || !verse.strongs?.length) {
    return verse.text;
  }

  const words = verse.text.split(' ');
  return words.map((word, index) => {
    const strong = verse.strongs?.find(s => s.position === index);
    if (strong) {
      const cleanWord = word.replace(/[.,;:]/g, '');
      const punctuation = word.substring(cleanWord.length);
      return (
        <React.Fragment key={`${verse.number}-${index}`}>
          <span
            onClick={(e) => { e.stopPropagation(); onSelectStrong(strong.code); }}
            className="text-indigo-600 dark:text-indigo-400 font-semibold cursor-pointer hover:underline"
          >
            {cleanWord}
          </span>
          {punctuation}{' '}
        </React.Fragment>
      );
    }
    return `${word} `;
  });
};

const ReaderView: React.FC<ReaderViewProps> = ({ controller, onNavigateHome, darkMode }) => {
  const { data, state, actions, refs } = controller;

  const renderContent = () => {
    if (!data.chapter || !data.book) {
      return (
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <IconBookOpen className="w-16 h-16 text-indigo-300 animate-pulse mb-4" />
          <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Carregando capítulo...</h3>
          <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-2`}>
            Buscando os textos sagrados em nossos arquivos.
          </p>
        </div>
      );
    }

    return (
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-lg p-6 md:p-8 mb-8`}>
        <div className="font-serif text-lg leading-loose space-y-2">
          {data.chapter.verses.map((verse) => (
            <span
              key={verse.number}
              onClick={() => actions.toggleVerse(verse.number)}
              className={`cursor-pointer relative rounded-md p-2 transition-colors duration-200 ${
                state.activeVerse === verse.number
                  ? (darkMode ? 'bg-indigo-900/40' : 'bg-indigo-100/80')
                  : (darkMode ? 'hover:bg-gray-700/50' : 'hover:bg-indigo-50/80')
              }`}
            >
              <sup className={`font-sans font-bold text-xs mr-2 select-none ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
                {verse.number}
              </sup>
              <span className={darkMode ? 'text-gray-200' : 'text-gray-800'}>
                {renderVerseText(verse, state.strongsMode, actions.openStrong)}
              </span>
              {state.activeVerse === verse.number && data.book && (
                <VerseActionToolbar verse={verse} bookName={data.book.name} darkMode={darkMode} />
              )}
            </span>
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
      <div className={`min-h-screen flex flex-col transition-colors duration-300 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <header className={`${darkMode ? 'bg-gray-800/95' : 'bg-white/95'} backdrop-blur-lg sticky top-0 z-40 shadow-sm`}>
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between mb-4">
              <button onClick={onNavigateHome} className="flex items-center gap-2 hover:opacity-70 transition-opacity">
                <IconChevronLeft className={`w-5 h-5 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`} />
                <span className={`font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Início</span>
              </button>
              <div className="flex gap-2">
                <button className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors`}>
                  <IconSettings className={`w-5 h-5 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`} />
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between gap-4">
              <button
                onClick={() => actions.navigateChapter('prev')}
                disabled={state.currentChapter <= 1}
                className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed`}
              >
                <IconChevronLeft className={`w-6 h-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`} />
              </button>
              <button
                onClick={actions.openSelector}
                className="text-center hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg p-2 transition-colors flex-grow"
              >
                <h2 className={`font-bold text-xl ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  {data.book?.name || 'Carregando...'}
                </h2>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Capítulo {state.currentChapter || '...'}
                </p>
              </button>
              <button
                onClick={() => actions.navigateChapter('next')}
                disabled={!data.book || state.currentChapter >= (data.book?.chapterCount ?? 0)}
                className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed`}
              >
                <IconChevronRight className={`w-6 h-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`} />
              </button>
            </div>
          </div>
        </header>

        <main ref={refs.mainContentRef} className="max-w-4xl w-full mx-auto px-4 py-8 flex-grow overflow-y-auto">
          {renderContent()}
        </main>

        <button
          onClick={actions.toggleStrongsMode}
          className={`fixed bottom-8 right-8 w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 ${
            state.strongsMode ? 'bg-gradient-to-r from-indigo-600 to-purple-600' : 'bg-gray-700'
          }`}
        >
          <span className="text-white text-2xl font-bold select-none">Αω</span>
        </button>

        {state.selectedStrong && (
          <StrongsModal strongCode={state.selectedStrong} onClose={actions.closeStrong} darkMode={darkMode} />
        )}
      </div>
      {state.isSelectorOpen && (
        <BookChapterSelector
          currentBookId={state.currentBookId}
          onSelect={actions.selectChapter}
          onClose={actions.closeSelector}
          darkMode={darkMode}
        />
      )}
    </>
  );
};

export default ReaderView;
