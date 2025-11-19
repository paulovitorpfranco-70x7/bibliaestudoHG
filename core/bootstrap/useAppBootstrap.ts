import { useEffect, useState } from 'react';
import type { ProgressCallback } from '@/infra/database/bibleDb';
import { bibleDatasource } from '@/data/datasources/BibleDexieDatasource';

export type AppStatus = 'initializing' | 'seeding' | 'ready';

interface ProgressState {
  percentage: number;
  bookName: string;
}

export const useAppBootstrap = () => {
  const [status, setStatus] = useState<AppStatus>('initializing');
  const [progress, setProgress] = useState<ProgressState>({ percentage: 0, bookName: '' });

  useEffect(() => {
    let cancelled = false;

    const initialize = async () => {
      try {
        const isPopulated = await bibleDatasource.isPopulated();
        if (!isPopulated && !cancelled) {
          setStatus('seeding');
          const onProgress: ProgressCallback = (percentage, bookName) => {
            if (!cancelled) {
              setProgress({ percentage, bookName });
            }
          };
          await bibleDatasource.populate(onProgress);
        }
        if (!cancelled) {
          setStatus('ready');
        }
      } catch (error) {
        console.error('Failed to bootstrap database', error);
        if (!cancelled) {
          setStatus('ready');
        }
      }
    };

    initialize();

    return () => {
      cancelled = true;
    };
  }, []);

  return { status, progress };
};
