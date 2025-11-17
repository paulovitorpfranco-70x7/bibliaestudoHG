
import React, { useState, useEffect } from 'react';
import LoginScreen from './components/LoginScreen';
import HomeScreen from './components/HomeScreen';
import ReaderScreen from './components/ReaderScreen';
import NotesScreen from './components/NotesScreen';
import LoadingScreen from './components/LoadingScreen';
import { db } from './services/database';

type Screen = 'login' | 'home' | 'reader' | 'notes';
type AppStatus = 'initializing' | 'seeding' | 'ready';

interface ProgressState {
  percentage: number;
  bookName: string;
}

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
  const [appStatus, setAppStatus] = useState<AppStatus>('initializing');
  const [progress, setProgress] = useState<ProgressState>({ percentage: 0, bookName: '' });
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const savedTheme = localStorage.getItem('theme');
      return savedTheme === 'dark';
    }
    return false;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        const isPopulated = await db.isPopulated();
        if (!isPopulated) {
          setAppStatus('seeding');
          await db.populate((percentage, bookName) => {
            setProgress({ percentage, bookName });
          });
        }
        setAppStatus('ready');
      } catch (error) {
        console.error("Failed to initialize database:", error);
        // Handle error state if necessary
      }
    };
    initializeDatabase();
  }, []);

  if (appStatus !== 'ready') {
    return <LoadingScreen status={appStatus} progress={progress} />;
  }
  
  const renderScreen = () => {
    switch (currentScreen) {
      case 'login':
        return <LoginScreen onLoginSuccess={() => setCurrentScreen('home')} />;
      case 'home':
        return <HomeScreen onNavigateToReader={() => setCurrentScreen('reader')} onNavigateToNotes={() => setCurrentScreen('notes')} darkMode={darkMode} toggleTheme={() => setDarkMode(!darkMode)} />;
      case 'reader':
        return <ReaderScreen onNavigateHome={() => setCurrentScreen('home')} darkMode={darkMode} />;
      case 'notes':
        return <NotesScreen onNavigateHome={() => setCurrentScreen('home')} darkMode={darkMode} />;
      default:
        return <LoginScreen onLoginSuccess={() => setCurrentScreen('home')} />;
    }
  };

  return (
    <div className="font-sans">
      {renderScreen()}
    </div>
  );
};

export default App;
