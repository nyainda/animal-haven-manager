import React, { useState } from 'react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useAnimalNotes } from '@/hooks/useAnimalNotes';
import AnimalNotesHeader from '@/components/notes/AnimalNotesHeader';
import NotesTabsFilter from '@/components/notes/NotesTabsFilter';
import EmptyNotesState from '@/components/notes/EmptyNotesState';
import NotesGrid from '@/components/notes/NotesGrid';
import DeleteNoteDialog from '@/components/notes/DeleteNoteDialog';
import ContentViewDialog from '@/components/notes/ContentViewDialog';
import LoadingState from '@/components/notes/LoadingState';
import ErrorState from '@/components/notes/ErrorState';
import { Note } from '@/services/noteApi';

const AnimalNotes: React.FC = () => {
  const {
    id,
    animal,
    loading,
    activeTab,
    setActiveTab,
    noteCounts,
    filteredNotes,
    handleDeleteNote,
    navigate
  } = useAnimalNotes();

  // Dialog states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<Note | null>(null);
  const [contentDialogOpen, setContentDialogOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Handlers
  const handleAddNote = () => {
    if (!id) return;
    navigate(`/animals/${id}/notes/new`);
  };

  const handleEditNote = (noteId: string) => {
    if (!id || !noteId) return;
    navigate(`/animals/${id}/notes/${noteId}/edit`);
  };

  const handleDeleteClick = (note: Note) => {
    setNoteToDelete(note);
    setDeleteError(null);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!noteToDelete || !id) return;
    
    setIsDeleting(true);
    setDeleteError(null);
    
    try {
      await handleDeleteNote(noteToDelete.notes_id);
      setDeleteDialogOpen(false);
      setNoteToDelete(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete note';
      setDeleteError(message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleViewContent = (content: string, category: string) => {
    setSelectedContent(content);
    setSelectedCategory(category);
    setContentDialogOpen(true);
  };

  if (loading) return <LoadingState />;
  if (!animal) return <ErrorState onBack={() => navigate('/animals')} />;

  return (
    <TooltipProvider delayDuration={150}>
      <div className="bg-background min-h-screen py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <AnimalNotesHeader
            animal={animal}
            onBack={() => navigate(`/animals/${id}`)}
            onAddNote={handleAddNote}
          />

          <NotesTabsFilter
            activeTab={activeTab}
            onTabChange={setActiveTab}
            noteCounts={noteCounts}
          >
            {filteredNotes.length === 0 ? (
              <EmptyNotesState
                activeTab={activeTab}
                animalName={animal.name}
                onAddNote={handleAddNote}
              />
            ) : (
              <NotesGrid
                notes={filteredNotes}
                animalId={id!}
                onEdit={handleEditNote}
                onDelete={handleDeleteClick}
                onViewContent={handleViewContent}
              />
            )}
          </NotesTabsFilter>

          <DeleteNoteDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            noteToDelete={noteToDelete}
            isDeleting={isDeleting}
            deleteError={deleteError}
            onConfirmDelete={handleConfirmDelete}
          />

          <ContentViewDialog
            open={contentDialogOpen}
            onOpenChange={setContentDialogOpen}
            title={selectedCategory}
            content={selectedContent}
          />
        </div>
      </div>
    </TooltipProvider>
  );
};

export default AnimalNotes;