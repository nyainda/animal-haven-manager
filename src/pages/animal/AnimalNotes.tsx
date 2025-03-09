
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { 
  ArrowLeft, Plus, FileText, Loader2, Calendar, Edit, Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { fetchAnimal } from '@/services/animalService';
import { Animal } from '@/types/AnimalTypes';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { formatDistanceToNow } from 'date-fns';

// Temporary type for Notes
interface Note {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

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
        
        // For demo purposes, we'll create some mock notes
        // In a real implementation, this would fetch from the API
        // const notesData = await fetchAnimalNotes(id);
        setNotes([]);
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
    if (!noteToDelete) return;
    
    try {
      // In a real implementation, this would call an API endpoint
      // await deleteNote(id, noteToDelete.id);
      
      setNotes(notes.filter(note => note.id !== noteToDelete.id));
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
      <div className="container mx-auto py-6 px-4 max-w-4xl">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-lg">Loading animal data...</span>
        </div>
      </div>
    );
  }

  if (!animal) {
    return (
      <div className="container mx-auto py-6 px-4 max-w-4xl">
        <div className="bg-destructive/15 text-destructive p-4 rounded-md">
          <h2 className="text-lg font-medium">Error</h2>
          <p>Animal not found</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate('/animals')}>
            Back to Animals
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 max-w-4xl">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate(`/animals/${id}`)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Animal Details
        </Button>
      </div>
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Notes for {animal.name}</h1>
        <Button onClick={() => navigate(`/animals/${id}/notes/new`)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Note
        </Button>
      </div>
      
      {notes.length === 0 ? (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Notes History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-dashed p-8 text-center">
              <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Notes</h3>
              <p className="text-muted-foreground mb-4">
                No notes have been recorded for this animal yet.
              </p>
              <Button onClick={() => navigate(`/animals/${id}/notes/new`)}>
                Add Note
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {notes.map((note) => (
            <Card key={note.id}>
              <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div>
                  <CardTitle className="text-xl">{note.title}</CardTitle>
                  <div className="flex items-center text-sm text-muted-foreground mt-1">
                    <Calendar className="h-3.5 w-3.5 mr-1" />
                    {formatDistanceToNow(new Date(note.created_at), { addSuffix: true })}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate(`/animals/${id}/notes/${note.id}/edit`)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteClick(note)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-2">
                <p className="whitespace-pre-line">{note.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this note? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AnimalNotes;
