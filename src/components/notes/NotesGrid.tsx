import React from 'react';
import NoteCard from './NoteCard';
import { Note } from '@/services/noteApi';

interface NotesGridProps {
  notes: Note[];
  animalId: string;
  onEdit: (noteId: string) => void;
  onDelete: (note: Note) => void;
  onViewContent: (content: string, category: string) => void;
}

const NotesGrid: React.FC<NotesGridProps> = ({ 
  notes, 
  animalId, 
  onEdit, 
  onDelete, 
  onViewContent 
}) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
    {notes.map((note) => (
      <NoteCard
        key={note.notes_id}
        note={note}
        animalId={animalId}
        onEdit={onEdit}
        onDelete={onDelete}
        onViewContent={onViewContent}
      />
    ))}
  </div>
);

export default NotesGrid;