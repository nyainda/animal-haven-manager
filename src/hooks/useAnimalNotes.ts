import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { fetchAnimal } from '@/services/animalService';
import { fetchNotes, deleteNote, Note } from '@/services/noteApi';
import { Animal } from '@/types/AnimalTypes';

export const useAnimalNotes = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('all');

  // Load data effect
  useEffect(() => {
    if (!id) {
      navigate('/animals');
      return;
    }

    const loadData = async () => {
      setLoading(true);
      try {
        const animalData = await fetchAnimal(id);
        setAnimal(animalData);
        const notesData = await fetchNotes(id);
        setNotes(notesData);
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Failed to load animal data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, navigate]);

  // Computed values
  const noteCounts = useMemo(() => {
    const counts = { all: notes.length, pending: 0, completed: 0, archived: 0 };
    notes.forEach(note => {
      const status = note.status?.toLowerCase();
      if (status === 'pending') counts.pending++;
      if (status === 'completed') counts.completed++;
      if (status === 'archived') counts.archived++;
    });
    return counts;
  }, [notes]);

  const filteredNotes = useMemo(() => {
    const lowerCaseTab = activeTab.toLowerCase();
    if (lowerCaseTab === 'all') return notes;
    return notes.filter(note => note.status?.toLowerCase() === lowerCaseTab);
  }, [notes, activeTab]);

  // Handlers
  const handleDeleteNote = async (noteId: string) => {
    if (!id) return;
    try {
      await deleteNote(id, noteId);
      setNotes(notes.filter(note => note.notes_id !== noteId));
      toast.success('Note deleted successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete note';
      console.error('Error deleting note:', error);
      toast.error(message);
      throw error;
    }
  };

  return {
    id,
    animal,
    notes,
    loading,
    activeTab,
    setActiveTab,
    noteCounts,
    filteredNotes,
    handleDeleteNote,
    navigate
  };
};