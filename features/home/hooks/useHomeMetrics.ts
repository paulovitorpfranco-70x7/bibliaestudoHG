import { useMemo } from 'react';
import { useLiveQuery } from '@/data/datasources/BibleDexieDatasource';
import { useBibleRepository } from '@/shared/hooks/useBibleRepository';

export const useHomeMetrics = () => {
  const repository = useBibleRepository();
  const noteQuery = useMemo(() => repository.watchNotes(), [repository]);
  const notes = useLiveQuery(noteQuery, [noteQuery]);
  return {
    noteCount: notes?.length ?? 0,
    loading: !notes,
  };
};
