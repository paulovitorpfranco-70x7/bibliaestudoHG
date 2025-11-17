
import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../services/database';
import {
  IconBookOpen,
  IconUser,
  IconMenu,
  IconSearch,
  IconSun,
  IconMoon,
  IconShare2,
  IconHeart,
  IconSparkles,
  IconCalendar,
  IconFileText,
  IconFlame,
} from '../constants';

interface HomeScreenProps {
  onNavigateToReader: () => void;
  onNavigateToNotes: () => void;
  darkMode: boolean;
  toggleTheme: () => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigateToReader, onNavigateToNotes, darkMode, toggleTheme }) => {
  const noteCount = useLiveQuery(() => db.notes.count(), []);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50'}`}>
      <header className={`${darkMode ? 'bg-gray-800/95' : 'bg-white/95'} backdrop-blur-lg sticky top-0 z-40 shadow-sm`}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
              <IconMenu className={`w-6 h-6 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`} />
            </button>
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-2 rounded-lg">
                <IconBookOpen className="w-6 h-6 text-white" />
              </div>
              <span className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Bíblia Sagrada</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors`}>
              <IconSearch className={`w-5 h-5 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`} />
            </button>
            <button 
              onClick={toggleTheme}
              className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors`}
            >
              {darkMode ? <IconSun className="w-5 h-5 text-yellow-400" /> : <IconMoon className="w-5 h-5 text-gray-600" />}
            </button>
            <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center cursor-pointer">
              <IconUser className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="relative mb-8 rounded-3xl overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 animate-gradient" />
          <div className="absolute inset-0 bg-black/20" />
          <div className="relative p-8 md:p-12">
            <div className="flex items-center gap-2 mb-4">
              <IconSparkles className="w-5 h-5 text-yellow-300" />
              <span className="text-white/90 font-semibold">Versículo do Dia</span>
            </div>
            <p className="text-white text-2xl md:text-3xl font-serif leading-relaxed mb-4">
              "Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito..."
            </p>
            <p className="text-white/80 font-semibold">João 3:16</p>
            <div className="flex gap-3 mt-6">
              <button className="px-6 py-2 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all flex items-center gap-2">
                <IconShare2 className="w-4 h-4" /> Compartilhar
              </button>
              <button className="px-6 py-2 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all flex items-center gap-2">
                <IconHeart className="w-4 h-4" /> Favoritar
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <button onClick={onNavigateToReader} className={`${darkMode ? 'bg-gray-800 hover:bg-gray-700/50' : 'bg-white hover:shadow-xl'} rounded-2xl p-6 shadow-lg hover:-translate-y-2 transition-all duration-300 text-left group`}>
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <IconBookOpen className="w-8 h-8 text-white" />
            </div>
            <h3 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Continuar Leitura</h3>
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-3`}>Gênesis 1</p>
            <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
              <div className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full" style={{ width: '15%' }}></div>
            </div>
          </button>

          <div className={`${darkMode ? 'bg-gray-800 hover:bg-gray-700/50' : 'bg-white hover:shadow-xl'} rounded-2xl p-6 shadow-lg hover:-translate-y-2 transition-all duration-300 group cursor-pointer`}>
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <IconCalendar className="w-8 h-8 text-white" />
            </div>
            <h3 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Plano de Leitura</h3>
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-3`}>Bíblia em 1 ano</p>
            <div className="flex items-center gap-2"><span className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">Dia 15</span><span className={darkMode ? 'text-gray-500' : 'text-gray-400'}>de 365</span></div>
          </div>

          <div className={`${darkMode ? 'bg-gray-800 hover:bg-gray-700/50' : 'bg-white hover:shadow-xl'} rounded-2xl p-6 shadow-lg hover:-translate-y-2 transition-all duration-300 group cursor-pointer`}>
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <IconSearch className="w-8 h-8 text-white" />
            </div>
            <h3 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Pesquisa Avançada</h3>
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-3`}>Strong's, temas, versículos</p>
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold dark:bg-green-900/30 dark:text-green-400">Hebraico</span>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold dark:bg-blue-900/30 dark:text-blue-400">Grego</span>
            </div>
          </div>

          <button onClick={onNavigateToNotes} className={`${darkMode ? 'bg-gray-800 hover:bg-gray-700/50' : 'bg-white hover:shadow-xl'} rounded-2xl p-6 shadow-lg hover:-translate-y-2 transition-all duration-300 group text-left`}>
            <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <IconFileText className="w-8 h-8 text-white" />
            </div>
            <h3 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Minhas Anotações</h3>
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-3`}>
              {noteCount !== undefined ? `${noteCount} anotaç${noteCount === 1 ? 'ão' : 'ões'}` : 'Carregando...'}
            </p>
            <div className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Crie e gerencie seus estudos</div>
          </button>

          <button
            className={`${darkMode ? 'bg-gray-800 hover:bg-gray-700/50' : 'bg-white hover:shadow-xl'} rounded-2xl p-6 shadow-lg hover:-translate-y-2 transition-all duration-300 group text-left`}
          >
            <div className="w-16 h-16 bg-gradient-to-r from-fuchsia-500 via-rose-500 to-amber-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <IconFlame className="w-8 h-8 text-white" />
            </div>
            <h3 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Dons Espirituais</h3>
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
              Descubra e estude os dons listados em 1 Coríntios 12.
            </p>
            <div className="flex flex-wrap gap-2">
              {['Sabedoria', 'Profecia', 'Cura'].map((gift) => (
                <span
                  key={gift}
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    darkMode
                      ? 'bg-white/5 text-pink-200 border border-white/10'
                      : 'bg-rose-50 text-rose-600 border border-rose-100'
                  }`}
                >
                  {gift}
                </span>
              ))}
            </div>
          </button>
        </div>
      </main>
    </div>
  );
};

export default HomeScreen;
