
import React from 'react';
import type { Note } from '@/domain/models/bible';
import { IconChevronLeft, IconPlus, IconFileText, IconTrash2, IconSettings } from '@/ui/icons/IconSet';
import { useNotesController } from '@/features/notes/hooks/useNotesController';

interface NotesScreenProps {
  onNavigateHome: () => void;
  darkMode: boolean;
}

const NotesScreen: React.FC<NotesScreenProps> = ({ onNavigateHome, darkMode }) => {
  const {
    notes,
    isEditing,
    title,
    content,
    setTitle,
    setContent,
    startNewNote,
    editNote,
    cancelEditing,
    persistNote,
    deleteNote,
  } = useNotesController();

  const NoteItem: React.FC<{ note: Note }> = ({ note }) => (
    <div
      onClick={() => editNote(note)}
      className={`p-4 rounded-xl cursor-pointer transition-all duration-200 ${darkMode ? 'bg-gray-800 hover:bg-gray-700/80' : 'bg-white hover:bg-gray-50 shadow-sm border border-gray-100 dark:border-gray-700/50'}`}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1 min-w-0">
          <h3 className={`font-bold truncate ${darkMode ? 'text-white' : 'text-gray-800'}`}>{note.title}</h3>
          <p className={`text-sm mt-1 line-clamp-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {note.content.trim() ? note.content : 'Sem conteúdo adicional'}
          </p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (note.id && window.confirm('Tem certeza que deseja apagar esta anotação? A ação não pode ser desfeita.')) {
              deleteNote(note.id);
            }
          }}
          className={`ml-2 p-2 rounded-full transition-colors flex-shrink-0 ${darkMode ? 'hover:bg-red-900/50' : 'hover:bg-red-100'}`}
          aria-label="Apagar anotação"
        >
          <IconTrash2 className={`w-5 h-5 ${darkMode ? 'text-gray-500 hover:text-red-400' : 'text-gray-400 hover:text-red-600'}`} />
        </button>
      </div>
      <p className={`text-xs mt-3 text-right ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
        {new Date(note.updatedAt).toLocaleDateString()}
      </p>
    </div>
  );

  if (isEditing) {
    return (
      <div className={`min-h-screen flex flex-col transition-colors duration-300 ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
        <header className={`${darkMode ? 'bg-gray-800/95' : 'bg-white/95'} backdrop-blur-lg sticky top-0 z-40 shadow-sm`}>
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <button onClick={cancelEditing} className="flex items-center gap-2 hover:opacity-70 transition-opacity">
              <IconChevronLeft className={`w-5 h-5 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`} />
              <span className={`font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Anotações</span>
            </button>
            <button onClick={persistNote} className="bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
              Salvar
            </button>
          </div>
        </header>
        <main className="max-w-4xl w-full mx-auto px-4 py-8 flex-grow">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título da sua anotação..."
            className={`w-full bg-transparent text-3xl md:text-4xl font-bold focus:outline-none mb-6 ${darkMode ? 'text-white placeholder:text-gray-600' : 'text-gray-800 placeholder:text-gray-400'}`}
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Comece a escrever aqui..."
            className={`w-full h-full min-h-[50vh] bg-transparent text-lg focus:outline-none resize-none leading-relaxed ${darkMode ? 'text-gray-300 placeholder:text-gray-600' : 'text-gray-700 placeholder:text-gray-400'}`}
          />
        </main>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <header className={`${darkMode ? 'bg-gray-800/95' : 'bg-white/95'} backdrop-blur-lg sticky top-0 z-40 shadow-sm`}>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button onClick={onNavigateHome} className="flex items-center gap-2 hover:opacity-70 transition-opacity">
              <IconChevronLeft className={`w-5 h-5 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`} />
              <span className={`font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Início</span>
            </button>
            <div className="flex gap-2">
              <button className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors`}><IconSettings className={`w-5 h-5 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`} /></button>
            </div>
          </div>
          <div className="mt-4">
            <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Minhas Anotações</h1>
          </div>
        </div>
      </header>
      <main className="max-w-7xl w-full mx-auto px-4 py-8 flex-grow">
        {notes && notes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {notes.map(note => <NoteItem key={note.id} note={note} />)}
          </div>
        ) : (
          <div className="text-center py-16">
            <IconFileText className={`w-16 h-16 mx-auto ${darkMode ? 'text-gray-600' : 'text-gray-300'}`} />
            <h3 className={`mt-4 text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Nenhuma anotação ainda</h3>
            <p className={`mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Clique no botão '+' para criar sua primeira anotação.</p>
          </div>
        )}
      </main>
      <button
        onClick={startNewNote}
        className="fixed bottom-8 right-8 w-16 h-16 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-2xl flex items-center justify-center transition-transform hover:scale-110"
        aria-label="Criar nova anotação"
      >
        <IconPlus className="w-8 h-8" />
      </button>
    </div>
  );
};

export default NotesScreen;
