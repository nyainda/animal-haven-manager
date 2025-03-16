import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { 
  ArrowLeft, Plus, FileText, Loader2, Calendar, Edit, Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { fetchAnimal } from '@/services/animalService';
import { fetchNotes, deleteNote, Note } from '@/services/noteApi';
import { Animal } from '@/types/AnimalTypes';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

const AnimalNotes: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<boolean>(false);
  const [noteToDelete, setNoteToDelete] = useState<Note | null>(null);

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

  const handleDeleteClick = (note: Note) => {
    setNoteToDelete(note);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!noteToDelete || !id) return;

    try {
      await deleteNote(id, noteToDelete.notes_id);
      setNotes(notes.filter(note => note.notes_id !== noteToDelete.notes_id));
      toast.success('Note deleted successfully');
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error('Failed to delete note');
    } finally {
      setDeleteConfirmOpen(false);
      setNoteToDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-background min-h-screen flex items-center justify-center py-6 px-4">
        <Card className="border-border shadow-md w-full max-w-md">
          <CardContent className="flex flex-col items-center gap-4 py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary sm:h-8 sm:w-8" />
            <p className="text-base font-sans text-foreground dark:text-foreground sm:text-lg">
              Loading notes...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!animal) {
    return (
      <div className="bg-background min-h-screen flex items-center justify-center py-6 px-4">
        <Card className="border-border shadow-md w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-lg font-serif text-destructive dark:text-destructive sm:text-xl">
              Oops!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground dark:text-muted-foreground sm:text-base">
              Animal not found.
            </p>
            <Button
              variant="outline"
              className="w-full font-serif text-primary dark:text-primary border-primary dark:border-primary hover:bg-primary/10 dark:hover:bg-primary/20 h-10 sm:h-12"
              onClick={() => navigate('/animals')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Animals
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between sm:gap-0">
          <div className="flex items-center gap-3 flex-wrap">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(`/animals/${id}`)}
              className="text-primary dark:text-primary hover:bg-primary/10 dark:hover:bg-primary/20 rounded-full h-10 w-10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-serif font-semibold text-foreground dark:text-foreground sm:text-2xl">
              Notes for <span className="text-primary dark:text-primary">{animal.name}</span>
            </h1>
          </div>
          <Button
            onClick={() => navigate(`/animals/${id}/notes/new`)}
            className="font-serif bg-primary text-primary-foreground dark:bg-primary dark:text-primary-foreground hover:bg-primary/90 dark:hover:bg-primary/80 h-10 w-full sm:w-auto sm:h-12"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Note
          </Button>
        </div>

        {/* Notes Section */}
        {notes.length === 0 ? (
          <Card className="border-border shadow-md">
            <CardHeader className="border-b border-border">
              <CardTitle className="text-lg font-serif text-foreground dark:text-foreground sm:text-xl">
                Notes
              </CardTitle>
            </CardHeader>
            <CardContent className="py-8 text-center">
              <FileText className="h-8 w-8 text-muted-foreground dark:text-muted-foreground mx-auto mb-4 sm:h-10 sm:w-10" />
              <h3 className="text-base font-sans font-medium text-foreground dark:text-foreground mb-2 sm:text-lg">
                No Notes Recorded
              </h3>
              <p className="text-sm text-muted-foreground dark:text-muted-foreground mb-6 max-w-md mx-auto">
                Start documenting {animal.name}’s journey by adding a note.
              </p>
              <Button
                onClick={() => navigate(`/animals/${id}/notes/new`)}
                className="font-serif bg-primary text-primary-foreground dark:bg-primary dark:text-primary-foreground hover:bg-primary/90 dark:hover:bg-primary/80 h-10 w-full max-w-xs mx-auto sm:h-12"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add a Note
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {notes.map((note) => (
              <Card key={note.notes_id} className="border-border shadow-md">
                <CardHeader className="flex flex-col gap-3 pb-4 border-b border-border sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <CardTitle className="text-base font-serif text-foreground dark:text-foreground sm:text-lg">
                        {note.category || 'Note'}
                      </CardTitle>
                      {note.category && (
                        <Badge variant="secondary" className="text-xs font-sans bg-muted text-muted-foreground dark:bg-muted dark:text-muted-foreground">
                          {note.category}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground dark:text-muted-foreground sm:text-sm">
                      <Calendar className="h-3 w-3 mr-1 sm:h-4 sm:w-4" />
                      {formatDistanceToNow(new Date(note.created_at), { addSuffix: true })}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/animals/${id}/notes/${note.notes_id}/edit`)}
                      className="font-sans text-primary dark:text-primary border-primary dark:border-primary hover:bg-primary/10 dark:hover:bg-primary/20 h-9 w-full sm:w-auto sm:h-10"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteClick(note)}
                      className="font-sans text-destructive dark:text-destructive border-destructive dark:border-destructive hover:bg-destructive/10 dark:hover:bg-destructive/20 h-9 w-full sm:w-auto sm:h-10"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <p className="text-sm text-foreground font-sans leading-relaxed whitespace-pre-line dark:text-foreground">
                    {note.content}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
          <DialogContent className="bg-background border-border shadow-md w-[90vw] max-w-md sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg font-serif text-foreground dark:text-foreground sm:text-xl">
                Confirm Deletion
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground dark:text-muted-foreground">
                Are you sure you want to delete this note? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button
                variant="outline"
                onClick={() => setDeleteConfirmOpen(false)}
                className="font-serif w-full text-foreground dark:text-foreground border-muted-foreground dark:border-muted-foreground hover:bg-muted/10 dark:hover:bg-muted/20 h-10 sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmDelete}
                className="font-serif w-full bg-destructive text-destructive-foreground dark:bg-destructive dark:text-destructive-foreground hover:bg-destructive/90 dark:hover:bg-destructive/80 h-10 sm:w-auto"
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AnimalNotes;