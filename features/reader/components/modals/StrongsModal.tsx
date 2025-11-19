
import React, { useMemo } from 'react';
import { IconX, IconVolume2, IconChevronRight, IconBookOpen } from '@/ui/icons/IconSet';
import { useLiveQuery } from '@/data/datasources/BibleDexieDatasource';
import { useBibleRepository } from '@/shared/hooks/useBibleRepository';

interface StrongsModalProps {
  strongCode: string;
  onClose: () => void;
  darkMode: boolean;
}

const StrongsModal: React.FC<StrongsModalProps> = ({ strongCode, onClose, darkMode }) => {
  const repository = useBibleRepository();
  const strongQuery = useMemo(() => () => repository.searchStrongEntry(strongCode), [repository, strongCode]);
  const strongData = useLiveQuery(strongQuery, [strongQuery]);

  if (!strongData) {
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn" onClick={onClose}>
             <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-3xl p-8`}>
                <IconBookOpen className="w-12 h-12 text-indigo-400 animate-pulse" />
             </div>
        </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn" onClick={onClose}>
      <div 
        className={`${darkMode ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-800'} rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl transform transition-all duration-300 animate-slideUp`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 p-6 rounded-t-3xl z-10">
          <div className="flex items-center justify-between mb-4">
            <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white font-bold text-sm">
              {strongData.code}
            </span>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
              <IconX className="w-6 h-6 text-white" />
            </button>
          </div>
          <h2 className="text-5xl text-white text-center mb-2 font-serif" dir={strongData.language === 'hebrew' ? 'rtl' : 'ltr'}>
            {strongData.original}
          </h2>
          <p className="text-white/90 text-center text-xl">
            {strongData.transliteration}
          </p>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-600'} uppercase tracking-wide`}>Pronúncia</span>
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                <IconVolume2 className="w-5 h-5 text-indigo-600" />
              </button>
            </div>
            <p className={`text-lg`}>{strongData.pronunciation}</p>
          </div>

          <div>
            <span className={`text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-600'} uppercase tracking-wide block mb-2`}>Definição</span>
            <p className={`text-base leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{strongData.definition}</p>
          </div>

          <div>
            <span className={`text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-600'} uppercase tracking-wide block mb-3`}>Ocorrências na Bíblia</span>
            <div className="grid grid-cols-3 gap-4">
              <div className={`${darkMode ? 'bg-gray-700' : 'bg-gradient-to-br from-indigo-50 to-purple-50'} rounded-xl p-4 text-center`}>
                <div className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">{strongData.occurrences.total}</div>
                <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} uppercase mt-1`}>Total</div>
              </div>
              <div className={`${darkMode ? 'bg-gray-700' : 'bg-gradient-to-br from-blue-50 to-cyan-50'} rounded-xl p-4 text-center`}>
                <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">{strongData.occurrences.old}</div>
                <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} uppercase mt-1`}>AT</div>
              </div>
              <div className={`${darkMode ? 'bg-gray-700' : 'bg-gradient-to-br from-green-50 to-emerald-50'} rounded-xl p-4 text-center`}>
                <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">{strongData.occurrences.new}</div>
                <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} uppercase mt-1`}>NT</div>
              </div>
            </div>
          </div>
          
          {strongData.relatedVerses && strongData.relatedVerses.length > 0 && (
             <div>
                <span className={`text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-600'} uppercase tracking-wide block mb-3`}>Versículos Relacionados</span>
                <div className="space-y-2">
                  {strongData.relatedVerses.map(verse => (
                    <div key={verse.reference} className={`${darkMode ? 'bg-gray-700 hover:bg-gray-600/50' : 'bg-gray-50 hover:bg-gray-100'} rounded-lg p-3 cursor-pointer transition-colors`}>
                        <div className="flex items-center justify-between">
                            <span className="font-semibold text-indigo-600 dark:text-indigo-400">{verse.reference}</span>
                            <IconChevronRight className="w-4 h-4 text-gray-400" />
                        </div>
                        <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} mt-1`}>{verse.text}</p>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all">
                  Ver todas as {strongData.occurrences.total} ocorrências
                </button>
              </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default StrongsModal;
