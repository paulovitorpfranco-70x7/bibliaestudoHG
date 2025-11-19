import React, { useMemo, useState } from 'react';
import LoginScreen from '@/features/auth/screens/LoginScreen';
import HomeScreen from '@/features/home/screens/HomeScreen';
import ReaderScreen from '@/features/reader/screens/ReaderScreen';
import NotesScreen from '@/features/notes/screens/NotesScreen';
import LoadingScreen from '@/features/loading/screens/LoadingScreen';
import { useAppBootstrap } from '@/core/bootstrap/useAppBootstrap';
import { useTheme } from '@/core/theme/useTheme';
import { BibleRepositoryProvider } from '@/shared/contexts/BibleRepositoryContext';
import { container } from '@/infra/container';

export type Screen = 'login' | 'home' | 'reader' | 'notes';

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
  const { status, progress } = useAppBootstrap();
  const { isDarkMode, toggleTheme } = useTheme();
  const repository = useMemo(() => container.bibleRepository, []);

  if (status !== 'ready') {
    return <LoadingScreen status={status} progress={progress} />;
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case 'login':
        return <LoginScreen onLoginSuccess={() => setCurrentScreen('home')} />;
      case 'home':
        return (
          <HomeScreen
            onNavigateToReader={() => setCurrentScreen('reader')}
            onNavigateToNotes={() => setCurrentScreen('notes')}
            darkMode={isDarkMode}
            toggleTheme={toggleTheme}
          />
        );
      case 'reader':
        return <ReaderScreen onNavigateHome={() => setCurrentScreen('home')} darkMode={isDarkMode} />;
      case 'notes':
        return <NotesScreen onNavigateHome={() => setCurrentScreen('home')} darkMode={isDarkMode} />;
      default:
        return <LoginScreen onLoginSuccess={() => setCurrentScreen('home')} />;
    }
  };

  return (
    <BibleRepositoryProvider repository={repository}>
      <div className="font-sans">
        {renderScreen()}
      </div>
    </BibleRepositoryProvider>
  );
};

export default App;
