import React from 'react';
import { useReaderController } from '@/features/reader/hooks/useReaderController';
import ReaderView from '@/features/reader/components/ReaderView';

interface ReaderScreenProps {
  onNavigateHome: () => void;
  darkMode: boolean;
}

const ReaderScreen: React.FC<ReaderScreenProps> = ({ onNavigateHome, darkMode }) => {
  const controller = useReaderController();
  return <ReaderView controller={controller} onNavigateHome={onNavigateHome} darkMode={darkMode} />;
};

export default ReaderScreen;
