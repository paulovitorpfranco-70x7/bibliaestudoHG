import { useCallback, useMemo, useState } from 'react';
import type { Note } from '@/domain/models/bible';
import { useBibleRepository } from '@/shared/hooks/useBibleRepository';
import { useLiveQuery } from '@/data/datasources/BibleDexieDatasource';

export const useNotesController = () => {
  const repository = useBibleRepository();
  const noteQuery = useMemo(() => repository.watchNotes(), [repository]);
  const notes = useLiveQuery(noteQuery, [noteQuery]) ?? [];

  const [isEditing, setIsEditing] = useState(false);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const startNewNote = useCallback(() => {
    setCurrentNote(null);
    setTitle('Nova Anotação');
    setContent('');
    setIsEditing(true);
  }, []);

  const editNote = useCallback((note: Note) => {
    setCurrentNote(note);
    setTitle(note.title);
    setContent(note.content);
    setIsEditing(true);
  }, []);

  const cancelEditing = useCallback(() => {
    setIsEditing(false);
    setCurrentNote(null);
  }, []);

  const deleteNote = useCallback(async (noteId: number) => {
    await repository.deleteNote(noteId);
  }, [repository]);

  const persistNote = useCallback(async () => {
    if (!title.trim()) {
      alert('Por favor, insira um título.');
      return;
    }

    const now = Date.now();
    const payload: Note = {
      ...(currentNote ?? {}),
      title,
      content,
      createdAt: currentNote?.createdAt ?? now,
      updatedAt: now,
      id: currentNote?.id,
    };

    await repository.saveNote(payload);
    setIsEditing(false);
    setCurrentNote(null);
  }, [repository, title, content, currentNote]);

  return {
    notes,
    isEditing,
    title,
    content,
    setTitle,
    setContent,
    currentNote,
    startNewNote,
    editNote,
    cancelEditing,
    persistNote,
    deleteNote,
  };
};
