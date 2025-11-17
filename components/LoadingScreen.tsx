
import React from 'react';
import { IconBookOpen } from '../constants';

interface LoadingScreenProps {
  status: 'initializing' | 'seeding';
  progress: {
    percentage: number;
    bookName: string;
  };
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ status, progress }) => {
  const messages = {
    initializing: 'Iniciando o aplicativo...',
    seeding: 'Preparando os textos sagrados para o primeiro uso. Isso pode levar um momento...',
  };

  const getMessage = () => {
    if (status === 'seeding' && progress.bookName) {
      return `Carregando ${progress.bookName}... (${progress.percentage}%)`;
    }
    return messages[status];
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4 bg-indigo-600">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-600 animate-gradient" />
      
      <div className="relative text-center text-white w-full max-w-sm">
        <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 bg-white/20 rounded-full blur-xl animate-pulse" />
            <IconBookOpen className="relative w-full h-full text-white" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Bíblia Sagrada</h1>

        {status === 'seeding' && (
          <div className="w-full bg-white/20 rounded-full h-2.5 my-4 transition-all duration-300">
            <div 
              className="bg-white h-2.5 rounded-full" 
              style={{ width: `${progress.percentage}%`, transition: 'width 0.5s ease' }}
            ></div>
          </div>
        )}

        <p className="opacity-80 h-10 flex items-center justify-center">{getMessage()}</p>
      </div>
    </div>
  );
};

export default LoadingScreen;
